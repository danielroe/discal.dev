export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user.discordId) {
    throw createError({ statusCode: 403, message: 'Discord login required' })
  }

  const body = await readBody<{ guildId: string, guildName?: string, guildIcon?: string | null }>(event)
  if (!body.guildId) {
    throw createError({ statusCode: 400, message: 'Missing guildId' })
  }

  // Verify the user has MANAGE_GUILD permission on this server
  const manageable = await getUserManageableGuilds(event)
  if (!manageable.some(g => g.id === body.guildId)) {
    throw createError({ statusCode: 403, message: 'Not authorized to manage this server' })
  }

  // If already registered, return existing (any authorized admin can see it)
  const existing = await getGuild(body.guildId)
  if (existing) return existing

  if (!await checkBotInGuild(body.guildId)) {
    throw createError({
      statusCode: 400,
      message: 'Cannot access this guild. Make sure the discal bot has been added to the server first.',
    })
  }

  const guild: StoredGuild = {
    id: body.guildId,
    name: body.guildName || `Guild ${body.guildId}`,
    icon: body.guildIcon ?? null,
    addedBy: user.discordId,
    atprotoDid: null,
    timezone: 'UTC',
    calendarSlug: generateSlug(body.guildName || body.guildId),
    createdAt: new Date().toISOString(),
  }

  await setGuild(guild)
  fetchGuildEvents(body.guildId).catch(() => {})

  return guild
})
