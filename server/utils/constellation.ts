const CONSTELLATION_API = 'https://constellation.microcosm.blue'

interface ConstellationBacklink {
  did: string
  collection: string
  rkey: string
}

interface ConstellationResponse {
  total: number
  records: ConstellationBacklink[]
  cursor: string | null
}

export interface EventRsvp {
  did: string
  rkey: string
  handle?: string
  displayName?: string
  avatar?: string
}

export async function fetchEventRsvps(eventAtUri: string): Promise<{ rsvps: EventRsvp[], total: number }> {
  const response = await $fetch<ConstellationResponse>(
    `${CONSTELLATION_API}/xrpc/blue.microcosm.links.getBacklinks`,
    {
      query: {
        subject: eventAtUri,
        source: 'community.lexicon.calendar.rsvp:subject.uri',
        limit: 50,
      },
    },
  )

  const rsvps: EventRsvp[] = await Promise.all(
    response.records.map(async (record) => {
      const rsvp: EventRsvp = { did: record.did, rkey: record.rkey }

      try {
        const profile = await $fetch<{ handle: string, displayName?: string, avatar?: string }>(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile`,
          { query: { actor: record.did } },
        )
        rsvp.handle = profile.handle
        rsvp.displayName = profile.displayName
        rsvp.avatar = profile.avatar
      }
      catch {
        // profile fetch is best-effort
      }

      return rsvp
    }),
  )

  return { rsvps, total: response.total }
}
