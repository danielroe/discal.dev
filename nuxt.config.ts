export default defineNuxtConfig({
  modules: [
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
    '@unocss/reset/tailwind.css',
    '~/assets/css/global.css',
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

  routeRules: {
    '/_og/s/c_Discal.png': { prerender: true },
  },

  experimental: {
    typedPages: true,
    viewTransition: true,
  },

  typescript: {
    nodeTsConfig: {
      include: ['../vite.config.ts']
    }
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

  htmlValidator: {
    failOnError: true,
  },

  pwa: {
    manifest: {
      name: 'discal.dev',
      short_name: 'discal',
      description: 'Subscribe to Discord server events via ICS calendar feeds',
      theme_color: '#ec4899',
      background_color: '#ffffff',
    },
    pwaAssets: {
      config: true,
    },
  },
})
