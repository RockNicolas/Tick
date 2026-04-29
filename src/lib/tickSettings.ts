import { readTickStoredUser } from './tickUser'

const EVENT = 'tick-settings-changed'

const KEYS = {
  autoOpenToday: 'tick:settings:autoOpenToday',
  showClockSeconds: 'tick:settings:showClockSeconds',
  wishlistEnabledPrefix: 'tick:settings:wishlistEnabled',
  weekEnabledPrefix: 'tick:settings:weekEnabled',
  goalsEnabledPrefix: 'tick:settings:goalsEnabled',
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
