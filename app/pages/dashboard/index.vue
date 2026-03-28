<script setup lang="ts">
const { loggedIn } = useUserSession()
const config = useRuntimeConfig()

const { data: guilds, status: guildsStatus, error, refresh: refreshGuilds } = useLazyFetch('/api/guilds', {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
})
const { data: available, status: availableStatus, refresh: refreshAvailable } = useLazyFetch('/api/guilds/available', {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
})

const loading = computed(() => guildsStatus.value === 'pending' || availableStatus.value === 'pending')
const refreshing = ref(false)

async function refreshAll() {
  refreshing.value = true
  await Promise.all([refreshGuilds(), refreshAvailable()])
  refreshing.value = false
}

const botInviteUrl = computed(() => {
  const clientId = config.public.discordClientId
  if (!clientId) return '#'
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=0&scope=bot`
})

const unregisteredWithBot = computed(() =>
  (available.value ?? []).filter(g => g.botPresent && !g.registered),
)

const withoutBot = computed(() =>
  (available.value ?? []).filter(g => !g.botPresent && !g.registered),
)

const registering = ref<string | null>(null)
const registerError = ref('')

async function registerGuild(guildId: string, guildName: string) {
  registering.value = guildId
  registerError.value = ''

  try {
    const result = await $fetch('/api/guilds/register', {
      method: 'POST',
      body: { guildId, guildName },
    })
    await navigateTo(`/dashboard/${result.id}`)
  }
  catch (err) {
    registerError.value = err instanceof Error ? err.message : 'Registration failed'
    registering.value = null
  }
}
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-8">
      <h1 class="heading-1">
        dashboard
      </h1>
      <AppButton
        v-if="loggedIn && !loading"
        variant="ghost"
        size="sm"
        :loading="refreshing"
        @click="refreshAll"
      >
        Refresh
      </AppButton>
    </div>

    <!-- Auth gate -->
    <template v-if="!loggedIn || error">
      <EmptyState
        title="Sign in to get started"
        description="Connect your Discord account to manage your servers and calendar feeds."
      >
        <template #action>
          <AppButton
            variant="primary"
            href="/auth/discord"
          >
            Sign in with Discord
          </AppButton>
        </template>
      </EmptyState>
    </template>

    <!-- Loading skeletons -->
    <template v-else-if="loading">
      <div class="space-y-4">
        <SkeletonLoader variant="heading" />
        <div class="grid sm:grid-cols-2 gap-4">
          <SkeletonLoader
            v-for="i in 4"
            :key="i"
            variant="card"
          />
        </div>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Registered servers -->
      <section
        v-if="guilds && guilds.length > 0"
        class="mb-10"
      >
        <h2 class="heading-2 mb-4">
          your servers
        </h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <NuxtLink
            v-for="guild in guilds"
            :key="guild.id"
            :to="`/dashboard/${guild.id}`"
            class="card-interactive p-5 block no-underline"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <img
                    v-if="guild.icon"
                    :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`"
                    :alt="guild.name"
                    class="size-8 rounded-full"
                  >
                  <div
                    v-else
                    class="size-8 rounded-full bg-primary-subtle flex items-center justify-center text-primary-text text-xs font-700"
                  >
                    {{ guild.name.charAt(0) }}
                  </div>
                  <h3 class="heading-3">
                    {{ guild.name }}
                  </h3>
                </div>
                <code class="code-inline text-xs">/calendar/{{ guild.calendarSlug }}.ics</code>
              </div>
              <svg
                class="size-5 text-ink-muted shrink-0 group-hover/card:text-primary transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              ><path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              /></svg>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Ready to set up -->
      <section
        v-if="unregisteredWithBot.length > 0"
        class="mb-10"
      >
        <h2 class="heading-2 mb-2">
          ready to set up
        </h2>
        <p class="text-body mb-4">
          The discal bot is in these servers. Click to register and create a calendar feed.
        </p>
        <div class="grid sm:grid-cols-2 gap-4">
          <AppCard
            v-for="guild in unregisteredWithBot"
            :key="guild.id"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="size-2 rounded-full bg-success animate-pulse-dot" />
                <strong class="text-ink font-600">{{ guild.name }}</strong>
              </div>
              <AppButton
                variant="secondary"
                size="sm"
                :loading="registering === guild.id"
                :disabled="registering === guild.id"
                @click="registerGuild(guild.id, guild.name)"
              >
                set up
              </AppButton>
            </div>
          </AppCard>
        </div>
        <p
          v-if="registerError"
          class="text-danger text-sm mt-3"
        >
          {{ registerError }}
        </p>
      </section>

      <!-- Add bot -->
      <section>
        <AppCard highlight>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="heading-3 mb-1">
                add to a server
              </h2>
              <p class="text-body text-sm">
                <template v-if="withoutBot.length > 0">
                  You manage {{ withoutBot.length }} server{{ withoutBot.length === 1 ? '' : 's' }} that don't have the bot yet.
                </template>
                <template v-else>
                  Add the discal bot to start syncing events.
                </template>
              </p>
            </div>
            <AppButton
              variant="accent"
              :href="botInviteUrl"
            >
              add bot
            </AppButton>
          </div>
        </AppCard>
      </section>
    </template>
  </div>
</template>
