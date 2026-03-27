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
    )
    const needsRepublish = stored?.atprotoUri
      && stored.atprotoRecordVersion !== ATPROTO_RECORD_VERSION

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
      imageHash: de.image,
      userCount: de.user_count || 0,
      atprotoUri: stored?.atprotoUri || null,
      atprotoCid: stored?.atprotoCid || null,
      atprotoRecordVersion: stored?.atprotoRecordVersion || null,
      lastSyncedAt: now,
    }

    await setEvent(eventData)

    if (guild.atprotoDid && (isNew || isUpdated || needsRepublish)) {
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
        stored.status = 4
        stored.lastSyncedAt = now
        await setEvent(stored)

        if (guild.atprotoDid && stored.atprotoUri) {
          await publishEventToAtproto(h3Event, stored, guild)
        }
      }
    }
  }

  return published
}
