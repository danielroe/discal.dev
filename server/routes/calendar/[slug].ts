export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug?.endsWith('.ics')) {
    return
  }

  const calendarSlug = slug.slice(0, -4)
  if (!calendarSlug) {
    throw createError({ statusCode: 400, message: 'Missing calendar slug' })
  }

  const guild = await getGuildBySlug(calendarSlug)
  if (!guild) {
    throw createError({ statusCode: 404, message: 'Calendar not found' })
  }

  const events = await getGuildEvents(guild.id)

  setResponseHeaders(event, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `inline; filename="${calendarSlug}.ics"`,
    'Cache-Control': 'public, max-age=300',
  })

  return generateCalendar(guild, events)
})
