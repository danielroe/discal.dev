export default defineEventHandler(async (event) => {
  const guildId = getRouterParam(event, 'guildId')
  if (!guildId) {
    throw createError({ statusCode: 400, message: 'Missing guild ID' })
  }

  const guild = await requireGuildAccess(event, guildId)

  const body = await readBody<{ timezone?: string }>(event)
  if (body.timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: body.timezone })
      guild.timezone = body.timezone
    }
    catch {
      throw createError({ statusCode: 400, message: 'Invalid timezone' })
    }
  }

  await setGuild(guild)
  return guild
})
