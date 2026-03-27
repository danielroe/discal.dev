export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user.discordId) {
    throw createError({ statusCode: 403, message: 'Discord login required' })
  }

  const allGuilds = await getAllGuilds()
  return allGuilds.filter(g => g.addedBy === user.discordId)
})
