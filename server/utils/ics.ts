import icalGenerator, { ICalEventStatus } from 'ical-generator'
import type { ICalCalendarData, ICalEventData } from 'ical-generator'
import { getVtimezoneComponent } from '@touch4it/ical-timezones'

import type { StoredEvent, StoredGuild } from './types'
import { discordRecurrenceToRRule } from './rrule'

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
    const start = event.recurrenceRule?.start
      ? new Date(event.recurrenceRule.start)
      : new Date(event.startTime)

    const eventData: ICalEventData = {
      id: `discord-${event.id}@discal.dev`,
      summary: event.name,
      description,
      start,
      end: event.endTime ? new Date(event.endTime) : undefined,
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
          recurrenceId: new Date(exception.originalStartTime),
          summary: event.name,
          description,
          start: new Date(exception.startTime),
          end: exception.endTime ? new Date(exception.endTime) : undefined,
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
