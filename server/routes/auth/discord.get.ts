export default defineOAuthDiscordEventHandler({
  config: {
    scope: ['identify', 'guilds'],
  },
  async onSuccess(event, { user, tokens }) {
    const existing = await getUserSession(event)

    await setUserSession(event, {
      user: {
        ...existing?.user,
        discordId: String(user.id),
        name: user.global_name || user.username,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : undefined,
      },
      secure: {
        ...existing?.secure,
        discordAccessToken: tokens.access_token,
      },
    })
    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    console.error('Discord OAuth error:', error)
    return sendRedirect(event, '/?error=discord')
  },
})
