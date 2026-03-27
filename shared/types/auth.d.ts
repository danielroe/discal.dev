declare module '#auth-utils' {
  interface User {
    discordId: string
    name: string
    avatar?: string
    blueskyDid?: string
    blueskyHandle?: string
  }

  interface UserSession {
    /** Guild ID context, if the user came from adding a bot */
    linkedGuildId?: string
  }

  interface SecureSessionData {
    /** Discord access token for API calls */
    discordAccessToken?: string
    /** AT Protocol DID for writing records */
    atprotoDid?: string
  }
}

export {}
