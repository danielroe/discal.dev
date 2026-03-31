<script setup lang="ts">
const route = useRoute('dashboard-guildId')
const config = useRuntimeConfig()

const { data, refresh, status } = await useFetch(`/api/guilds/${route.params.guildId}` as '/api/guilds/:guildId')

const guild = computed(() => data.value?.guild)
const events = computed(() => data.value?.events ?? [])
const pastEvents = computed(() => data.value?.pastEvents ?? [])
const atprotoSessionValid = computed(() => data.value?.atprotoSessionValid ?? false)

const showPastEvents = ref(false)

const EVENT_STATUS_LABEL: Record<number, string> = {
  3: 'completed',
  4: 'canceled',
}

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

const removing = ref(false)
const removeError = ref('')
const confirmRemoveOpen = ref(false)

async function removeServer() {
  removing.value = true
  removeError.value = ''
  try {
    await $fetch(`/api/guilds/${route.params.guildId}`, {
      method: 'DELETE',
    })
    await navigateTo('/dashboard')
  }
  catch (error) {
    removeError.value = error instanceof Error ? error.message : 'failed to remove server'
    removing.value = false
  }
}

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
  <div>
    <!-- Loading -->
    <template v-if="status === 'pending'">
      <div class="flex flex-col gap-6">
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
          class="link-accent font-mono text-sm inline-flex items-center gap-1 mb-4 group no-underline"
        >
          <span class="transition-transform group-hover:-translate-x-1">&larr;</span>
          back to dashboard
        </NuxtLink>
        <div class="flex items-center gap-4">
          <img
            v-if="guild.icon"
            :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`"
            height="56"
            width="56"
            :alt="guild.name"
            class="w-14 h-14 rounded-xl"
            :style="{ viewTransitionName: `guild-icon-${guild.id}` }"
          >
          <h1
            class="heading-1"
            :style="{ viewTransitionName: `guild-name-${guild.id}` }"
          >
            {{ guild.name }}
          </h1>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Calendar feed -->
        <AppCard>
          <h2 class="heading-2 mb-3">
            calendar feed
          </h2>
          <p class="text-sm text-text-muted mb-3">
            subscribe to this URL in your calendar app:
          </p>
          <CopyableCode :value="calendarUrl" />
          <div class="flex gap-3 mt-4 flex-wrap">
            <AppButton
              variant="primary"
              size="sm"
              :href="webcalUrl"
            >
              open in calendar app
            </AppButton>
          </div>
        </AppCard>

        <!-- Settings -->
        <AppCard>
          <h2 class="heading-2 mb-3">
            settings
          </h2>
          <fieldset class="border-none p-0 m-0">
            <legend class="text-sm text-text-muted mb-2">
              default event timezone
            </legend>
            <div class="flex items-end gap-3">
              <div class="flex-1">
                <TimezoneSelect v-model="selectedTimezone" />
              </div>
              <AppButton
                v-if="selectedTimezone !== guild.timezone"
                variant="primary"
                size="sm"
                :loading="savingTimezone"
                :disabled="savingTimezone"
                @click="saveTimezone"
              >
                save
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
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <img
                  v-if="atprotoProfile?.avatar"
                  :src="atprotoProfile.avatar"
                  :alt="atprotoProfile.displayName || atprotoProfile.handle || guild.atprotoDid"
                  height="40"
                  width="40"
                  class="w-10 h-10 rounded-full"
                >
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-primary/20 text-primary font-mono font-bold grid place-items-center"
                >
                  {{ (atprotoProfile?.displayName || atprotoProfile?.handle || guild.atprotoDid).charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="badge-accent">connected</span>
                    <span
                      v-if="atprotoProfile?.handle"
                      class="font-mono text-sm text-text-muted"
                    >
                      @{{ atprotoProfile.handle }}
                    </span>
                  </div>
                  <p class="text-xs text-text-muted mt-0.5">
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
              class="text-sm text-pop mb-3"
            >
              previously connected to <code class="font-mono text-xs bg-surface-raised px-1.5 py-0.5 rounded">{{ guild.atprotoDid }}</code>, but the session has expired
            </p>
            <p
              v-else
              class="text-sm text-text-muted mb-3"
            >
              connect an atproto account to publish events to the atmosphere
            </p>

            <StyledDialog
              v-model:open="atprotoDialogOpen"
              :title="guild.atprotoDid ? 'reconnect atproto' : 'connect atproto'"
              description="enter your handle (e.g. alice.bsky.social) to connect your account. events from this Discord server will be published to your data repo."
            >
              <template #trigger>
                <AppButton variant="secondary">
                  {{ guild.atprotoDid ? 'reconnect' : 'connect atproto' }}
                </AppButton>
              </template>

              <form
                class="flex flex-col gap-4"
                @submit.prevent="connectAtproto"
              >
                <label class="flex flex-col gap-1.5">
                  <span class="text-sm font-mono text-text-muted">handle</span>
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

        <!-- Upcoming events -->
        <section>
          <h2 class="heading-2 mb-4">
            upcoming events
            <span class="text-text-muted font-normal text-sm">({{ events.length }})</span>
          </h2>
          <EmptyState
            v-if="events.length === 0"
            title="no events synced yet"
            description="events will appear after the next sync cycle (up to 5 minutes)."
            :show-mascot="false"
          />
          <div
            v-else
            class="flex flex-col gap-2"
          >
            <NuxtLink
              v-for="ev in events"
              :key="ev.id"
              :to="`/event/${ev.id}`"
              class="card-interactive p-4 no-underline text-text group"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-col gap-1">
                  <strong class="font-mono text-sm">{{ ev.name }}</strong>
                  <div class="flex items-center gap-2 flex-wrap">
                    <NuxtTime
                      :datetime="ev.startTime"
                      date-style="medium"
                      time-style="short"
                      class="text-xs text-text-muted"
                    />
                    <span
                      v-if="ev.recurrenceRule"
                      class="badge-primary"
                    >recurring</span>
                    <span
                      v-if="ev.location"
                      class="badge-muted"
                    >{{ ev.location }}</span>
                  </div>
                </div>
                <span class="i-heroicons-chevron-right-20-solid w-5 h-5 text-text-muted group-hover:text-text transition-transform group-hover:translate-x-0.5 shrink-0" />
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Past events -->
        <section v-if="pastEvents.length > 0">
          <button
            type="button"
            class="flex items-center gap-2 text-sm text-text-muted font-mono cursor-pointer hover:text-text transition-colors bg-transparent border-none p-0"
            @click="showPastEvents = !showPastEvents"
          >
            <span
              class="i-heroicons-chevron-right-20-solid w-4 h-4 transition-transform"
              :class="showPastEvents ? 'rotate-90' : ''"
            />
            past events
            <span class="text-text-dimmed">({{ pastEvents.length }})</span>
          </button>
          <div
            v-if="showPastEvents"
            class="flex flex-col gap-2 mt-3"
          >
            <NuxtLink
              v-for="ev in pastEvents"
              :key="ev.id"
              :to="`/event/${ev.id}`"
              class="card-interactive p-4 no-underline text-text group opacity-70"
            >
              <div class="flex items-center justify-between">
                <div class="flex flex-col gap-1">
                  <strong class="font-mono text-sm">{{ ev.name }}</strong>
                  <div class="flex items-center gap-2 flex-wrap">
                    <NuxtTime
                      :datetime="ev.startTime"
                      date-style="medium"
                      time-style="short"
                      class="text-xs text-text-muted"
                    />
                    <span
                      v-if="EVENT_STATUS_LABEL[ev.status]"
                      class="badge-muted"
                    >{{ EVENT_STATUS_LABEL[ev.status] }}</span>
                  </div>
                </div>
                <span class="i-heroicons-chevron-right-20-solid w-5 h-5 text-text-muted group-hover:text-text transition-transform group-hover:translate-x-0.5 shrink-0" />
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Remove server -->
        <section class="mt-10 pt-6 border-t border-border">
          <AppCard>
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 class="heading-3 text-danger">
                  remove server
                </h2>
                <p class="text-sm text-text-muted mt-1">
                  stop syncing events and remove the calendar feed. you can add it back at any point.
                </p>
              </div>
              <StyledDialog
                v-model:open="confirmRemoveOpen"
                title="remove server"
                description="this will stop syncing events and delete the calendar feed. any existing subscribers will lose access. you can re-register the server later."
              >
                <template #trigger>
                  <AppButton
                    variant="danger"
                    size="sm"
                  >
                    remove
                  </AppButton>
                </template>
                <div class="flex flex-col gap-4">
                  <p class="text-sm text-text-muted">
                    are you sure you want to remove <strong class="text-text">{{ guild.name }}</strong>?
                  </p>
                  <p
                    v-if="removeError"
                    class="text-sm text-danger"
                  >
                    {{ removeError }}
                  </p>
                  <div class="flex justify-end gap-3">
                    <AppButton
                      variant="ghost"
                      size="sm"
                      @click="confirmRemoveOpen = false"
                    >
                      cancel
                    </AppButton>
                    <AppButton
                      variant="danger"
                      size="sm"
                      :loading="removing"
                      :disabled="removing"
                      @click="removeServer"
                    >
                      remove server
                    </AppButton>
                  </div>
                </div>
              </StyledDialog>
            </div>
          </AppCard>
        </section>
      </div>
    </template>

    <!-- Not found -->
    <template v-else>
      <EmptyState
        title="guild not found"
        description="this server doesn't exist or you don't have access to it."
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
