export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const client = event.context.atprotoClient
  if (!client) {
    throw createError({ statusCode: 503, message: 'AT Proto OAuth is not configured' })
  }

  // Step 1: No code = initial request, start the OAuth flow
  if (!query.code) {
    const handle = typeof query.handle === 'string' ? query.handle : undefined
    if (!handle) {
      throw createError({ statusCode: 400, message: 'Missing handle parameter' })
    }

    // Stash the guild ID in a cookie before redirecting
    if (query.guild && typeof query.guild === 'string') {
      setCookie(event, 'oauth-bluesky-guild', query.guild, {
        httpOnly: true,
        secure: !import.meta.dev,
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      })
    }

    const url = await client.authorize(handle)
    return sendRedirect(event, url.toString())
  }

  // Step 2: Callback with code, complete the OAuth flow
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value)
  }

  const { session } = await client.callback(params)
  const did = session.did

  // Fetch profile (public, no auth needed)
  let blueskyHandle: string | undefined
  try {
    const profile = await $fetch<{ handle: string, displayName?: string }>(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
    )
    blueskyHandle = profile.handle
  }
  catch {
    // best-effort
  }

  // Merge into existing session
  const existing = await getUserSession(event)
  await setUserSession(event, {
    user: {
      ...existing?.user,
      discordId: existing?.user?.discordId || '',
      name: existing?.user?.name || blueskyHandle || did,
      blueskyDid: did,
      blueskyHandle,
    },
    secure: {
      ...existing?.secure,
      atprotoDid: did,
    },
  })

  // Link to guild if applicable
  const guildId = getCookie(event, 'oauth-bluesky-guild')
  deleteCookie(event, 'oauth-bluesky-guild', { path: '/' })

  if (guildId) {
    const guild = await getGuild(guildId)
    if (guild) {
      guild.atprotoDid = did
      await setGuild(guild)
    }
    return sendRedirect(event, `/dashboard/${guildId}`)
  }

  return sendRedirect(event, '/dashboard')
})
