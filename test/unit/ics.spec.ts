import { describe, expect, it } from 'vite-plus/test'
import { generateCalendar } from '../../server/utils/ics'
import type { StoredEvent, StoredGuild } from '../../server/utils/types'

function makeGuild(overrides?: Partial<StoredGuild>): StoredGuild {
  return {
    id: '123',
    name: 'Test Server',
    icon: null,
    addedBy: 'user1',
    atprotoDid: null,
    timezone: 'UTC',
    calendarSlug: 'test-server-abc',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeEvent(overrides?: Partial<StoredEvent>): StoredEvent {
  return {
    id: '456',
    guildId: '123',
    name: 'Test Event',
    description: null,
    location: null,
    channelId: null,
    startTime: '2026-04-01T16:15:00.000Z',
    endTime: '2026-04-01T17:15:00.000Z',
    entityType: 2,
    status: 1,
    recurrenceRule: null,
    imageHash: null,
    userCount: 0,
    atprotoUri: null,
    atprotoCid: null,
    atprotoRecordVersion: null,
    lastSyncedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('generateCalendar', () => {
  it('generates a basic non-recurring event', () => {
    const ics = generateCalendar(makeGuild(), [makeEvent()])
    expect(ics).toContain('SUMMARY:Test Event')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).not.toContain('RRULE')
  })

  it('generates a recurring event with RRULE', () => {
    const event = makeEvent({
      recurrenceRule: {
        start: '2026-04-01T16:15:00.000Z',
        end: null,
        frequency: 2,
        interval: 2,
        by_weekday: [2],
        by_n_weekday: null,
        by_month: null,
        by_month_day: null,
        by_year_day: null,
        count: null,
      },
    })

    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE')
  })

  it('uses recurrenceRule.start as DTSTART for recurring events', () => {
    const event = makeEvent({
      startTime: '2026-04-15T16:15:00.000Z',
      recurrenceRule: {
        start: '2026-03-18T16:15:00.000Z',
        end: null,
        frequency: 2,
        interval: 2,
        by_weekday: [2],
        by_n_weekday: null,
        by_month: null,
        by_month_day: null,
        by_year_day: null,
        count: null,
      },
    })

    const ics = generateCalendar(makeGuild(), [event])
    // DTSTART should be the series anchor, not the next occurrence
    expect(ics).toContain('20260318T161500')
    expect(ics).not.toContain('20260415T161500')
  })

  it('emits RECURRENCE-ID exception for modified occurrences', () => {
    const event = makeEvent({
      startTime: '2026-04-01T16:15:00.000Z',
      recurrenceRule: {
        start: '2026-03-18T16:15:00.000Z',
        end: null,
        frequency: 2,
        interval: 2,
        by_weekday: [2],
        by_n_weekday: null,
        by_month: null,
        by_month_day: null,
        by_year_day: null,
        count: null,
      },
      exceptions: [
        {
          originalStartTime: '2026-04-01T16:15:00.000Z',
          startTime: '2026-04-01T14:15:00.000Z',
          endTime: null,
          isCanceled: false,
        },
      ],
    })

    const ics = generateCalendar(makeGuild(), [event])
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length
    expect(veventCount).toBe(2)
    expect(ics).toContain('RECURRENCE-ID')
  })

  it('emits CANCELLED status for cancelled occurrences', () => {
    const event = makeEvent({
      startTime: '2026-04-01T16:15:00.000Z',
      recurrenceRule: {
        start: '2026-03-18T16:15:00.000Z',
        end: null,
        frequency: 2,
        interval: 2,
        by_weekday: [2],
        by_n_weekday: null,
        by_month: null,
        by_month_day: null,
        by_year_day: null,
        count: null,
      },
      exceptions: [
        {
          originalStartTime: '2026-04-01T16:15:00.000Z',
          startTime: '2026-04-01T16:15:00.000Z',
          endTime: null,
          isCanceled: true,
        },
      ],
    })

    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).toContain('STATUS:CANCELLED')
    expect(ics).toContain('RECURRENCE-ID')
  })

  it('includes Discord event link in description', () => {
    const event = makeEvent({ description: 'Come join us!' })
    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).toContain('https://discord.com/events/123/456')
    expect(ics).toContain('Come join us!')
  })

  it('includes Discord event link even without description', () => {
    const event = makeEvent({ description: null })
    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).toContain('https://discord.com/events/123/456')
  })

  it('skips cancelled events', () => {
    const event = makeEvent({ status: 4 })
    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('converts UTC times to the guild timezone for DTSTART/DTEND', () => {
    // 2026-04-01T16:15:00Z = 12:15 EDT in America/New_York (UTC-4 in April)
    const guild = makeGuild({ timezone: 'America/New_York' })
    const event = makeEvent({
      startTime: '2026-04-01T16:15:00.000Z',
      endTime: '2026-04-01T17:15:00.000Z',
    })
    const ics = generateCalendar(guild, [event])
    expect(ics).toContain('DTSTART;TZID=America/New_York:20260401T121500')
    expect(ics).toContain('DTEND;TZID=America/New_York:20260401T131500')
  })

  it('handles DST transitions correctly', () => {
    // 2026-01-15T16:15:00Z = 11:15 EST in America/New_York (UTC-5 in January)
    const guild = makeGuild({ timezone: 'America/New_York' })
    const event = makeEvent({
      startTime: '2026-01-15T16:15:00.000Z',
      endTime: '2026-01-15T17:15:00.000Z',
    })
    const ics = generateCalendar(guild, [event])
    expect(ics).toContain('DTSTART;TZID=America/New_York:20260115T111500')
    expect(ics).toContain('DTEND;TZID=America/New_York:20260115T121500')
  })
})
