export default defineEventHandler(async (event) => {
  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  const guild = await getGuild(guildId)
  if (!guild) {
    throw createError({ statusCode: 404, message: 'Guild not found' })
  }

  let atprotoSessionValid = false
  if (guild.atprotoDid) {
    const session = await useStorage('kv').getItem(`atproto:session:${guild.atprotoDid}`)
    atprotoSessionValid = !!session
  }

  return {
    guild,
    events: await getGuildEvents(guildId),
    atprotoSessionValid,
  }
})
