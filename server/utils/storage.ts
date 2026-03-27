import type { StoredEvent, StoredGuild } from './types'

function kv() {
  return useStorage('kv')
}

export async function getGuild(guildId: string): Promise<StoredGuild | null> {
  return await kv().getItem<StoredGuild>(`guild:${guildId}`) ?? null
}

export async function setGuild(guild: StoredGuild): Promise<void> {
  await kv().setItem(`guild:${guild.id}`, guild)

  const index = await getGuildIndex()
  if (!index.includes(guild.id)) {
    index.push(guild.id)
    await kv().setItem('guild:index', index)
  }

  await kv().setItem(`slug:${guild.calendarSlug}`, guild.id)
}

export async function getGuildIndex(): Promise<string[]> {
  return await kv().getItem<string[]>('guild:index') ?? []
}

export async function getGuildBySlug(slug: string): Promise<StoredGuild | null> {
  const guildId = await kv().getItem<string>(`slug:${slug}`)
  if (!guildId) return null
  return getGuild(guildId)
}

export async function getAllGuilds(): Promise<StoredGuild[]> {
  const index = await getGuildIndex()
  const guilds = await Promise.all(index.map(id => getGuild(id)))
  return guilds.filter((g): g is StoredGuild => g !== null)
}

export async function getEvent(guildId: string, eventId: string): Promise<StoredEvent | null> {
  return await kv().getItem<StoredEvent>(`event:${guildId}:${eventId}`) ?? null
}

export async function setEvent(event: StoredEvent): Promise<void> {
  await kv().setItem(`event:${event.guildId}:${event.id}`, event)

  const index = await getEventIndex(event.guildId)
  if (!index.includes(event.id)) {
    index.push(event.id)
    await kv().setItem(`events:${event.guildId}`, index)
  }
}

export async function removeEvent(guildId: string, eventId: string): Promise<void> {
  await kv().removeItem(`event:${guildId}:${eventId}`)

  const index = await getEventIndex(guildId)
  await kv().setItem(`events:${guildId}`, index.filter(id => id !== eventId))
}

export async function getEventIndex(guildId: string): Promise<string[]> {
  return await kv().getItem<string[]>(`events:${guildId}`) ?? []
}

export async function getGuildEvents(guildId: string): Promise<StoredEvent[]> {
  const index = await getEventIndex(guildId)
  const events = await Promise.all(index.map(id => getEvent(guildId, id)))
  return events.filter((e): e is StoredEvent => e !== null)
}

export function generateSlug(guildName: string): string {
  const base = guildName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}
