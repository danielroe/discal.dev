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

function connectAtproto() {
  if (!atprotoHandle.value) return
  navigateTo(`/auth/bluesky?handle=${encodeURIComponent(atprotoHandle.value)}&guild=${route.params.guildId}`, { external: true })
}
</script>

<template>
  <div>
    <p v-if="status === 'pending'">
      Loading...
    </p>

    <template v-else-if="guild">
      <h1>{{ guild.name }}</h1>

      <section>
        <h2>Calendar feed</h2>
        <p>Subscribe to this URL in your calendar app:</p>
        <code>{{ calendarUrl }}</code>
        <div>
          <a :href="webcalUrl">Open in calendar app</a>
          &nbsp;|&nbsp;
          <NuxtLink :to="`/calendar/${guild.calendarSlug}`">
            View calendar
          </NuxtLink>
        </div>
      </section>

      <section>
        <h2>Settings</h2>
        <fieldset>
          <legend>Default event timezone</legend>
          <label>
            Timezone used for events in the ICS feed:
            <select v-model="selectedTimezone">
              <option
                v-for="tz in timezones"
                :key="tz"
                :value="tz"
              >
                {{ tz }}
              </option>
            </select>
          </label>
          <button
            v-if="selectedTimezone !== guild.timezone"
            type="button"
            :disabled="savingTimezone"
            @click="saveTimezone"
          >
            {{ savingTimezone ? 'Saving...' : 'Save' }}
          </button>
        </fieldset>
      </section>

      <section>
        <h2>AT Protocol</h2>
        <div v-if="guild.atprotoDid && atprotoSessionValid">
          <p>
            Connected: <code>{{ guild.atprotoDid }}</code>
          </p>
          <p>Events will be published to this AT Protocol account.</p>
        </div>

        <div v-else>
          <p v-if="guild.atprotoDid && !atprotoSessionValid">
            Previously connected to <code>{{ guild.atprotoDid }}</code>, but the session has expired. Please reconnect.
          </p>
          <p v-else>
            Connect an AT Protocol account to publish events to the atmosphere.
          </p>

          <DialogRoot>
            <DialogTrigger as-child>
              <button type="button">
                {{ guild.atprotoDid ? 'Reconnect AT Protocol' : 'Connect AT Protocol' }}
              </button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent>
                <DialogTitle>Connect AT Protocol</DialogTitle>
                <DialogDescription>
                  Enter your AT Protocol handle (e.g. alice.bsky.social) to connect your account.
                  Events from this Discord server will be published to your AT Protocol data repo.
                </DialogDescription>
                <form @submit.prevent="connectAtproto">
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
                      Connect
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
        <h2>Events ({{ events.length }})</h2>
        <div v-if="events.length === 0">
          <p>No events synced yet. Events will appear after the next sync cycle (up to 5 minutes).</p>
        </div>
        <ul v-else>
          <li
            v-for="ev in events"
            :key="ev.id"
          >
            <NuxtLink :to="`/event/${ev.id}`">
              <strong>{{ ev.name }}</strong>
            </NuxtLink>
            <br>
            <NuxtTime
              :datetime="ev.startTime"
              date-style="medium"
              time-style="short"
            />
            <span v-if="ev.recurrenceRule"> (recurring)</span>
            <span v-if="ev.location"> &mdash; {{ ev.location }}</span>
          </li>
        </ul>
      </section>
    </template>

    <div v-else>
      <p>Guild not found.</p>
      <NuxtLink to="/dashboard">
        Back to dashboard
      </NuxtLink>
    </div>
  </div>
</template>
