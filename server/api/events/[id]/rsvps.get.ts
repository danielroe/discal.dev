export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  if (!eventId) {
    throw createError({ statusCode: 400, message: 'Missing event ID' })
  }

  let storedEvent: StoredEvent | null = null
  for (const guildId of await getGuildIndex()) {
    storedEvent = await getEvent(guildId, eventId)
    if (storedEvent) break
  }

  if (!storedEvent) {
    throw createError({ statusCode: 404, message: 'Event not found' })
  }

  if (!storedEvent.atprotoUri) {
    return { rsvps: [], total: 0, currentUserRsvp: null }
  }

  // Fetch RSVPs from Constellation (network-wide)
  const { rsvps, total } = await fetchEventRsvps(storedEvent.atprotoUri)

  // Check if the current user has an RSVP (directly from their PDS, not Constellation)
  let currentUserRsvp: { status: string } | null = null
  try {
    const session = await getUserSession(event)
    const did = session.secure?.atprotoDid
    if (did) {
      const agent = await getAtprotoAgent(event, did)
      const { data } = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'community.lexicon.calendar.rsvp',
        limit: 100,
      })
      const existing = data.records.find((r) => {
        const val = r.value as { subject?: { uri?: string } }
        return val.subject?.uri === storedEvent!.atprotoUri
      })
      if (existing) {
        const val = existing.value as { status?: string }
        currentUserRsvp = { status: val.status || 'unknown' }

        // Ensure the user appears in the RSVP list even if Constellation hasn't indexed it yet
        if (!rsvps.some(r => r.did === did)) {
          let handle: string | undefined
          let displayName: string | undefined
          let avatar: string | undefined
          try {
            const profile = await $fetch<{ handle: string, displayName?: string, avatar?: string }>(
              'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile',
              { query: { actor: did } },
            )
            handle = profile.handle
            displayName = profile.displayName
            avatar = profile.avatar
          }
          catch {
            // best-effort
          }
          rsvps.unshift({ did, rkey: existing.uri.split('/').pop()!, handle, displayName, avatar })
        }
      }
    }
  }
  catch {
    // User not logged in with AT Proto, or session invalid — that's fine
  }

  return { rsvps, total: Math.max(total, rsvps.length), currentUserRsvp }
})
