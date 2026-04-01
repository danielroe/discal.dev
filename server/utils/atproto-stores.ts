import { NodeOAuthClient } from '@atproto/oauth-client-node'
import type { NodeSavedSession, NodeSavedSessionStore, NodeSavedStateStore } from '@atproto/oauth-client-node'

export function kvSessionStore(): NodeSavedSessionStore {
  return {
    async get(key: string): Promise<NodeSavedSession | undefined> {
      return (await useStorage('kv').getItem(`atproto:session:${key}`) as NodeSavedSession) ?? undefined
    },
    async set(key: string, val: NodeSavedSession): Promise<void> {
      await useStorage('kv').setItem(`atproto:session:${key}`, val)
    },
    async del(key: string): Promise<void> {
      await useStorage('kv').removeItem(`atproto:session:${key}`)
    },
  }
}

export function kvStateStore(): NodeSavedStateStore {
  return {
    async get(key: string) {
      return (await useStorage('kv').getItem(`atproto:state:${key}`)) as never ?? undefined
    },
    async set(key: string, val: Record<string, unknown>): Promise<void> {
      await useStorage('kv').setItem(`atproto:state:${key}`, val, { ttl: 600 })
    },
    async del(key: string): Promise<void> {
      await useStorage('kv').removeItem(`atproto:state:${key}`)
    },
  }
}

const _locks = new Map<string, Promise<unknown>>()

/**
 * Distributed lock for serialising token refresh operations.
 *
 * Uses KV-based locking with a 30-second TTL. If the lock cannot be
 * acquired after two attempts, proceeds without it.
 */
export async function distributedLock<T>(key: string, fn: () => T | PromiseLike<T>): Promise<T> {
  const lockKey = `lock:${key}`
  const lockId = Math.random().toString(36).slice(2)
  const kv = useStorage('kv')

  // In-memory lock for same-process concurrency
  while (_locks.has(key)) await _locks.get(key)

  // KV-based distributed lock with TTL (auto-expires after 30s to prevent deadlocks)
  let acquired = false
  const existing = await kv.getItem(lockKey)
  if (!existing) {
    await kv.setItem(lockKey, lockId, { ttl: 30 })
    const held = await kv.getItem(lockKey)
    if (held === lockId) acquired = true
  }

  if (!acquired) {
    // Wait briefly and retry once
    await new Promise(resolve => setTimeout(resolve, 100))
    const retryExisting = await kv.getItem(lockKey)
    if (!retryExisting) {
      await kv.setItem(lockKey, lockId, { ttl: 30 })
      const held = await kv.getItem(lockKey)
      if (held === lockId) acquired = true
    }
  }

  if (!acquired) {
    // Proceed without the lock — better than failing or force-acquiring
    return await fn()
  }

  const promise = Promise.resolve(fn()).finally(async () => {
    _locks.delete(key)
    // Only release if we still hold the lock
    const held = await kv.getItem(lockKey)
    if (held === lockId) {
      await kv.removeItem(lockKey)
    }
  })
  _locks.set(key, promise)
  return promise
}

export function createAtprotoClient(): NodeOAuthClient | null {
  const config = useRuntimeConfig()
  const blueskyConfig = config.oauth.bluesky as {
    scope?: string[]
    redirectUris?: string[]
  }

  const appUrl = config.public.appUrl as string
  // In production builds without a proper HTTPS appUrl (e.g. CI), skip client
  // creation as AT Proto OAuth validation will reject the metadata.
  if (!import.meta.dev && !appUrl.startsWith('https://')) {
    return null
  }

  const scopes = [...new Set(['atproto', ...blueskyConfig.scope ?? []])]
  const scope = scopes.join(' ')
  const redirectUri = `${appUrl}${blueskyConfig.redirectUris?.[0] ?? '/auth/bluesky'}`

  const clientId = import.meta.dev
    ? `http://localhost?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
    : `${appUrl}/bluesky/client-metadata.json`

  return new NodeOAuthClient({
    clientMetadata: {
      client_id: clientId,
      redirect_uris: [redirectUri],
      scope,
      grant_types: ['authorization_code', 'refresh_token'],
      application_type: 'web',
      token_endpoint_auth_method: 'none',
      dpop_bound_access_tokens: true,
    },
    sessionStore: kvSessionStore(),
    stateStore: kvStateStore(),
    requestLock: distributedLock,
  })
}
