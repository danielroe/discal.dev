<script setup lang="ts">
const { loggedIn } = useUserSession()
const config = useRuntimeConfig()

const { data: guilds, status: guildsStatus, error } = useLazyFetch('/api/guilds')
const { data: available, status: availableStatus } = useLazyFetch('/api/guilds/available')

const loading = computed(() => guildsStatus.value === 'pending' || availableStatus.value === 'pending')

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
    // Navigate to the new guild's dashboard immediately
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
    <h1>Dashboard</h1>

    <div v-if="!loggedIn || error">
      <p>Sign in with Discord to manage your servers.</p>
      <a href="/auth/discord">Sign in with Discord</a>
    </div>

    <p v-else-if="loading">
      Loading your servers...
    </p>

    <template v-else>
      <section v-if="guilds && guilds.length > 0">
        <h2>Your servers</h2>
        <ul>
          <li
            v-for="guild in guilds"
            :key="guild.id"
          >
            <NuxtLink :to="`/dashboard/${guild.id}`">
              {{ guild.name }}
            </NuxtLink>
            <span> &mdash; </span>
            <code>/calendar/{{ guild.calendarSlug }}.ics</code>
          </li>
        </ul>
      </section>

      <section v-if="unregisteredWithBot.length > 0">
        <h2>Ready to set up</h2>
        <p>The discal bot is in these servers. Click to register and create a calendar feed.</p>
        <ul>
          <li
            v-for="guild in unregisteredWithBot"
            :key="guild.id"
          >
            <strong>{{ guild.name }}</strong>
            <button
              type="button"
              :disabled="registering === guild.id"
              @click="registerGuild(guild.id, guild.name)"
            >
              {{ registering === guild.id ? 'Setting up...' : 'Set up calendar' }}
            </button>
          </li>
        </ul>
        <p v-if="registerError">
          {{ registerError }}
        </p>
      </section>

      <section>
        <h2>Add to a server</h2>
        <p>
          <a
            :href="botInviteUrl"
            target="_blank"
            rel="noopener"
          >Add discal bot to a Discord server</a>
          <span v-if="withoutBot.length > 0">
            &mdash; you manage {{ withoutBot.length }} server{{ withoutBot.length === 1 ? '' : 's' }} that don't have the bot yet
          </span>
        </p>
      </section>
    </template>
  </div>
</template>
