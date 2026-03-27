export interface DiscordRecurrenceRule {
  start: string
  end: string | null
  frequency: 0 | 1 | 2 | 3 // 0=YEARLY, 1=MONTHLY, 2=WEEKLY, 3=DAILY
  interval: number
  by_weekday: number[] | null // 0=Mon...6=Sun
  by_n_weekday: { n: number, day: number }[] | null
  by_month: number[] | null // 1=Jan...12=Dec
  by_month_day: number[] | null
  by_year_day: number[] | null
  count: number | null
}

export interface DiscordScheduledEvent {
  id: string
  guild_id: string
  channel_id: string | null
  creator_id: string | null
  name: string
  description: string | null
  scheduled_start_time: string
  scheduled_end_time: string | null
  privacy_level: number
  status: 1 | 2 | 3 | 4 // 1=SCHEDULED, 2=ACTIVE, 3=COMPLETED, 4=CANCELED
  entity_type: 1 | 2 | 3 // 1=STAGE, 2=VOICE, 3=EXTERNAL
  entity_id: string | null
  entity_metadata: { location?: string } | null
  user_count?: number
  image: string | null
  recurrence_rule: DiscordRecurrenceRule | null
}

export interface StoredGuild {
  id: string
  name: string
  icon: string | null
  addedBy: string
  atprotoDid: string | null
  timezone: string
  calendarSlug: string
  createdAt: string
}

export interface StoredEvent {
  id: string
  guildId: string
  name: string
  description: string | null
  location: string | null
  channelId: string | null
  startTime: string
  endTime: string | null
  entityType: 1 | 2 | 3
  status: 1 | 2 | 3 | 4
  recurrenceRule: DiscordRecurrenceRule | null
  imageHash: string | null
  userCount: number
  atprotoUri: string | null
  atprotoCid: string | null
  atprotoRecordVersion: number | null
  lastSyncedAt: string
}
