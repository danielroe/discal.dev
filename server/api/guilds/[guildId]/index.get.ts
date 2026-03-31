export default defineEventHandler(async (event) => {
  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  const guild = await requireGuildAccess(event, guildId)

  let atprotoSessionValid = false
  if (guild.atprotoDid) {
    const session = await useStorage('kv').getItem(`atproto:session:${guild.atprotoDid}`)
    atprotoSessionValid = !!session
  }

  const allEvents = await getGuildEvents(guildId)
  const upcoming = allEvents
    .filter(e => e.status === 1 || e.status === 2)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const past = allEvents
    .filter(e => e.status === 3 || e.status === 4)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  return {
    guild,
    events: upcoming,
    pastEvents: past,
    atprotoSessionValid,
  }
})
