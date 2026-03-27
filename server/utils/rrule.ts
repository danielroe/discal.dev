import type { DiscordRecurrenceRule } from './types'

const WEEKDAY_MAP = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const
const FREQ_MAP = ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY'] as const

export function discordRecurrenceToRRule(rule: DiscordRecurrenceRule): string {
  const parts: string[] = [`FREQ=${FREQ_MAP[rule.frequency]}`]

  if (rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`)
  }

  if (rule.by_weekday?.length) {
    parts.push(`BYDAY=${rule.by_weekday.map(d => WEEKDAY_MAP[d]).join(',')}`)
  }

  if (rule.by_n_weekday?.length) {
    parts.push(`BYDAY=${rule.by_n_weekday.map(nw => `${nw.n}${WEEKDAY_MAP[nw.day]}`).join(',')}`)
  }

  if (rule.by_month?.length) {
    parts.push(`BYMONTH=${rule.by_month.join(',')}`)
  }

  if (rule.by_month_day?.length) {
    parts.push(`BYMONTHDAY=${rule.by_month_day.join(',')}`)
  }

  if (rule.count) {
    parts.push(`COUNT=${rule.count}`)
  }

  if (rule.end) {
    parts.push(`UNTIL=${rule.end.replace(/[-:]/g, '').replace(/\.\d+/, '')}`)
  }

  return parts.join(';')
}
