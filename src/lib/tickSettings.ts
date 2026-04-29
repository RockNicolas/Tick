import { readTickStoredUser } from './tickUser'

const EVENT = 'tick-settings-changed'

const KEYS = {
  autoOpenToday: 'tick:settings:autoOpenToday',
  showClockSeconds: 'tick:settings:showClockSeconds',
  wishlistEnabledPrefix: 'tick:settings:wishlistEnabled',
  weekEnabledPrefix: 'tick:settings:weekEnabled',
  goalsEnabledPrefix: 'tick:settings:goalsEnabled',
  waterGoalEnabledPrefix: 'tick:settings:waterGoalEnabled',
  profileAchievementsEnabledPrefix: 'tick:settings:profileAchievementsEnabled',
  profileWishlistEnabledPrefix: 'tick:settings:profileWishlistEnabled',
  notificationsPrefsPrefix: 'tick:settings:notificationsPrefs',
} as const

export function emitTickSettingsChanged() {
  window.dispatchEvent(new Event(EVENT))
}

export function subscribeTickSettings(listener: () => void) {
  const wrapped = () => listener()
  window.addEventListener(EVENT, wrapped)
  window.addEventListener('storage', wrapped)
  return () => {
    window.removeEventListener(EVENT, wrapped)
    window.removeEventListener('storage', wrapped)
  }
}

export const tickSettingsEventName = EVENT

export type TickNotificationChannel = 'push' | 'email'
export type TickNotificationCategory = 'reminders' | 'progress' | 'alerts'

export type TickNotificationPreferences = {
  enabled: boolean
  channels: Record<TickNotificationChannel, boolean>
  categories: Record<TickNotificationCategory, boolean>
  waterRemindersEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  criticalOverrideQuietHours: boolean
}

function readBool(key: string, defaultValue: boolean) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return raw === 'true'
  } catch {
    return defaultValue
  }
}

function writeBool(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? 'true' : 'false')
    emitTickSettingsChanged()
  } catch {
    /* ignore */
  }
}

function notificationsPrefsKeyForCurrentUser() {
  const user = readTickStoredUser()
  return user?.id ? `${KEYS.notificationsPrefsPrefix}:${user.id}` : `${KEYS.notificationsPrefsPrefix}:guest`
}

const DEFAULT_NOTIFICATION_PREFERENCES: TickNotificationPreferences = {
  enabled: true,
  channels: {
    push: true,
    email: true,
  },
  categories: {
    reminders: true,
    progress: true,
    alerts: true,
  },
  waterRemindersEnabled: false,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
  criticalOverrideQuietHours: true,
}

function normalizeTime(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  if (!/^\d{2}:\d{2}$/.test(value)) return fallback
  const [h, m] = value.split(':').map((part) => Number(part))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return fallback
  if (h < 0 || h > 23 || m < 0 || m > 59) return fallback
  return value
}

export function readNotificationPreferencesForCurrentUser(): TickNotificationPreferences {
  const key = notificationsPrefsKeyForCurrentUser()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<TickNotificationPreferences>
    return {
      enabled: parsed.enabled ?? DEFAULT_NOTIFICATION_PREFERENCES.enabled,
      channels: {
        push: parsed.channels?.push ?? DEFAULT_NOTIFICATION_PREFERENCES.channels.push,
        email: parsed.channels?.email ?? DEFAULT_NOTIFICATION_PREFERENCES.channels.email,
      },
      categories: {
        reminders: parsed.categories?.reminders ?? DEFAULT_NOTIFICATION_PREFERENCES.categories.reminders,
        progress: parsed.categories?.progress ?? DEFAULT_NOTIFICATION_PREFERENCES.categories.progress,
        alerts: parsed.categories?.alerts ?? DEFAULT_NOTIFICATION_PREFERENCES.categories.alerts,
      },
      waterRemindersEnabled:
        parsed.waterRemindersEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.waterRemindersEnabled,
      quietHours: {
        enabled: parsed.quietHours?.enabled ?? DEFAULT_NOTIFICATION_PREFERENCES.quietHours.enabled,
        start: normalizeTime(parsed.quietHours?.start, DEFAULT_NOTIFICATION_PREFERENCES.quietHours.start),
        end: normalizeTime(parsed.quietHours?.end, DEFAULT_NOTIFICATION_PREFERENCES.quietHours.end),
      },
      criticalOverrideQuietHours:
        parsed.criticalOverrideQuietHours ?? DEFAULT_NOTIFICATION_PREFERENCES.criticalOverrideQuietHours,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

export function writeNotificationPreferencesForCurrentUser(value: TickNotificationPreferences) {
  const key = notificationsPrefsKeyForCurrentUser()
  try {
    localStorage.setItem(key, JSON.stringify(value))
    emitTickSettingsChanged()
  } catch {
    /* ignore */
  }
}

/** Abre o painel do dia ao carregar quando hoje tem demandas (padrão: ligado). */
export function readAutoOpenTodayPanel(): boolean {
  return readBool(KEYS.autoOpenToday, true)
}

export function writeAutoOpenTodayPanel(value: boolean) {
  writeBool(KEYS.autoOpenToday, value)
}

/** Mostra segundos no relógio da visão mensal (padrão: ligado). */
export function readShowClockSeconds(): boolean {
  return readBool(KEYS.showClockSeconds, true)
}

export function writeShowClockSeconds(value: boolean) {
  writeBool(KEYS.showClockSeconds, value)
}

function wishlistEnabledKeyForUser(userId: string) {
  return `${KEYS.wishlistEnabledPrefix}:${userId}`
}

function weekEnabledKeyForUser(userId: string) {
  return `${KEYS.weekEnabledPrefix}:${userId}`
}

function goalsEnabledKeyForUser(userId: string) {
  return `${KEYS.goalsEnabledPrefix}:${userId}`
}

function waterGoalEnabledKeyForUser(userId: string) {
  return `${KEYS.waterGoalEnabledPrefix}:${userId}`
}

function profileAchievementsEnabledKeyForUser(userId: string) {
  return `${KEYS.profileAchievementsEnabledPrefix}:${userId}`
}

function profileWishlistEnabledKeyForUser(userId: string) {
  return `${KEYS.profileWishlistEnabledPrefix}:${userId}`
}

/**
 * Controla se a lista de desejos fica ativa para o usuário logado.
 * Padrão: true (ativo).
 */
export function readWishlistEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(wishlistEnabledKeyForUser(user.id), true)
}

export function writeWishlistEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(wishlistEnabledKeyForUser(user.id), value)
}

/** Controla se a página Semana fica ativa para o usuário logado. */
export function readWeekEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(weekEnabledKeyForUser(user.id), true)
}

export function writeWeekEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(weekEnabledKeyForUser(user.id), value)
}

/** Controla se o módulo de Metas fica ativo para o usuário logado. */
export function readGoalsEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(goalsEnabledKeyForUser(user.id), true)
}

export function writeGoalsEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(goalsEnabledKeyForUser(user.id), value)
}

/** Controla se o card de meta de água fica ativo para o usuário logado. */
export function readWaterGoalEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(waterGoalEnabledKeyForUser(user.id), true)
}

export function writeWaterGoalEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(waterGoalEnabledKeyForUser(user.id), value)
}

/** Controla se o card de conquistas aparece na página de perfil para o usuário logado. */
export function readProfileAchievementsEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(profileAchievementsEnabledKeyForUser(user.id), true)
}

export function writeProfileAchievementsEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(profileAchievementsEnabledKeyForUser(user.id), value)
}

/** Controla se o card de wishlist aparece na página de perfil para o usuário logado. */
export function readProfileWishlistEnabledForCurrentUser(): boolean {
  const user = readTickStoredUser()
  if (!user?.id) return true
  return readBool(profileWishlistEnabledKeyForUser(user.id), true)
}

export function writeProfileWishlistEnabledForCurrentUser(value: boolean) {
  const user = readTickStoredUser()
  if (!user?.id) return
  writeBool(profileWishlistEnabledKeyForUser(user.id), value)
}
