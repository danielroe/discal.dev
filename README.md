# discal.dev

> Your Discord events, everywhere.

discal.dev is a free and open-source web app that bridges Discord server events to standard calendar apps and the decentralized atproto ecosystem.

Subscribe to any registered server's events in Google Calendar, Apple Calendar, Outlook, or any ICS-compatible app -- and optionally publish them to the atmosphere.

- 👉 [Check it out](https://discal.dev/)
- ➕ [Add the bot to your server](https://discal.dev/dashboard)

## Features

- **auto-updating calendar feeds** -- Each registered server gets a subscribable `.ics` feed that stays in sync with Discord events, updated every 5 minutes.
- **atproto integration** -- Optionally connect a Bluesky account to publish events as [`community.lexicon.calendar.event` records](https://github.com/lexicon-community). Events are viewable on [Smoke Signal](https://smokesignal.events) and other atproto calendar viewers.

## Tech stack

- [Nuxt 4](https://nuxt.com/) with [Nitro](https://nitro.build/)
- [UnoCSS](https://unocss.dev/)
- [Reka UI](https://reka-ui.com/)
- [Upstash Redis](https://upstash.com/) for storage
- [ical-generator](https://github.com/sebbo2002/ical-generator) for calendar feeds
- [nuxt-og-image](https://github.com/nuxt-modules/og-image) for social previews
- [Vite+](https://viteplus.dev/) for linting and testing

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in the required values (Discord bot token, OAuth credentials, Upstash Redis URL, etc.).

## Development

```bash
pnpm dev
```

## Testing

```bash
# Unit tests
pnpm test:unit

# Component tests (Nuxt environment + browser)
pnpm test:nuxt

# Browser tests (Playwright)
pnpm test:browser

# All tests
pnpm test
```

## Linting

```bash
# Check
pnpm lint

# Fix
pnpm lint --fix
```

## Building

```bash
pnpm build
```

## Contributing

We welcome contributions -- please feel free to explore the project and improve things.

1. Fork the repository
2. Create your branch (`git checkout -b my-change`)
3. Make your changes
4. Run `pnpm lint` and `pnpm test` to verify
5. Commit and push
6. Open a pull request

## License

Published under [MIT License](./LICENSE).
