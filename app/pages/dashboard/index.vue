<script setup lang="ts">
const { loggedIn } = useUserSession()
const config = useRuntimeConfig()

const [
  { data: guilds, status: guildsStatus, error, refresh: refreshGuilds },
  { data: available, status: availableStatus, refresh: refreshAvailable },
] = await Promise.all([
  useLazyFetch('/api/guilds', {
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  }),
  useLazyFetch('/api/guilds/available', {
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  }),
])

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

async function registerGuild(guildId: string, guildName: string, guildIcon: string | null) {
  registering.value = guildId
  registerError.value = ''

  try {
    const result = await $fetch('/api/guilds/register', {
      method: 'POST',
      body: { guildId, guildName, guildIcon },
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
  <div>
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
        refresh
      </AppButton>
    </div>

    <!-- Auth gate -->
    <template v-if="!loggedIn || error">
      <EmptyState
        title="sign in to get started"
        description="connect your Discord account to manage your servers and calendar feeds."
      >
        <template #action>
          <AppButton
            variant="primary"
            href="/auth/discord"
          >
            sign in with Discord
          </AppButton>
        </template>
      </EmptyState>
    </template>

    <!-- Loading skeletons -->
    <template v-else-if="loading">
      <div class="flex flex-col gap-4">
        <SkeletonLoader variant="heading" />
        <div class="flex flex-col gap-3">
          <div
            v-for="i in 4"
            :key="i"
            class="card p-4 flex items-center gap-3"
          >
            <SkeletonLoader
              variant="circle"
              width="40px"
              height="40px"
            />
            <div class="flex flex-col gap-2 flex-1">
              <SkeletonLoader
                variant="custom"
                :width="i % 2 === 0 ? '60%' : '45%'"
                height="16px"
              />
              <SkeletonLoader
                variant="custom"
                width="30%"
                height="12px"
              />
            </div>
          </div>
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
        <div class="flex flex-col gap-3">
          <NuxtLink
            v-for="guild in guilds"
            :key="guild.id"
            :to="`/dashboard/${guild.id}`"
            class="card-interactive p-4 no-underline text-text group"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-3">
                  <img
                    v-if="guild.icon"
                    :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`"
                    :alt="guild.name"
                    height="40"
                    width="40"
                    class="w-10 h-10 rounded-full"
                    :style="{ viewTransitionName: `guild-icon-${guild.id}` }"
                  >
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-primary/20 text-primary font-mono font-bold grid place-items-center"
                    :style="{ viewTransitionName: `guild-icon-${guild.id}` }"
                  >
                    {{ guild.name.charAt(0) }}
                  </div>
                  <h3
                    class="heading-3"
                    :style="{ viewTransitionName: `guild-name-${guild.id}` }"
                  >
                    {{ guild.name }}
                  </h3>
                </div>
                <code class="font-mono text-xs text-text-muted">/calendar/{{ guild.calendarSlug }}.ics</code>
              </div>
              <span class="i-heroicons-chevron-right-20-solid w-5 h-5 text-text-muted group-hover:text-text transition-transform group-hover:translate-x-0.5" />
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Ready to enable -->
      <section
        v-if="unregisteredWithBot.length > 0"
        class="mb-10"
      >
        <h2 class="heading-2 mb-2">
          ready to enable
        </h2>
        <p class="text-sm text-text-muted mb-4">
          the discal bot is in these servers. click to enable syncing to a calendar feed.
        </p>
        <div class="flex flex-col gap-3">
          <AppCard
            v-for="guild in unregisteredWithBot"
            :key="guild.id"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  v-if="guild.icon"
                  :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`"
                  :alt="guild.name"
                  width="32"
                  height="32"
                  class="w-8 h-8 rounded-full"
                >
                <span
                  v-else
                  class="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold grid place-items-center shrink-0"
                >{{ guild.name.charAt(0) }}</span>
                <strong class="font-mono text-sm">{{ guild.name }}</strong>
              </div>
              <AppButton
                variant="secondary"
                size="sm"
                :loading="registering === guild.id"
                :disabled="registering === guild.id"
                @click="registerGuild(guild.id, guild.name, guild.icon)"
              >
                enable
              </AppButton>
            </div>
          </AppCard>
        </div>
        <p
          v-if="registerError"
          class="text-sm text-danger mt-3"
        >
          {{ registerError }}
        </p>
      </section>

      <!-- Add bot -->
      <section>
        <AppCard highlight>
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 class="heading-2">
                add to a server
              </h2>
              <p class="text-sm text-text-muted mt-1">
                <template v-if="withoutBot.length > 0">
                  you manage {{ withoutBot.length }} server{{ withoutBot.length === 1 ? '' : 's' }} that don't have the bot yet.
                </template>
                <template v-else>
                  add the discal bot to start syncing events.
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
