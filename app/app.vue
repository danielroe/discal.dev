<script setup lang="ts">
defineOgImage('Discal')

useSeoMeta({
  title: 'discal.dev – Discord Events as Calendars',
  description: 'Subscribe to Discord server events via ICS calendar feeds. Sync to atproto.',
})

const { loggedIn, user, clear } = useUserSession()

async function signOut() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface text-ink">
    <NuxtPwaAssets />

    <!-- Header -->
    <header class="glass sticky top-0 z-40">
      <nav class="page-container flex items-center justify-between h-14">
        <!-- Left: logo + nav links -->
        <div class="flex items-center gap-1">
          <NuxtLink
            to="/"
            class="nav-item !px-2 gap-2"
          >
            <DiscalLogo size="sm" />
            <span class="font-700 text-ink">discal</span>
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn"
            to="/dashboard"
            class="nav-item"
          >
            dashboard
          </NuxtLink>
        </div>

        <!-- Right: user info + actions -->
        <div class="flex items-center gap-1">
          <template v-if="loggedIn && user?.discordId">
            <span class="nav-badge hidden sm:inline-flex">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="size-4 rounded-full"
              >
              {{ user.name }}
            </span>
            <button
              type="button"
              class="nav-item"
              @click="signOut"
            >
              sign out
            </button>
          </template>
          <DarkModeToggle />
        </div>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 py-8 sm:py-12">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-line py-6">
      <div class="page-container flex items-center justify-center gap-1 text-small">
        <a
          href="https://github.com/danielroe/discal.dev"
          class="link"
          target="_blank"
          rel="noopener"
        >source</a>
        <span class="text-ink-muted">&middot;</span>
        <span>made with ❤️ by</span>
        <a
          href="https://bsky.app/profile/danielroe.dev"
          class="link"
          target="_blank"
          rel="noopener"
        >@danielroe.dev</a>
      </div>
    </footer>
  </div>
</template>
