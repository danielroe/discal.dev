export default defineEventHandler(async (event) => {
  const { user, secure } = await requireUserSession(event)
  if (!user.blueskyDid || !secure?.atprotoDid) {
    throw createError({ statusCode: 401, message: 'AT Protocol login required' })
  }

  const body = await readBody<{
    eventId: string
    guildId: string
    status: 'going' | 'interested' | 'notgoing'
  }>(event)

  if (!body.eventId || !body.guildId || !body.status) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const storedEvent = await getEvent(body.guildId, body.eventId)
  if (!storedEvent) {
    throw createError({ statusCode: 404, message: 'Event not found' })
  }
  if (!storedEvent.atprotoUri || !storedEvent.atprotoCid) {
    throw createError({ statusCode: 400, message: 'Event is not published to AT Protocol yet' })
  }

  const result = await createAtprotoRsvp(event, secure.atprotoDid, storedEvent.atprotoUri, storedEvent.atprotoCid, body.status)
  if (!result) {
    throw createError({ statusCode: 500, message: 'Failed to create RSVP' })
  }

  return result
})
