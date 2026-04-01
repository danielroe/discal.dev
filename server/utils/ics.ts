import icalGenerator from 'ical-generator'
import type { ICalCalendarData, ICalEventData } from 'ical-generator'
import { getVtimezoneComponent } from '@touch4it/ical-timezones'

import type { StoredEvent, StoredGuild } from './types'
import { discordRecurrenceToRRule } from './rrule'

const ENTITY_TYPE_LABELS: Record<number, string> = {
  1: 'Stage',
  2: 'Voice',
  3: 'External',
}

/**
 * Check whether a recurring event's next occurrence has been modified.
 *
 * Discord updates `scheduled_start_time` when a single occurrence is edited
 * but keeps `recurrence_rule.start` as the series anchor. If they represent
 * different times-of-day, the next occurrence has been rescheduled.
 */
function getOccurrenceOverride(event: StoredEvent): Date | null {
  if (!event.recurrenceRule) return null

  const seriesStart = new Date(event.recurrenceRule.start)
  const nextOccurrence = new Date(event.startTime)

  // Compare time-of-day (hours + minutes) in UTC
  if (
    seriesStart.getUTCHours() === nextOccurrence.getUTCHours()
    && seriesStart.getUTCMinutes() === nextOccurrence.getUTCMinutes()
  ) {
    return null
  }

  return nextOccurrence
}

/**
 * Compute what the original time of a modified occurrence would have been.
 *
 * Takes the date from the actual occurrence and the time-of-day from the
 * series anchor, producing the RECURRENCE-ID value (the occurrence that
 * "should have" happened before the edit).
 */
function getOriginalOccurrenceTime(seriesStart: Date, modifiedOccurrence: Date): Date {
  const original = new Date(modifiedOccurrence)
  original.setUTCHours(seriesStart.getUTCHours())
  original.setUTCMinutes(seriesStart.getUTCMinutes())
  original.setUTCSeconds(seriesStart.getUTCSeconds())
  original.setUTCMilliseconds(0)
  return original
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

    // For recurring events, use the recurrence rule's start as DTSTART (the
    // series anchor) rather than scheduled_start_time (the next occurrence).
    // Discord updates scheduled_start_time when a single occurrence is modified,
    // which would incorrectly shift the entire series in the calendar.
    const start = event.recurrenceRule?.start
      ? new Date(event.recurrenceRule.start)
      : new Date(event.startTime)

    const eventData: ICalEventData = {
      id: `discord-${event.id}@discal.dev`,
      summary: event.name,
      description: event.description || undefined,
      start,
      end: event.endTime ? new Date(event.endTime) : undefined,
      timezone: guild.timezone,
      url: `https://discord.com/events/${event.guildId}/${event.id}`,
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

    // If Discord has modified the next occurrence's time, emit an exception
    // VEVENT with RECURRENCE-ID so the calendar shows the correct time for
    // that specific occurrence without shifting the entire series.
    const override = getOccurrenceOverride(event)
    if (override && event.recurrenceRule) {
      const originalTime = getOriginalOccurrenceTime(
        new Date(event.recurrenceRule.start),
        override,
      )

      const exceptionData: ICalEventData = {
        id: `discord-${event.id}@discal.dev`,
        recurrenceId: originalTime,
        summary: event.name,
        description: event.description || undefined,
        start: override,
        end: event.endTime ? new Date(event.endTime) : undefined,
        timezone: guild.timezone,
        url: `https://discord.com/events/${event.guildId}/${event.id}`,
      }

      if (event.location) {
        exceptionData.location = { title: event.location }
      }

      calendar.createEvent(exceptionData)
    }
  }

  return calendar.toString()
}
