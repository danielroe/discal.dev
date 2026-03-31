export default defineEventHandler(async (event) => {
  const manageable = await getUserManageableGuilds(event)
  const manageableIds = new Set(manageable.map(g => g.id))

  const allGuilds = await getAllGuilds()
  return allGuilds.filter(g => manageableIds.has(g.id))
})
