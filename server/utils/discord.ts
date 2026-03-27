import type { DiscordScheduledEvent } from './types'

const DISCORD_API = 'https://discord.com/api/v10'

async function discordFetch<T>(path: string, options: {
  headers: Record<string, string>
  query?: Record<string, string | boolean>
}): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await $fetch<T>(`${DISCORD_API}${path}`, options)
    }
    catch (error: unknown) {
      const status = (error as { statusCode?: number }).statusCode
        ?? (error as { status?: number }).status

      if (status === 429 && attempt < 2) {
        const retryAfter = (error as { data?: { retry_after?: number } }).data?.retry_after ?? 2
        await new Promise(resolve => setTimeout(resolve, Math.min(retryAfter * 1000, 10_000)))
        continue
      }
      throw error
    }
  }

  throw new Error('Max retries exceeded')
}

export async function fetchGuildEvents(guildId: string): Promise<DiscordScheduledEvent[]> {
  const cacheKey = `cache:events:${guildId}`
  const cached = await useStorage('kv').getItem<DiscordScheduledEvent[]>(cacheKey)
  if (cached) return cached

  const config = useRuntimeConfig()
  const events = await discordFetch<DiscordScheduledEvent[]>(
    `/guilds/${guildId}/scheduled-events`,
    {
      headers: { Authorization: `Bot ${config.discordBotToken}` },
      query: { with_user_count: true },
    },
  )

  await useStorage('kv').setItem(cacheKey, events, { ttl: 1 })
  return events
}

export async function checkBotInGuild(guildId: string): Promise<boolean> {
  const cacheKey = `cache:bot-in-guild:${guildId}`
  const cached = await useStorage('kv').getItem<boolean>(cacheKey)
  if (cached !== null) return cached

  try {
    const config = useRuntimeConfig()
    await discordFetch(`/guilds/${guildId}`, {
      headers: { Authorization: `Bot ${config.discordBotToken}` },
    })
    await useStorage('kv').setItem(cacheKey, true, { ttl: 1 })
    return true
  }
  catch {
    return false
  }
}

export function buildBotInviteUrl(guildId?: string): string {
  const config = useRuntimeConfig()
  const params = new URLSearchParams({
    client_id: config.oauth.discord.clientId,
    permissions: '0',
    scope: 'bot',
    ...(guildId ? { guild_id: guildId } : {}),
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}
