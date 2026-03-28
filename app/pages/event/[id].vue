<script setup lang="ts">
const route = useRoute('event-id')
const { loggedIn, user } = useUserSession()

const { data: eventData } = await useFetch(`/api/events/${route.params.id}` as '/api/events/:id')
const { data: rsvpData, refresh: refreshRsvps } = await useLazyFetch(`/api/events/${route.params.id}/rsvps` as '/api/events/:id/rsvps')

const event = computed(() => eventData.value?.event)
const guild = computed(() => eventData.value?.guild)
const rsvps = computed(() => rsvpData.value?.rsvps ?? [])
const rsvpTotal = computed(() => rsvpData.value?.total ?? 0)
const currentUserRsvp = computed(() => rsvpData.value?.currentUserRsvp ?? null)

useSeoMeta({
  title: () => event.value?.name ?? 'Event',
  description: () => event.value?.description ?? '',
})

const isBlueskyUser = computed(() => loggedIn.value && !!user.value?.blueskyDid)
const canRsvp = computed(() => event.value?.atprotoUri && event.value?.atprotoCid)

const rsvpStatus = ref<'going' | 'interested' | 'notgoing' | null>(null)
const rsvpLoading = ref(false)
const rsvpError = ref('')

// Derive the active RSVP status (local override or server value)
const activeRsvpStatus = computed(() => {
  if (rsvpStatus.value) return rsvpStatus.value
  const serverStatus = currentUserRsvp.value?.status
  if (!serverStatus) return null
  // The server returns raw AT Proto status like "community.lexicon.calendar.rsvp#going"
  // Extract just the status part
  const parts = serverStatus.split('#')
  return rsvpStatusLabel[parts[parts.length - 1] as string] as 'going' | 'interested' | 'notgoing' | null
})

const rsvpStatusLabel: Record<string, string> = {
  going: 'Going',
  interested: 'Interested',
  notgoing: 'Not going',
}

async function submitRsvp(status: 'going' | 'interested' | 'notgoing') {
  if (!event.value || !guild.value) return
  rsvpLoading.value = true
  rsvpError.value = ''

  try {
    await $fetch('/api/rsvp', {
      method: 'POST',
      body: {
        eventId: event.value.id,
        guildId: guild.value.id,
        status,
      },
    })
    rsvpStatus.value = status
    await refreshRsvps()
  }
  catch (error) {
    rsvpError.value = error instanceof Error ? error.message : 'Failed to RSVP'
  }
  finally {
    rsvpLoading.value = false
  }
}

const atprotoHandle = ref('')
const atprotoDialogOpen = ref(false)

function loginAtproto() {
  if (!atprotoHandle.value) return
  navigateTo(`/auth/bluesky?handle=${encodeURIComponent(atprotoHandle.value)}`, { external: true })
}
</script>

<template>
  <div class="page-container">
    <template v-if="event && guild">
      <article>
        <!-- Header -->
        <div class="mb-8">
          <NuxtLink
            :to="`/dashboard/${guild.id}`"
            class="link text-sm mb-2 inline-block"
          >
            &larr; {{ guild.name }}
          </NuxtLink>
          <h1 class="heading-1 mb-4">
            {{ event.name }}
          </h1>

          <!-- Info grid -->
          <dl class="grid sm:grid-cols-2 gap-3">
            <AppCard padding="sm">
              <dt class="text-small mb-1">
                when
              </dt>
              <dd class="text-ink font-600 text-sm">
                <NuxtTime
                  :datetime="event.startTime"
                  date-style="full"
                  time-style="short"
                />
                <template v-if="event.endTime">
                  <br>
                  <span class="text-ink-muted font-400">&ndash;</span>
                  <NuxtTime
                    :datetime="event.endTime"
                    date-style="full"
                    time-style="short"
                  />
                </template>
              </dd>
            </AppCard>

            <AppCard
              v-if="event.location"
              padding="sm"
            >
              <dt class="text-small mb-1">
                where
              </dt>
              <dd class="text-ink font-600 text-sm">
                {{ event.location }}
              </dd>
            </AppCard>

            <AppCard padding="sm">
              <dt class="text-small mb-1">
                interested
              </dt>
              <dd class="text-ink font-600 text-sm">
                {{ event.userCount }} on Discord
              </dd>
            </AppCard>

            <AppCard
              v-if="event.recurrenceRule"
              padding="sm"
            >
              <dt class="text-small mb-1">
                recurrence
              </dt>
              <dd>
                <span class="badge-accent">Recurring event</span>
              </dd>
            </AppCard>
          </dl>
        </div>

        <!-- Description -->
        <AppCard
          v-if="event.description"
          class="mb-6"
        >
          <h2 class="heading-3 mb-2">
            description
          </h2>
          <p class="text-body whitespace-pre-line">
            {{ event.description }}
          </p>
        </AppCard>

        <!-- RSVPs -->
        <section
          v-if="rsvpTotal > 0 || canRsvp"
          class="mb-6"
        >
          <h2 class="heading-2 mb-4">
            RSVPs
            <span
              v-if="rsvpTotal > 0"
              class="text-ink-muted font-400 text-lg"
            >({{ rsvpTotal }})</span>
          </h2>

          <!-- RSVP list with avatars -->
          <div
            v-if="rsvps.length > 0"
            class="flex flex-wrap gap-2 mb-4"
          >
            <a
              v-for="rsvp in rsvps"
              :key="rsvp.did"
              :href="`https://bsky.app/profile/${rsvp.handle || rsvp.did}`"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 badge-blush no-underline hover:opacity-80 transition-opacity"
            >
              <img
                v-if="rsvp.avatar"
                :src="rsvp.avatar"
                :alt="rsvp.displayName || rsvp.handle || rsvp.did"
                class="size-4 rounded-full"
              >
              {{ rsvp.displayName || rsvp.handle || rsvp.did }}
            </a>
          </div>

          <!-- RSVP buttons (signed in with Bluesky) -->
          <div
            v-if="isBlueskyUser && canRsvp"
            class="space-y-3"
          >
            <p
              v-if="!activeRsvpStatus"
              class="text-body text-sm"
            >
              RSVP via atproto:
            </p>
            <p
              v-else
              class="text-small"
            >
              update your response:
            </p>
            <div class="flex flex-wrap gap-2">
              <AppButton
                :variant="activeRsvpStatus === 'going' ? 'primary' : 'secondary'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                @click="submitRsvp('going')"
              >
                going
              </AppButton>
              <AppButton
                :variant="activeRsvpStatus === 'interested' ? 'primary' : 'secondary'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                @click="submitRsvp('interested')"
              >
                interested
              </AppButton>
              <AppButton
                :variant="activeRsvpStatus === 'notgoing' ? 'primary' : 'ghost'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                @click="submitRsvp('notgoing')"
              >
                not going
              </AppButton>
            </div>
            <p
              v-if="rsvpError"
              class="text-danger text-sm"
            >
              {{ rsvpError }}
            </p>
          </div>

          <!-- Not published yet -->
          <p
            v-else-if="!canRsvp"
            class="text-body text-sm"
          >
            RSVP will be available once this event is published to atproto.
          </p>

          <!-- Need to sign in -->
          <div v-else>
            <p class="text-body text-sm mb-3">
              Sign in with atproto to RSVP.
            </p>
            <StyledDialog
              v-model:open="atprotoDialogOpen"
              title="Sign in with atproto"
              description="Enter your handle to sign in and RSVP to this event. Your RSVP will be stored in your own data repo."
            >
              <template #trigger>
                <AppButton variant="secondary">
                  Sign in to RSVP
                </AppButton>
              </template>

              <form
                class="space-y-4"
                @submit.prevent="loginAtproto"
              >
                <label class="block">
                  <span class="text-sm font-600 text-ink mb-1 block">Handle</span>
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
                    Cancel
                  </AppButton>
                  <AppButton variant="primary">
                    Sign in
                  </AppButton>
                </div>
              </form>
            </StyledDialog>
          </div>
        </section>

        <!-- Links -->
        <section>
          <h2 class="heading-2 mb-4">
            links
          </h2>
          <div class="flex flex-wrap items-center gap-4">
            <AppButton
              variant="secondary"
              size="sm"
              :href="`https://discord.com/events/${guild.id}/${event.id}`"
            >
              view on Discord
            </AppButton>
            <a
              v-if="event.atprotoUri"
              :href="`https://smokesignal.events/${guild.atprotoDid}/${event.atprotoUri.split('/').pop()}`"
              target="_blank"
              rel="noopener"
              class="link text-sm"
            >
              view on Smoke Signal &rarr;
            </a>
          </div>
        </section>
      </article>
    </template>

    <!-- Not found -->
    <EmptyState
      v-else
      title="Event not found"
      description="This event doesn't exist or may have been removed."
    />
  </div>
</template>
