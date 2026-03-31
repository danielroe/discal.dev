export default defineEventHandler(async (event) => {
  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  await requireGuildAccess(event, guildId)
  await removeGuild(guildId)

  return { success: true }
})
