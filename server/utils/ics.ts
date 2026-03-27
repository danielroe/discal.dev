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
    if (event.status === 3 || event.status === 4) continue

    const eventData: ICalEventData = {
      id: `discord-${event.id}@discal.dev`,
      summary: event.name,
      description: event.description || undefined,
      start: new Date(event.startTime),
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
  }

  return calendar.toString()
}
