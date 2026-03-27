export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user.discordId || !secure?.discordAccessToken) {
    throw createError({ statusCode: 403, message: 'Discord login required' })
  }

  let discordGuilds
  try {
    discordGuilds = await $fetch<Array<{
      id: string
      name: string
      icon: string | null
      owner: boolean
      permissions: string
    }>>('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${secure.discordAccessToken}` },
    })
  }
  catch (error: unknown) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      throw createError({ statusCode: 401, message: 'Discord token expired. Please sign in again.' })
    }
    throw error
  }

  const MANAGE_GUILD = 0x20n
  const manageable = discordGuilds.filter((g) => {
    const perms = BigInt(g.permissions)
    return g.owner || (perms & MANAGE_GUILD) === MANAGE_GUILD
  })

  const results = []
  for (const g of manageable) {
    const registered = await getGuild(g.id)
    results.push({
      id: g.id,
      name: g.name,
      icon: g.icon,
      registered: !!registered,
      botPresent: registered ? false : await checkBotInGuild(g.id),
      calendarSlug: registered?.calendarSlug ?? null,
    })
  }

  return results
})
