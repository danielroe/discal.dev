<script setup lang="ts">
const route = useRoute('dashboard-guildId')
const config = useRuntimeConfig()

const { data, refresh, status } = useLazyFetch(`/api/guilds/${route.params.guildId}` as '/api/guilds/:guildId')

const guild = computed(() => data.value?.guild)
const events = computed(() => data.value?.events ?? [])
const atprotoSessionValid = computed(() => data.value?.atprotoSessionValid ?? false)

const calendarUrl = computed(() => {
  if (!guild.value) return ''
  return `${config.public.appUrl}/calendar/${guild.value.calendarSlug}.ics`
})

const webcalUrl = computed(() => {
  if (!guild.value) return ''
  const url = new URL(`/calendar/${guild.value.calendarSlug}.ics`, config.public.appUrl)
  url.protocol = 'webcal:'
  return url.toString()
})

const timezones = Intl.supportedValuesOf('timeZone')
const selectedTimezone = ref('UTC')

watch(() => guild.value?.timezone, (tz) => {
  if (tz) selectedTimezone.value = tz
}, { immediate: true })

const savingTimezone = ref(false)

async function saveTimezone() {
  if (!selectedTimezone.value || selectedTimezone.value === guild.value?.timezone) return
  savingTimezone.value = true
  try {
    await $fetch(`/api/guilds/${route.params.guildId}/settings`, {
      method: 'PUT',
      body: { timezone: selectedTimezone.value },
    })
    await refresh()
  }
  catch (error) {
    console.error('Failed to save timezone:', error)
  }
  finally {
    savingTimezone.value = false
  }
}

const atprotoHandle = ref('')
const atprotoDialogOpen = ref(false)

function connectAtproto() {
  if (!atprotoHandle.value) return
  navigateTo(`/auth/bluesky?handle=${encodeURIComponent(atprotoHandle.value)}&guild=${route.params.guildId}`, { external: true })
}

// Resolve atproto profile for connected DID
const atprotoProfile = ref<{ handle?: string, displayName?: string, avatar?: string } | null>(null)
watch(() => guild.value?.atprotoDid, async (did) => {
  if (!did) {
    atprotoProfile.value = null
    return
  }
  try {
    atprotoProfile.value = await $fetch<{ handle: string, displayName?: string, avatar?: string }>(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile`,
      { query: { actor: did } },
    )
  }
  catch {
    atprotoProfile.value = null
  }
}, { immediate: true })

const disconnecting = ref(false)
async function disconnectAtproto() {
  disconnecting.value = true
  try {
    await $fetch(`/api/guilds/${route.params.guildId}/atproto`, {
      method: 'DELETE',
    })
    await refresh()
  }
  catch (error) {
    console.error('Failed to disconnect atproto:', error)
  }
  finally {
    disconnecting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <!-- Loading -->
    <template v-if="status === 'pending'">
      <div class="space-y-6">
        <SkeletonLoader variant="heading" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="card" />
        <SkeletonLoader
          variant="text"
          :lines="3"
        />
      </div>
    </template>

    <!-- Guild found -->
    <template v-else-if="guild">
      <div class="mb-8">
        <NuxtLink
          to="/dashboard"
          class="link text-sm mb-2 inline-block"
        >
          &larr; Back to dashboard
        </NuxtLink>
        <div class="flex items-center gap-3">
          <img
            v-if="guild.icon"
            :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`"
            :alt="guild.name"
            class="size-10 rounded-full"
          >
          <h1 class="heading-1">
            {{ guild.name }}
          </h1>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Calendar feed -->
        <AppCard>
          <h2 class="heading-2 mb-3">
            calendar feed
          </h2>
          <p class="text-body text-sm mb-3">
            subscribe to this URL in your calendar app:
          </p>
          <CopyableCode :value="calendarUrl" />
          <div class="flex flex-wrap gap-3 mt-4">
            <AppButton
              variant="primary"
              size="sm"
              :href="webcalUrl"
            >
              open in calendar app
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              :to="`/calendar/${guild.calendarSlug}`"
            >
              view calendar
            </AppButton>
          </div>
        </AppCard>

        <!-- Settings -->
        <AppCard>
          <h2 class="heading-2 mb-3">
            settings
          </h2>
          <fieldset class="space-y-3">
            <legend class="text-body text-sm mb-2">
              default event timezone
            </legend>
            <div class="flex flex-col sm:flex-row gap-3">
              <label class="flex-1">
                <span class="sr-only">Timezone</span>
                <select
                  v-model="selectedTimezone"
                  class="select-base"
                >
                  <option
                    v-for="tz in timezones"
                    :key="tz"
                    :value="tz"
                  >
                    {{ tz }}
                  </option>
                </select>
              </label>
              <AppButton
                v-if="selectedTimezone !== guild.timezone"
                variant="primary"
                size="sm"
                :loading="savingTimezone"
                :disabled="savingTimezone"
                @click="saveTimezone"
              >
                Save
              </AppButton>
            </div>
          </fieldset>
        </AppCard>

        <!-- atproto -->
        <AppCard>
          <h2 class="heading-2 mb-3">
            atproto
          </h2>
          <div v-if="guild.atprotoDid && atprotoSessionValid">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="atprotoProfile?.avatar"
                  :src="atprotoProfile.avatar"
                  :alt="atprotoProfile.displayName || atprotoProfile.handle || guild.atprotoDid"
                  class="size-8 rounded-full"
                >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="badge-success">connected</span>
                    <span
                      v-if="atprotoProfile?.handle"
                      class="text-ink font-600 text-sm"
                    >
                      @{{ atprotoProfile.handle }}
                    </span>
                  </div>
                  <p class="text-small mt-0.5">
                    events will be published to this account
                  </p>
                </div>
              </div>
              <AppButton
                variant="ghost"
                size="sm"
                :loading="disconnecting"
                @click="disconnectAtproto"
              >
                disconnect
              </AppButton>
            </div>
          </div>

          <div v-else>
            <p
              v-if="guild.atprotoDid && !atprotoSessionValid"
              class="text-warning text-sm mb-3"
            >
              previously connected to <code class="code-inline text-xs">{{ guild.atprotoDid }}</code>, but the session has expired
            </p>
            <p
              v-else
              class="text-body text-sm mb-3"
            >
              connect an atproto account to publish events to the atmosphere
            </p>

            <StyledDialog
              v-model:open="atprotoDialogOpen"
              :title="guild.atprotoDid ? 'reconnect atproto' : 'connect atproto'"
              description="Enter your handle (e.g. alice.bsky.social) to connect your account. Events from this Discord server will be published to your data repo."
            >
              <template #trigger>
                <AppButton variant="secondary">
                  {{ guild.atprotoDid ? 'reconnect' : 'connect atproto' }}
                </AppButton>
              </template>

              <form
                class="space-y-4"
                @submit.prevent="connectAtproto"
              >
                <label class="block">
                  <span class="text-sm font-600 text-ink mb-1 block">handle</span>
                  <input
                    v-model="atprotoHandle"
                    type="text"
                    placeholder="alice.bsky.social"
                    required
                    class="input-base"
                  >
                </label>
                <div class="flex justify-end gap-3">
                  <AppButton
                    variant="ghost"
                    @click="atprotoDialogOpen = false"
                  >
                    cancel
                  </AppButton>
                  <AppButton variant="primary">
                    connect
                  </AppButton>
                </div>
              </form>
            </StyledDialog>
          </div>
        </AppCard>

        <!-- Events -->
        <section>
          <h2 class="heading-2 mb-4">
            events
            <span class="text-ink-muted font-400 text-lg">({{ events.length }})</span>
          </h2>
          <EmptyState
            v-if="events.length === 0"
            title="No events synced yet"
            description="Events will appear after the next sync cycle (up to 5 minutes)."
            :show-mascot="false"
          />
          <div
            v-else
            class="space-y-3"
          >
            <NuxtLink
              v-for="ev in events"
              :key="ev.id"
              :to="`/event/${ev.id}`"
              class="card-interactive p-5 block no-underline"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <strong class="text-ink font-600">{{ ev.name }}</strong>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <NuxtTime
                      :datetime="ev.startTime"
                      date-style="medium"
                      time-style="short"
                      class="text-small"
                    />
                    <span
                      v-if="ev.recurrenceRule"
                      class="badge-accent"
                    >recurring</span>
                    <span
                      v-if="ev.location"
                      class="text-small truncate"
                    >{{ ev.location }}</span>
                  </div>
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
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <EmptyState
        title="Guild not found"
        description="This server doesn't exist or you don't have access to it."
      >
        <template #action>
          <AppButton
            variant="secondary"
            to="/dashboard"
          >
            back to dashboard
          </AppButton>
        </template>
      </EmptyState>
    </template>
  </div>
</template>
