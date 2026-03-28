export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/html-validator',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    'nuxt-og-image',
    'nuxt-auth-utils',
    'reka-ui/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/test-utils',
    '@unocss/nuxt',
  ],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  css: [
    '@unocss/reset/tailwind-compat.css',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
  },

  runtimeConfig: {
    discordBotToken: '',
    session: {
      maxAge: 60 * 60 * 24 * 7,
      password: '',
    },
    oauth: {
      discord: {
        clientId: '',
        clientSecret: '',
      },
      bluesky: {
        scope: ['atproto', 'repo:community.lexicon.calendar.event', 'repo:community.lexicon.calendar.rsvp'],
        redirectUris: ['/auth/bluesky'],
      },
    },
    public: {
      appUrl: 'http://localhost:3000',
      discordClientId: '',
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    typedPages: true,
    viewTransition: true,
  },

  compatibilityDate: '2024-04-03',

  nitro: {
    vercel: {
      config: {
        crons: [
          {
            path: '/api/_cron/sync',
            schedule: '*/5 * * * *',
          },
        ],
      },
    },
    storage: {
      kv: {
        driver: 'upstash',
        base: 'discal',
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      },
    },
    devStorage: {
      kv: {
        driver: 'fs',
        base: '.data/kv',
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['reka-ui'],
    },
  },

  auth: {
    atproto: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  htmlValidator: {
    failOnError: true,
  },

  pwa: {
    manifest: {
      name: 'discal.dev',
      short_name: 'discal',
      description: 'Subscribe to Discord server events via ICS calendar feeds',
      theme_color: '#7c3aed',
      background_color: '#ffffff',
    },
    pwaAssets: {
      config: true,
    },
  },
})
