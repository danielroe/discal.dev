import icalGenerator, { ICalEventStatus } from 'ical-generator'
import type { ICalCalendarData, ICalEventData } from 'ical-generator'
import { getVtimezoneComponent } from '@touch4it/ical-timezones'

import type { StoredEvent, StoredGuild } from './types'
import { discordRecurrenceToRRule } from './rrule'

/**
 * Convert a UTC ISO string to a local-time string in the given IANA timezone.
 *
 * ical-generator's `formatDate` uses `Date.getHours()` (server-local time)
 * when a timezone is set, rather than converting to the specified timezone.
 * To work around this we pre-convert dates to timezone-local strings (without
 * a `Z` suffix) so the library emits the correct `DTSTART;TZID=…` values.
 */
function toLocalDateTimeString(utcISO: string, timezone: string): string {
  const d = new Date(utcISO)
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const p: Record<string, string> = {}
  for (const part of parts) {
    p[part.type] = part.value
  }

  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`
}

const ENTITY_TYPE_LABELS: Record<number, string> = {
  1: 'Stage',
  2: 'Voice',
  3: 'External',
}

export function generateCalendar(guild: StoredGuild, events: StoredEvent[]): string {
  const calendarData: ICalCalendarData = {
    name: `${guild.name} Events`,
    description: `Events from the ${guild.name} Discord server`,
    timezone: { name: guild.timezone, generator: getVtimezoneComponent },
    prodId: { company: 'discal.dev', product: 'discal', language: 'EN' },
    ttl: 300,
  }

  const calendar = icalGenerator(calendarData)

  for (const event of events) {
    if (event.status === 4) continue

    const discordUrl = `https://discord.com/events/${event.guildId}/${event.id}`

    const descriptionParts: string[] = []
    if (event.description) {
      descriptionParts.push(event.description)
    }
    descriptionParts.push(discordUrl)
    const description = descriptionParts.join('\n\n')

    // For recurring events, use the recurrence rule's start as DTSTART (the
    // series anchor) rather than scheduled_start_time (the next occurrence).
    const startISO = event.recurrenceRule?.start || event.startTime

    const eventData: ICalEventData = {
      id: `discord-${event.id}@discal.dev`,
      summary: event.name,
      description,
      start: toLocalDateTimeString(startISO, guild.timezone),
      end: event.endTime ? toLocalDateTimeString(event.endTime, guild.timezone) : undefined,
      timezone: guild.timezone,
      url: discordUrl,
    }

    if (event.location) {
      eventData.location = { title: event.location }
    }

    const label = ENTITY_TYPE_LABELS[event.entityType]
    if (label) {
      eventData.categories = [{ name: label }]
    }

    const icalEvent = calendar.createEvent(eventData)

    if (event.recurrenceRule) {
      icalEvent.repeating(discordRecurrenceToRRule(event.recurrenceRule))
    }

    // Emit exception VEVENTs for per-occurrence modifications.
    // Discord provides these via guild_scheduled_event_exceptions
    if (event.exceptions?.length) {
      for (const exception of event.exceptions) {
        const exceptionData: ICalEventData = {
          id: `discord-${event.id}@discal.dev`,
          recurrenceId: toLocalDateTimeString(exception.originalStartTime, guild.timezone),
          summary: event.name,
          description,
          start: toLocalDateTimeString(exception.startTime, guild.timezone),
          end: exception.endTime ? toLocalDateTimeString(exception.endTime, guild.timezone) : undefined,
          timezone: guild.timezone,
          url: discordUrl,
        }

        if (event.location) {
          exceptionData.location = { title: event.location }
        }

        const exceptionEvent = calendar.createEvent(exceptionData)

        if (exception.isCanceled) {
          exceptionEvent.status(ICalEventStatus.CANCELLED)
        }
      }
    }
  }

  return calendar.toString()
}
