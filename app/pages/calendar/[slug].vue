<script setup lang="ts">
const route = useRoute('calendar-slug')
const config = useRuntimeConfig()

const { data: guildData } = await useFetch(`/api/calendar/${route.params.slug}` as '/api/calendar/:slug')

const guild = computed(() => guildData.value?.guild)
const events = computed(() => guildData.value?.events ?? [])

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

useSeoMeta({
  title: () => guild.value ? `${guild.value.name} Events` : 'Calendar',
  description: () => guild.value ? `Upcoming events from the ${guild.value.name} Discord server` : '',
})
</script>

<template>
  <div v-if="guild">
    <h1>{{ guild.name }} Events</h1>

    <section>
      <h2>Subscribe</h2>
      <p>Add this calendar to your calendar app:</p>
      <code>{{ calendarUrl }}</code>
      <div>
        <a :href="webcalUrl">Open in calendar app</a>
      </div>
    </section>

    <section>
      <h2>Upcoming events</h2>
      <div v-if="events.length === 0">
        <p>No upcoming events.</p>
      </div>
      <ul v-else>
        <li
          v-for="ev in events"
          :key="ev.id"
        >
          <article>
            <h3>
              <NuxtLink :to="`/event/${ev.id}`">
                {{ ev.name }}
              </NuxtLink>
            </h3>
            <NuxtTime
              :datetime="ev.startTime"
              date-style="medium"
              time-style="short"
            />
            <span v-if="ev.endTime">
              &ndash; <NuxtTime
                :datetime="ev.endTime"
                date-style="medium"
                time-style="short"
              />
            </span>
            <p v-if="ev.location">
              {{ ev.location }}
            </p>
            <p v-if="ev.description">
              {{ ev.description }}
            </p>
            <p v-if="ev.recurrenceRule">
              <em>Recurring event</em>
            </p>
          </article>
        </li>
      </ul>
    </section>
  </div>
  <div v-else>
    <p>Calendar not found.</p>
  </div>
</template>
