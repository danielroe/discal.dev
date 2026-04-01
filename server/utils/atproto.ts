import { Agent } from '@atproto/api'
import type { H3Event } from 'h3'

import type { StoredEvent, StoredGuild } from './types'

const STATUS_MAP: Record<number, string> = {
  1: 'community.lexicon.calendar.event#scheduled',
  2: 'community.lexicon.calendar.event#scheduled',
  3: 'community.lexicon.calendar.event#completed',
  4: 'community.lexicon.calendar.event#cancelled',
}

const MODE_MAP: Record<number, string> = {
  1: 'community.lexicon.calendar.event#virtual',
  2: 'community.lexicon.calendar.event#virtual',
  3: 'community.lexicon.calendar.event#inperson',
}

// Increment this when the record format changes to force re-publishing
export const ATPROTO_RECORD_VERSION = 3

const RSVP_STATUS_MAP: Record<string, string> = {
  going: 'community.lexicon.calendar.rsvp#going',
  interested: 'community.lexicon.calendar.rsvp#interested',
  notgoing: 'community.lexicon.calendar.rsvp#notgoing',
}

export async function getAtprotoAgent(event: H3Event, did: string): Promise<Agent> {
  const client = event.context.atprotoClient
  if (!client) {
    throw new Error('AT Proto OAuth client is not available')
  }
  try {
    const session = await client.restore(did)
    return new Agent(session)
  }
  catch (error) {
    const message = String(error)
    // Only delete the session for truly unrecoverable errors.
    const unrecoverable = [
      'not issued to this client',
      'deleted by another process',
      'invalid_grant', // Refresh token was revoked by the user
      'unauthorized_client',
    ]
    if (unrecoverable.some(msg => message.includes(msg))) {
      await useStorage('kv').removeItem(`atproto:session:${did}`)
    }
    throw error
  }
}

function buildLocations(event: StoredEvent): Record<string, unknown>[] | undefined {
  if (!event.location) return undefined

  if (/^https?:\/\//.test(event.location)) {
    return [{ $type: 'community.lexicon.calendar.event#uri', uri: event.location, name: event.location }]
  }

  return [{ $type: 'community.lexicon.location.address', name: event.location, country: '' }]
}

function buildUris(event: StoredEvent, guild: StoredGuild): { uri: string, name: string }[] {
  const uris = [
    { uri: `https://discord.com/events/${guild.id}/${event.id}`, name: 'Discord Event' },
  ]

  // Voice/Stage channel link is more useful as a URI than a location
  if (event.channelId && (event.entityType === 1 || event.entityType === 2)) {
    uris.push({
      uri: `https://discord.com/channels/${event.guildId}/${event.channelId}`,
      name: 'Discord Channel',
    })
  }

  return uris
}

function toUtcZ(datetime: string): string {
  return new Date(datetime).toISOString()
}

export function discordEventToAtprotoRecord(event: StoredEvent, guild: StoredGuild) {
  return {
    $type: 'community.lexicon.calendar.event',
    name: event.name,
    description: event.description || '',
    createdAt: new Date().toISOString(),
    startsAt: toUtcZ(event.startTime),
    endsAt: event.endTime ? toUtcZ(event.endTime) : undefined,
    status: STATUS_MAP[event.status],
    mode: MODE_MAP[event.entityType],
    locations: buildLocations(event),
    uris: buildUris(event, guild),
  }
}

export async function publishEventToAtproto(
  h3Event: H3Event,
  event: StoredEvent,
  guild: StoredGuild,
): Promise<{ uri: string, cid: string } | null> {
  if (!guild.atprotoDid) return null

  try {
    const agent = await getAtprotoAgent(h3Event, guild.atprotoDid)
    const record = discordEventToAtprotoRecord(event, guild)

    if (event.atprotoUri) {
      const rkey = event.atprotoUri.split('/').pop()!
      const result = await agent.com.atproto.repo.putRecord({
        repo: guild.atprotoDid,
        collection: 'community.lexicon.calendar.event',
        rkey,
        record,
      })
      return { uri: result.data.uri, cid: result.data.cid }
    }

    const result = await agent.com.atproto.repo.createRecord({
      repo: guild.atprotoDid,
      collection: 'community.lexicon.calendar.event',
      record,
    })
    return { uri: result.data.uri, cid: result.data.cid }
  }
  catch (error) {
    console.error(`Failed to publish event ${event.id} to AT Proto:`, error)
    return null
  }
}

async function findExistingRsvpRkey(
  agent: Agent,
  userDid: string,
  eventUri: string,
): Promise<string | null> {
  try {
    const { data } = await agent.com.atproto.repo.listRecords({
      repo: userDid,
      collection: 'community.lexicon.calendar.rsvp',
      limit: 100,
    })

    const existing = data.records.find((r) => {
      const val = r.value as { subject?: { uri?: string } }
      return val.subject?.uri === eventUri
    })
    return existing?.uri.split('/').pop() ?? null
  }
  catch {
    return null
  }
}

export async function createAtprotoRsvp(
  h3Event: H3Event,
  userDid: string,
  eventUri: string,
  eventCid: string,
  status: 'going' | 'interested' | 'notgoing',
): Promise<{ uri: string, cid: string } | null> {
  try {
    const agent = await getAtprotoAgent(h3Event, userDid)
    const record = {
      $type: 'community.lexicon.calendar.rsvp',
      subject: { uri: eventUri, cid: eventCid },
      status: RSVP_STATUS_MAP[status],
      createdAt: new Date().toISOString(),
    }

    const existingRkey = await findExistingRsvpRkey(agent, userDid, eventUri)
    if (existingRkey) {
      const result = await agent.com.atproto.repo.putRecord({
        repo: userDid,
        collection: 'community.lexicon.calendar.rsvp',
        rkey: existingRkey,
        record,
      })
      return { uri: result.data.uri, cid: result.data.cid }
    }

    const result = await agent.com.atproto.repo.createRecord({
      repo: userDid,
      collection: 'community.lexicon.calendar.rsvp',
      record,
    })
    return { uri: result.data.uri, cid: result.data.cid }
  }
  catch (error) {
    console.error(`Failed to create RSVP for ${userDid}:`, error)
    return null
  }
}
