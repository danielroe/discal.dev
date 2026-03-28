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

  const now = Date.now()
  const activeEvents = events
    .filter(e => e.status === 1 || e.status === 2)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const pastEvents = events
    .filter(e => e.status === 3 || (e.status !== 4 && new Date(e.startTime).getTime() < now))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 20) // Only show the 20 most recent past events

  return {
    guild: {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      timezone: guild.timezone,
      calendarSlug: guild.calendarSlug,
    },
    events: activeEvents,
    pastEvents,
  }
})
