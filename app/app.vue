<script setup lang="ts">
defineOgImage('Discal')

useSeoMeta({
  title: 'discal.dev – Discord events as calendars',
  description: 'subscribe to Discord server events via ICS calendar feeds. sync to atproto.',
})

const { loggedIn, user, clear } = useUserSession()

async function signOut() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <NuxtPwaAssets />

    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-lg bg-bg/80 border-b border-border">
      <nav class="page-container h-14 flex items-center justify-between">
        <!-- Left: logo + nav links -->
        <div class="flex items-center gap-5">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 font-mono font-bold text-sm tracking-tight text-text no-underline hover:text-primary transition-colors"
          >
            <DiscalLogo size="sm" />
            <span>discal</span>
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn"
            to="/dashboard"
            class="font-mono text-sm text-text-muted hover:text-text transition-colors no-underline"
          >
            dashboard
          </NuxtLink>
        </div>

        <!-- Right: user info + actions -->
        <div class="flex items-center gap-3">
          <template v-if="loggedIn && user?.discordId">
            <span class="hidden sm:flex items-center gap-2 text-sm text-text-muted">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.name"
                height="24"
                width="24"
                class="w-6 h-6 rounded-full"
              >
              <span
                v-else
                class="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold grid place-items-center"
              >{{ user.name?.charAt(0) ?? '?' }}</span>
              {{ user.name }}
            </span>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
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
    <main class="flex-1 page-container py-12">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-8">
      <div class="page-container flex items-center justify-center gap-2 text-sm text-text-muted flex-wrap">
        <a
          href="https://github.com/danielroe/discal.dev"
          class="link-accent"
          target="_blank"
          rel="noopener"
        >source</a>
        <span>&middot;</span>
        <span>made with love by</span>
        <a
          href="https://bsky.app/profile/danielroe.dev"
          class="link-accent"
          target="_blank"
          rel="noopener"
        >@danielroe.dev</a>
      </div>
    </footer>
  </div>
</template>
