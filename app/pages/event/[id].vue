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
  going: 'going',
  interested: 'interested',
  notgoing: 'not going',
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
  <div>
    <template v-if="event && guild">
      <article>
        <!-- Header -->
        <div class="mb-8">
          <NuxtLink
            :to="`/dashboard/${guild.id}`"
            class="link-accent font-mono text-sm inline-flex items-center gap-1 mb-4 group no-underline"
          >
            <span class="transition-transform group-hover:-translate-x-1">&larr;</span>
            {{ guild.name }}
          </NuxtLink>
          <h1 class="heading-1">
            {{ event.name }}
          </h1>

          <!-- Info grid -->
          <dl class="grid sm:grid-cols-2 gap-3 mt-6 m-0">
            <AppCard padding="sm">
              <dt class="text-xs font-mono uppercase text-text-muted tracking-wider mb-1">
                when
              </dt>
              <dd class="text-sm m-0">
                <NuxtTime
                  :datetime="event.startTime"
                  date-style="full"
                  time-style="short"
                />
                <template v-if="event.endTime">
                  <br>
                  <span class="text-text-muted">&ndash;</span>
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
              <dt class="text-xs font-mono uppercase text-text-muted tracking-wider mb-1">
                where
              </dt>
              <dd class="text-sm m-0">
                {{ event.location }}
              </dd>
            </AppCard>

            <AppCard padding="sm">
              <dt class="text-xs font-mono uppercase text-text-muted tracking-wider mb-1">
                interested
              </dt>
              <dd class="text-sm m-0">
                {{ event.userCount }} on Discord
              </dd>
            </AppCard>

            <AppCard
              v-if="event.recurrenceRule"
              padding="sm"
            >
              <dt class="text-xs font-mono uppercase text-text-muted tracking-wider mb-1">
                recurrence
              </dt>
              <dd class="text-sm m-0">
                <span class="badge-primary">recurring event</span>
              </dd>
            </AppCard>
          </dl>
        </div>

        <!-- Description -->
        <AppCard
          v-if="event.description"
          class="mb-6"
        >
          <h2 class="heading-2 mb-3">
            description
          </h2>
          <p class="text-sm text-text-muted whitespace-pre-wrap leading-relaxed m-0">
            {{ event.description }}
          </p>
        </AppCard>

        <!-- RSVPs -->
        <section
          v-if="rsvpTotal > 0 || canRsvp"
          class="mb-6"
        >
          <h2 class="heading-2 mb-4">
            rsvps
            <span
              v-if="rsvpTotal > 0"
              class="text-text-muted font-normal text-sm"
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
              class="inline-flex items-center gap-1.5 bg-surface-raised rounded-full px-2.5 py-1 text-xs text-text-muted hover:text-text transition-colors no-underline"
            >
              <img
                v-if="rsvp.avatar"
                :src="rsvp.avatar"
                height="20"
                width="20"
                :alt="rsvp.displayName || rsvp.handle || rsvp.did"
                class="w-5 h-5 rounded-full"
              >
              {{ rsvp.displayName || rsvp.handle || rsvp.did }}
            </a>
          </div>

          <!-- RSVP buttons (signed in with Bluesky) -->
          <div
            v-if="isBlueskyUser && canRsvp"
          >
            <p
              v-if="!activeRsvpStatus"
              class="text-sm text-text-muted mb-3"
            >
              rsvp via atproto:
            </p>
            <p
              v-else
              class="text-sm text-text-muted mb-3"
            >
              update your response:
            </p>
            <div class="flex gap-2 flex-wrap">
              <AppButton
                :variant="activeRsvpStatus === 'going' ? 'primary' : 'ghost'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                :class="activeRsvpStatus === 'going' ? 'ring-2 ring-primary/50' : ''"
                @click="submitRsvp('going')"
              >
                going
              </AppButton>
              <AppButton
                :variant="activeRsvpStatus === 'interested' ? 'primary' : 'ghost'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                :class="activeRsvpStatus === 'interested' ? 'ring-2 ring-primary/50' : ''"
                @click="submitRsvp('interested')"
              >
                interested
              </AppButton>
              <AppButton
                :variant="activeRsvpStatus === 'notgoing' ? 'primary' : 'ghost'"
                size="sm"
                :loading="rsvpLoading"
                :disabled="rsvpLoading"
                :class="activeRsvpStatus === 'notgoing' ? 'ring-2 ring-primary/50' : ''"
                @click="submitRsvp('notgoing')"
              >
                not going
              </AppButton>
            </div>
            <p
              v-if="rsvpError"
              class="text-sm text-danger mt-3"
            >
              {{ rsvpError }}
            </p>
          </div>

          <!-- Not published to atproto yet -->
          <p
            v-else-if="!canRsvp"
            class="text-sm text-text-muted"
          >
            rsvp will be available once this event is published to atproto.
          </p>

          <!-- Event is on atproto, but user needs to connect their own account -->
          <div v-else>
            <p class="text-sm text-text-muted mb-3">
              connect your atproto account to rsvp. your response will be stored in your own data repo.
            </p>
            <StyledDialog
              v-model:open="atprotoDialogOpen"
              title="sign in with atproto"
              description="enter your handle to sign in and rsvp to this event. your rsvp will be stored in your own data repo."
            >
              <template #trigger>
                <AppButton variant="secondary">
                  connect atproto
                </AppButton>
              </template>

              <form
                class="flex flex-col gap-4"
                @submit.prevent="loginAtproto"
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
                  <AppButton
                    variant="primary"
                    type="submit"
                  >
                    sign in
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
          <div class="flex gap-3 flex-wrap">
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
              class="link-accent text-sm inline-flex items-center gap-1"
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
      title="event not found"
      description="this event doesn't exist or may have been removed."
    />
  </div>
</template>
