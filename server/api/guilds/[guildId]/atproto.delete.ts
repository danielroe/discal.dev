export default defineEventHandler(async (event) => {
  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  const guild = await requireGuildAccess(event, guildId)

  guild.atprotoDid = null
  await setGuild(guild)

  return { ok: true }
})
