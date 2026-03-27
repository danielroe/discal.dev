<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

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
function loginAtproto() {
  if (!atprotoHandle.value) return
  navigateTo(`/auth/bluesky?handle=${encodeURIComponent(atprotoHandle.value)}`, { external: true })
}
</script>

<template>
  <div v-if="event && guild">
    <article>
      <h1>{{ event.name }}</h1>

      <dl>
        <dt>Server</dt>
        <dd>
          <NuxtLink :to="`/calendar/${guild.calendarSlug}`">
            {{ guild.name }}
          </NuxtLink>
        </dd>

        <dt>When</dt>
        <dd>
          <NuxtTime
            :datetime="event.startTime"
            date-style="full"
            time-style="short"
          />
          <span v-if="event.endTime">
            &ndash; <NuxtTime
              :datetime="event.endTime"
              date-style="full"
              time-style="short"
            />
          </span>
        </dd>

        <dt v-if="event.location">
          Where
        </dt>
        <dd v-if="event.location">
          {{ event.location }}
        </dd>

        <dt v-if="event.recurrenceRule">
          Recurrence
        </dt>
        <dd v-if="event.recurrenceRule">
          Recurring event
        </dd>

        <dt>Interested</dt>
        <dd>{{ event.userCount }} on Discord</dd>
      </dl>

      <div v-if="event.description">
        <h2>Description</h2>
        <p>{{ event.description }}</p>
      </div>

      <section v-if="rsvpTotal > 0 || canRsvp">
        <h2>
          RSVPs
          <span v-if="rsvpTotal > 0">({{ rsvpTotal }})</span>
        </h2>

        <ul v-if="rsvps.length > 0">
          <li
            v-for="rsvp in rsvps"
            :key="rsvp.did"
          >
            <a
              :href="`https://bsky.app/profile/${rsvp.handle || rsvp.did}`"
              target="_blank"
              rel="noopener"
            >
              {{ rsvp.displayName || rsvp.handle || rsvp.did }}
            </a>
          </li>
        </ul>

        <div v-if="rsvpStatus || currentUserRsvp">
          <p>
            You RSVP'd<span v-if="rsvpStatus">: <strong>{{ rsvpStatus }}</strong></span>. Update your response:
          </p>
        </div>

        <div v-if="isBlueskyUser && canRsvp">
          <p v-if="!rsvpStatus && !currentUserRsvp">
            RSVP via AT Protocol:
          </p>
          <div>
            <button
              type="button"
              :disabled="rsvpLoading"
              @click="submitRsvp('going')"
            >
              Going
            </button>
            <button
              type="button"
              :disabled="rsvpLoading"
              @click="submitRsvp('interested')"
            >
              Interested
            </button>
            <button
              type="button"
              :disabled="rsvpLoading"
              @click="submitRsvp('notgoing')"
            >
              Not going
            </button>
          </div>
          <p v-if="rsvpError">
            {{ rsvpError }}
          </p>
        </div>

        <div v-else-if="!canRsvp">
          <p>RSVP will be available once this event is published to AT Protocol.</p>
        </div>

        <div v-else>
          <p>Sign in with AT Protocol to RSVP.</p>
          <DialogRoot>
            <DialogTrigger as-child>
              <button type="button">
                Sign in to RSVP
              </button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent>
                <DialogTitle>Sign in with AT Protocol</DialogTitle>
                <DialogDescription>
                  Enter your AT Protocol handle to sign in and RSVP to this event.
                  Your RSVP will be stored in your own AT Protocol data repo.
                </DialogDescription>
                <form @submit.prevent="loginAtproto">
                  <label>
                    Handle:
                    <input
                      v-model="atprotoHandle"
                      type="text"
                      placeholder="alice.bsky.social"
                      required
                    >
                  </label>
                  <div>
                    <button type="submit">
                      Sign in
                    </button>
                    <DialogClose as-child>
                      <button type="button">
                        Cancel
                      </button>
                    </DialogClose>
                  </div>
                </form>
              </DialogContent>
            </DialogPortal>
          </DialogRoot>
        </div>
      </section>

      <section>
        <h2>Links</h2>
        <ul>
          <li>
            <a
              :href="`https://discord.com/events/${guild.id}/${event.id}`"
              target="_blank"
              rel="noopener"
            >View on Discord</a>
          </li>
          <li v-if="event.atprotoUri">
            <a
              :href="`https://smokesignal.events/${guild.atprotoDid}/${event.atprotoUri.split('/').pop()}`"
              target="_blank"
              rel="noopener"
            >View on Smoke Signal</a>
          </li>
        </ul>
      </section>
    </article>
  </div>
  <div v-else>
    <p>Event not found.</p>
  </div>
</template>
