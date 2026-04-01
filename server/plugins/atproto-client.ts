import type { NodeOAuthClient } from '@atproto/oauth-client-node'

/**
 * Creates a long-lived NodeOAuthClient instance at server startup.
 */
export default defineNitroPlugin((nitroApp) => {
  const client = createAtprotoClient()

  nitroApp.hooks.hook('request', (event) => {
    event.context.atprotoClient = client
  })
})

declare module 'h3' {
  interface H3EventContext {
    atprotoClient: NodeOAuthClient
  }
}
