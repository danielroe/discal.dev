import { describe, expect, it } from 'vite-plus/test'
import { discordRecurrenceToRRule } from '../../server/utils/rrule'
import type { DiscordRecurrenceRule } from '../../server/utils/types'

function makeRule(overrides: Partial<DiscordRecurrenceRule>): DiscordRecurrenceRule {
  return {
    start: '2026-01-01T00:00:00Z',
    end: null,
    frequency: 2,
    interval: 1,
    by_weekday: null,
    by_n_weekday: null,
    by_month: null,
    by_month_day: null,
    by_year_day: null,
    count: null,
    ...overrides,
  }
}

describe('discordRecurrenceToRRule', () => {
  it('converts a simple weekly rule', () => {
    const rule = makeRule({ frequency: 2, by_weekday: [2] })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=WEEKLY;BYDAY=WE')
  })

  it('converts every other week', () => {
    const rule = makeRule({ frequency: 2, interval: 2, by_weekday: [2] })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=WEEKLY;INTERVAL=2;BYDAY=WE')
  })

  it('converts weekdays (Mon-Fri)', () => {
    const rule = makeRule({ frequency: 3, by_weekday: [0, 1, 2, 3, 4] })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR')
  })

  it('converts monthly on nth weekday (4th Wednesday)', () => {
    const rule = makeRule({ frequency: 1, by_n_weekday: [{ n: 4, day: 2 }] })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=MONTHLY;BYDAY=4WE')
  })

  it('converts yearly on specific date (July 24)', () => {
    const rule = makeRule({ frequency: 0, by_month: [7], by_month_day: [24] })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=YEARLY;BYMONTH=7;BYMONTHDAY=24')
  })

  it('includes COUNT when present', () => {
    const rule = makeRule({ frequency: 2, by_weekday: [0], count: 12 })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=WEEKLY;BYDAY=MO;COUNT=12')
  })

  it('includes UNTIL when end is present', () => {
    const rule = makeRule({ frequency: 2, by_weekday: [4], end: '2026-12-31T23:59:59.000Z' })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=WEEKLY;BYDAY=FR;UNTIL=20261231T235959Z')
  })

  it('handles simple daily with no extra params', () => {
    const rule = makeRule({ frequency: 3 })
    expect(discordRecurrenceToRRule(rule)).toBe('FREQ=DAILY')
  })
})
