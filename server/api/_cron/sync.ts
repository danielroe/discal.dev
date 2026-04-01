export default defineEventHandler(async (h3Event) => {
  const guilds = await getAllGuilds()
  const results = {
    guilds: guilds.length,
    synced: 0,
    published: 0,
    errors: [] as string[],
  }

  for (const guild of guilds) {
    try {
      const published = await syncGuildEvents(h3Event, guild.id)
      results.synced++
      results.published += published
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.errors.push(`Guild ${guild.id}: ${message}`)
      console.error(`Sync failed for guild ${guild.id}:`, error)
    }
  }

  return results
})

async function syncGuildEvents(h3Event: Parameters<typeof publishEventToAtproto>[0], guildId: string): Promise<number> {
  const guild = await getGuild(guildId)
  if (!guild) return 0

  // Refresh guild name and icon from Discord
  const guildInfo = await fetchGuildInfo(guildId)
  if (guildInfo) {
    let updated = false
    if (guildInfo.name !== guild.name) {
      guild.name = guildInfo.name
      updated = true
    }
    if (guildInfo.icon !== guild.icon) {
      guild.icon = guildInfo.icon
      updated = true
    }
    if (updated) {
      await setGuild(guild)
    }
  }

  // Keep the atproto session alive by calling restore() on each sync.
  if (guild.atprotoDid) {
    try {
      await getAtprotoAgent(h3Event, guild.atprotoDid)
    }
    catch (error) {
      console.error(`AT Proto session refresh failed for guild ${guildId}:`, error)
    }
  }

  let published = 0
  const discordEvents = await fetchGuildEvents(guildId)
  const storedEventIndex = await getEventIndex(guildId)
  const storedEventIds = new Set(storedEventIndex)
  const discordEventIds = new Set(discordEvents.map(e => e.id))
  const now = new Date().toISOString()

  for (const de of discordEvents) {
    const stored = await getEvent(guildId, de.id)
    const isNew = !stored
    const isUpdated = stored && (
      stored.name !== de.name
      || stored.description !== de.description
      || stored.startTime !== de.scheduled_start_time
      || stored.endTime !== de.scheduled_end_time
      || stored.status !== de.status
      || (stored.location || null) !== (de.entity_metadata?.location || null)
      || JSON.stringify(stored.recurrenceRule) !== JSON.stringify(de.recurrence_rule)
      || JSON.stringify(stored.exceptions) !== JSON.stringify(de.guild_scheduled_event_exceptions)
    )
    const needsPublish = !stored?.atprotoUri
    const needsRepublish = stored?.atprotoUri
      && stored.atprotoRecordVersion !== ATPROTO_RECORD_VERSION

    // Convert Discord event exceptions to stored format.
    // Each exception has a modified start time; the original occurrence time
    // is inferred by taking the exception's date with the series anchor's
    // time-of-day from recurrence_rule.start.
    const exceptions = de.guild_scheduled_event_exceptions?.map((ex) => {
      const exStart = new Date(ex.scheduled_start_time)
      let originalStartTime = ex.scheduled_start_time
      if (de.recurrence_rule) {
        const seriesAnchor = new Date(de.recurrence_rule.start)
        const original = new Date(exStart)
        original.setUTCHours(seriesAnchor.getUTCHours())
        original.setUTCMinutes(seriesAnchor.getUTCMinutes())
        original.setUTCSeconds(seriesAnchor.getUTCSeconds())
        original.setUTCMilliseconds(0)
        originalStartTime = original.toISOString()
      }
      return {
        originalStartTime,
        startTime: ex.scheduled_start_time,
        endTime: ex.scheduled_end_time,
        isCanceled: ex.is_canceled,
      }
    })

    const eventData: StoredEvent = {
      id: de.id,
      guildId,
      name: de.name,
      description: de.description,
      location: de.entity_metadata?.location || null,
      channelId: de.channel_id,
      startTime: de.scheduled_start_time,
      endTime: de.scheduled_end_time,
      entityType: de.entity_type,
      status: de.status,
      recurrenceRule: de.recurrence_rule,
      exceptions,
      imageHash: de.image,
      userCount: de.user_count || 0,
      atprotoUri: stored?.atprotoUri || null,
      atprotoCid: stored?.atprotoCid || null,
      atprotoRecordVersion: stored?.atprotoRecordVersion || null,
      lastSyncedAt: now,
    }

    await setEvent(eventData)

    if (guild.atprotoDid && (isNew || isUpdated || needsPublish || needsRepublish)) {
      const result = await publishEventToAtproto(h3Event, eventData, guild)
      if (result) {
        eventData.atprotoUri = result.uri
        eventData.atprotoCid = result.cid
        eventData.atprotoRecordVersion = ATPROTO_RECORD_VERSION
        await setEvent(eventData)
        published++
      }
    }
  }

  for (const storedId of storedEventIds) {
    if (!discordEventIds.has(storedId)) {
      const stored = await getEvent(guildId, storedId)
      if (stored && (stored.status === 1 || stored.status === 2)) {
        const eventStarted = new Date(stored.startTime).getTime() <= Date.now()
        stored.status = eventStarted ? 3 /* completed */ : 4 /* cancelled */
        stored.lastSyncedAt = now
        await setEvent(stored)

        if (guild.atprotoDid && stored.atprotoUri) {
          await publishEventToAtproto(h3Event, stored, guild)
        }
      }
    }
  }

  // Clean up events older than 90 days that are completed or canceled
  const CLEANUP_AGE_MS = 90 * 24 * 60 * 60 * 1000
  for (const storedId of storedEventIds) {
    const stored = await getEvent(guildId, storedId)
    if (stored && (stored.status === 3 || stored.status === 4)) {
      const age = Date.now() - new Date(stored.startTime).getTime()
      if (age > CLEANUP_AGE_MS) {
        await removeEvent(guildId, storedId)
      }
    }
  }

  return published
}
