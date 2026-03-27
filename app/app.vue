<script setup lang="ts">
defineOgImage('NuxtSeo.takumi', {
  title: 'discal.dev - Discord Events as Calendars',
  description: 'Subscribe to Discord server events via ICS calendar feeds. Sync to AT Protocol.',
})

useSeoMeta({
  title: 'discal.dev - Discord Events as Calendars',
  description: 'Subscribe to Discord server events via ICS calendar feeds. Sync to AT Protocol.',
})

const { loggedIn, user, clear } = useUserSession()

async function signOut() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div>
    <NuxtPwaAssets />
    <header>
      <nav>
        <NuxtLink to="/">
          discal.dev
        </NuxtLink>
        <NuxtLink to="/dashboard">
          Dashboard
        </NuxtLink>
        <template v-if="loggedIn && user?.discordId">
          <span>{{ user.name }}</span>
          <span v-if="user.blueskyHandle">
            ({{ user.blueskyHandle }})
          </span>
          <button
            type="button"
            @click="signOut"
          >
            Sign out
          </button>
        </template>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer>
      <p>
        <a href="https://github.com/danielroe/discal.dev">Source</a>
      </p>
    </footer>
  </div>
</template>
