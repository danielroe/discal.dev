import type { H3Event } from 'h3'

interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

const MANAGE_GUILD = 0x20n

/**
 * Fetch the list of Discord guilds the current user can manage.
 * Caches per-request via event context to avoid duplicate Discord API calls.
 */
export async function getUserManageableGuilds(event: H3Event): Promise<DiscordGuild[]> {
  // Return cached result if already fetched this request
  if (event.context._manageableGuilds) {
    return event.context._manageableGuilds as DiscordGuild[]
  }

  const { user, secure } = await requireUserSession(event)
  if (!user.discordId || !secure?.discordAccessToken) {
    throw createError({ statusCode: 403, message: 'Discord login required' })
  }

  let discordGuilds: DiscordGuild[]
  try {
    discordGuilds = await $fetch<DiscordGuild[]>(
      'https://discord.com/api/v10/users/@me/guilds',
      { headers: { Authorization: `Bearer ${secure.discordAccessToken}` } },
    )
  }
  catch (error: unknown) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      throw createError({ statusCode: 401, message: 'Discord token expired. Please sign in again.' })
    }
    throw error
  }

  const manageable = discordGuilds.filter((g) => {
    const perms = BigInt(g.permissions)
    return g.owner || (perms & MANAGE_GUILD) === MANAGE_GUILD
  })

  event.context._manageableGuilds = manageable
  return manageable
}

/**
 * Verify the current user has MANAGE_GUILD permission on the given guild.
 * Returns the stored guild if access is granted, throws 403 otherwise.
 */
export async function requireGuildAccess(event: H3Event, guildId: string) {
  const guild = await getGuild(guildId)
  if (!guild) {
    throw createError({ statusCode: 404, message: 'Guild not found' })
  }

  const manageable = await getUserManageableGuilds(event)
  const hasAccess = manageable.some(g => g.id === guildId)
  if (!hasAccess) {
    throw createError({ statusCode: 403, message: 'Not authorized to manage this server' })
  }

  return guild
}
