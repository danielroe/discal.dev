<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="section-gap">
    <!-- Hero -->
    <section class="flex flex-col items-center justify-center text-center min-h-[70vh] gap-6 relative overflow-hidden">
      <!-- Floating particles -->
      <span
        v-for="i in 8"
        :key="i"
        class="absolute w-1.5 h-1.5 rounded-full pointer-events-none motion-safe:animate-[particle-float_var(--dur)_ease-in-out_var(--delay)_infinite]"
        :class="[i % 3 === 0 ? 'bg-primary/40' : i % 3 === 1 ? 'bg-accent/40' : 'bg-pop/40']"
        :style="{
          '--dur': `${4 + (i * 1.3)}s`,
          '--delay': `${i * 0.6}s`,
          '--drift-x': `${(i % 2 ? 1 : -1) * (15 + i * 5)}px`,
          '--drift-y': `${-30 - i * 8}px`,
          'left': `${10 + (i * 11)}%`,
          'top': `${30 + (i % 4) * 15}%`,
        }"
      />

      <DiscalLogo
        size="xl"
        animate
        class="animate-reveal"
        style="--reveal-delay: 0s"
      />
      <h1
        class="heading-1 text-3xl sm:text-5xl text-gradient animate-reveal"
        style="--reveal-delay: 0.1s"
      >
        discal.dev
      </h1>
      <p
        class="text-lg text-text-muted max-w-md animate-reveal"
        style="--reveal-delay: 0.2s"
      >
        your Discord events, everywhere. subscribe once, sync to any calendar app &ndash; or the atmosphere.
      </p>
      <div
        class="animate-reveal"
        style="--reveal-delay: 0.3s"
      >
        <AppButton
          v-if="loggedIn"
          variant="primary"
          size="lg"
          to="/dashboard"
          class="motion-safe:animate-pulse-glow"
        >
          go to dashboard
        </AppButton>
        <AppButton
          v-else
          variant="primary"
          size="lg"
          href="/auth/discord"
          class="motion-safe:animate-pulse-glow"
        >
          get started
        </AppButton>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-4">
      <h2 class="heading-2 text-center mb-8">
        how it works
      </h2>
      <ol class="grid gap-4 list-none p-0 m-0">
        <li
          v-for="(step, i) in [
            { title: 'add the bot', desc: 'add discal to your Discord server' },
            { title: 'configure', desc: 'sign in and set your timezone and calendar settings' },
            { title: 'share the link', desc: 'anyone can subscribe in their calendar app' },
            { title: 'go decentralised', desc: 'optionally publish events to your atmosphere account' },
          ]"
          :key="i"
          class="animate-reveal"
          :style="{ '--reveal-delay': `${0.1 + i * 0.1}s` }"
        >
          <AppCard interactive>
            <div class="flex items-start gap-4">
              <span class="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-mono font-bold grid place-items-center">
                {{ i + 1 }}
              </span>
              <div>
                <h3 class="heading-3">
                  {{ step.title }}
                </h3>
                <p class="text-sm text-text-muted mt-1">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </AppCard>
        </li>
      </ol>
    </section>

    <!-- Features -->
    <section class="py-4">
      <h2 class="heading-2 text-center mb-8">
        features
      </h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <AppCard
          v-for="(feature, i) in [
            { title: 'auto-updating feeds', desc: 'subscribable ICS calendar feed that syncs every 5 minutes' },
            { title: 'recurring events', desc: 'proper timezone and DST handling for repeating events' },
            { title: 'atproto integration', desc: 'publish events as calendar records and browse them on smokesignal.events' },
            { title: 'RSVP on your terms', desc: 'attendance stored in your own atproto data repo' },
          ]"
          :key="feature.title"
          class="animate-reveal"
          :style="{ '--reveal-delay': `${0.1 + i * 0.08}s` }"
        >
          <h3 class="heading-3 mb-1">
            {{ feature.title }}
          </h3>
          <p class="text-sm text-text-muted">
            {{ feature.desc }}
          </p>
        </AppCard>
      </div>
    </section>

    <!-- CTA -->
    <section
      v-if="!loggedIn"
      class="py-4"
    >
      <AppCard
        highlight
        padding="lg"
      >
        <div class="flex flex-col items-center text-center gap-4">
          <h2 class="heading-2">
            get started
          </h2>
          <p class="text-text-muted max-w-sm">
            sign in with Discord to add your server and get a calendar feed in seconds.
          </p>
          <AppButton
            variant="primary"
            size="lg"
            href="/auth/discord"
          >
            sign in with Discord
          </AppButton>
        </div>
      </AppCard>
    </section>
  </div>
</template>
