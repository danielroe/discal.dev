<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="page-container">
    <!-- Hero -->
    <section class="text-center py-12 sm:py-20">
      <DiscalLogo
        size="xl"
        animate
        class="mx-auto mb-8"
      />
      <h1 class="heading-1 mb-4">
        <span class="gradient-text">discal.dev</span>
      </h1>
      <p class="text-body text-lg max-w-lg mx-auto mb-8">
        Subscribe to Discord server events via ICS calendar feeds.
        Sync to Google Calendar, Apple Calendar, Outlook &ndash; and the atmosphere.
      </p>
      <AppButton
        v-if="loggedIn"
        variant="primary"
        size="lg"
        to="/dashboard"
      >
        go to dashboard
      </AppButton>
      <AppButton
        v-else
        variant="primary"
        size="lg"
        href="/auth/discord"
      >
        get started
      </AppButton>
    </section>

    <!-- How it works -->
    <section class="py-12 sm:py-16">
      <h2 class="heading-2 text-center mb-10">
        how it works
      </h2>
      <ol class="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
        <li
          v-for="(step, i) in [
            { title: 'add the bot', desc: 'add discal to your Discord server' },
            { title: 'configure', desc: 'sign in and set your timezone and calendar settings' },
            { title: 'share the link', desc: 'anyone can subscribe in their calendar app' },
            { title: 'go decentralised', desc: 'optionally publish events to your atmosphere account' },
          ]"
          :key="i"
        >
          <AppCard class="h-full">
            <div class="flex items-start gap-4">
              <span class="shrink-0 size-8 rounded-full bg-primary text-ink-inverse flex items-center justify-center font-700 text-sm">
                {{ i + 1 }}
              </span>
              <div>
                <h3 class="heading-3 mb-1">
                  {{ step.title }}
                </h3>
                <p class="text-body text-sm">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </AppCard>
        </li>
      </ol>
    </section>

    <!-- Features -->
    <section class="py-12 sm:py-16">
      <h2 class="heading-2 text-center mb-10">
        features
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <AppCard
          v-for="feature in [
            { title: 'auto-updating feeds', desc: 'subscribable ICS calendar feed that syncs every 5 minutes' },
            { title: 'recurring events', desc: 'proper timezone and DST handling for repeating events' },
            { title: 'atproto integration', desc: 'publish events as calendar records and browse them on smokesignal.events' },
            { title: 'RSVP on your terms', desc: 'attendance stored in your own atproto data repo' },
          ]"
          :key="feature.title"
        >
          <h3 class="heading-3 mb-1">
            {{ feature.title }}
          </h3>
          <p class="text-body text-sm">
            {{ feature.desc }}
          </p>
        </AppCard>
      </div>
    </section>

    <!-- CTA -->
    <section
      v-if="!loggedIn"
      class="py-12 sm:py-16 text-center"
    >
      <AppCard
        highlight
        padding="lg"
      >
        <h2 class="heading-2 mb-3">
          get started
        </h2>
        <p class="text-body mb-6 max-w-md mx-auto">
          Sign in with Discord to add your server and get a calendar feed in seconds.
        </p>
        <AppButton
          variant="primary"
          size="lg"
          href="/auth/discord"
        >
          Sign in with Discord
        </AppButton>
      </AppCard>
    </section>
  </div>
</template>
