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
    expect(ics).not.toContain('RECURRENCE-ID')
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
    expect(ics).not.toContain('RECURRENCE-ID')
  })

  it('emits a RECURRENCE-ID exception when next occurrence time differs from series anchor', () => {
    // Series starts at 16:15, but Discord has moved today's occurrence to 15:15
    const event = makeEvent({
      startTime: '2026-04-01T15:15:00.000Z',
      endTime: '2026-04-01T16:15:00.000Z',
      recurrenceRule: {
        start: '2026-03-18T16:15:00.000Z', // original series anchor at 16:15
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

    // Should have two VEVENTs: the series and the exception
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length
    expect(veventCount).toBe(2)

    // Series should use recurrence rule start as DTSTART
    expect(ics).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE')

    // Exception should have RECURRENCE-ID pointing to what the original
    // occurrence time would have been (Apr 1 at 16:15)
    expect(ics).toContain('RECURRENCE-ID')
  })

  it('does not emit exception when occurrence time matches series anchor', () => {
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
    })

    const ics = generateCalendar(makeGuild(), [event])
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length
    expect(veventCount).toBe(1)
    expect(ics).not.toContain('RECURRENCE-ID')
  })

  it('skips cancelled events', () => {
    const event = makeEvent({ status: 4 })
    const ics = generateCalendar(makeGuild(), [event])
    expect(ics).not.toContain('BEGIN:VEVENT')
  })
})
