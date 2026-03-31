export default defineEventHandler(async (event) => {
  const manageable = await getUserManageableGuilds(event)

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
