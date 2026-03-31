export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user.discordId) {
    throw createError({ statusCode: 403, message: 'Discord login required' })
  }

  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  const guild = await getGuild(guildId)
  if (!guild) {
    throw createError({ statusCode: 404, message: 'Guild not found' })
  }
  if (guild.addedBy !== user.discordId) {
    throw createError({ statusCode: 403, message: 'Not authorized' })
  }

  await removeGuild(guildId)

  return { success: true }
})
