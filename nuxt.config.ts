export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/html-validator',
    '@nuxt/scripts',
    '@nuxt/fonts',
    '@nuxt/image',
    'nuxt-og-image',
    'nuxt-auth-utils',
    'reka-ui/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/test-utils',
  ],

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
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

  vite: { optimizeDeps: { include: ['reka-ui'] } },

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
