export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  if (!eventId) {
    throw createError({ statusCode: 400, message: 'Missing event ID' })
  }

  for (const guildId of await getGuildIndex()) {
    const storedEvent = await getEvent(guildId, eventId)
    if (!storedEvent) continue

    const guild = await getGuild(guildId)
    if (!guild) continue

    return {
      event: storedEvent,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        timezone: guild.timezone,
        calendarSlug: guild.calendarSlug,
        atprotoDid: guild.atprotoDid,
      },
    }
  }

  throw createError({ statusCode: 404, message: 'Event not found' })
})
