export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing calendar slug' })
  }

  const guild = await getGuildBySlug(slug)
  if (!guild) {
    throw createError({ statusCode: 404, message: 'Calendar not found' })
  }

  const events = await getGuildEvents(guild.id)

  return {
    guild: {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      timezone: guild.timezone,
      calendarSlug: guild.calendarSlug,
    },
    events: events
      .filter(e => e.status === 1 || e.status === 2)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
  }
})
