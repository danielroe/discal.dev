<script setup lang="ts">
const route = useRoute('calendar-slug')
const config = useRuntimeConfig()

const { data: guildData } = await useFetch(`/api/calendar/${route.params.slug}` as '/api/calendar/:slug')

const guild = computed(() => guildData.value?.guild)
const events = computed(() => guildData.value?.events ?? [])
const pastEvents = computed(() => guildData.value?.pastEvents ?? [])

const showPastEvents = ref(false)

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
  <div class="page-container">
    <template v-if="guild">
      <h1 class="heading-1 mb-8">
        {{ guild.name }} Events
      </h1>

      <!-- Subscribe section -->
      <AppCard
        highlight
        class="mb-10"
      >
        <h2 class="heading-2 mb-3">
          subscribe
        </h2>
        <p class="text-body text-sm mb-3">
          add this calendar to your calendar app:
        </p>
        <CopyableCode :value="calendarUrl" />
        <div class="mt-4">
          <AppButton
            variant="primary"
            size="sm"
            :href="webcalUrl"
          >
            open in calendar app
          </AppButton>
        </div>
      </AppCard>

      <!-- Events -->
      <section>
        <h2 class="heading-2 mb-4">
          upcoming events
        </h2>
        <EmptyState
          v-if="events.length === 0"
          title="No upcoming events"
          description="There are no events scheduled right now. Check back later."
        />
        <div
          v-else
          class="space-y-4"
        >
          <NuxtLink
            v-for="ev in events"
            :key="ev.id"
            :to="`/event/${ev.id}`"
            class="card-interactive p-5 block no-underline"
          >
            <article class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="heading-3 mb-2">
                  {{ ev.name }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <NuxtTime
                    :datetime="ev.startTime"
                    date-style="medium"
                    time-style="short"
                    class="text-small"
                  />
                  <span v-if="ev.endTime">
                    <span class="text-ink-muted">&ndash;</span>
                    <NuxtTime
                      :datetime="ev.endTime"
                      date-style="medium"
                      time-style="short"
                      class="text-small"
                    />
                  </span>
                  <span
                    v-if="ev.recurrenceRule"
                    class="badge-accent"
                  >Recurring</span>
                </div>
                <p
                  v-if="ev.location"
                  class="text-small mb-1"
                >
                  {{ ev.location }}
                </p>
                <p
                  v-if="ev.description"
                  class="text-body text-sm line-clamp-2"
                >
                  {{ ev.description }}
                </p>
              </div>
              <svg
                class="size-5 text-ink-muted shrink-0 mt-1 group-hover/card:text-primary transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              ><path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              /></svg>
            </article>
          </NuxtLink>
        </div>
      </section>

      <!-- Past events -->
      <section
        v-if="pastEvents.length > 0"
        class="mt-10"
      >
        <button
          type="button"
          class="flex items-center gap-2 heading-2 mb-4 cursor-pointer select-none"
          @click="showPastEvents = !showPastEvents"
        >
          <svg
            class="size-5 text-ink-muted transition-transform duration-200"
            :class="showPastEvents ? 'rotate-90' : ''"
            viewBox="0 0 20 20"
            fill="currentColor"
          ><path
            fill-rule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clip-rule="evenodd"
          /></svg>
          past events
          <span class="text-ink-muted font-400 text-lg">({{ pastEvents.length }})</span>
        </button>
        <div
          v-if="showPastEvents"
          class="space-y-4"
        >
          <NuxtLink
            v-for="ev in pastEvents"
            :key="ev.id"
            :to="`/event/${ev.id}`"
            class="card-interactive p-5 block no-underline opacity-70"
          >
            <article class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="heading-3 mb-2">
                  {{ ev.name }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <NuxtTime
                    :datetime="ev.startTime"
                    date-style="medium"
                    time-style="short"
                    class="text-small"
                  />
                  <span class="badge-success">completed</span>
                </div>
                <p
                  v-if="ev.description"
                  class="text-body text-sm line-clamp-2"
                >
                  {{ ev.description }}
                </p>
              </div>
              <svg
                class="size-5 text-ink-muted shrink-0 mt-1 group-hover/card:text-primary transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              ><path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              /></svg>
            </article>
          </NuxtLink>
        </div>
      </section>
    </template>

    <!-- Not found -->
    <EmptyState
      v-else
      title="Calendar not found"
      description="This calendar doesn't exist or the link may be incorrect."
    />
  </div>
</template>
