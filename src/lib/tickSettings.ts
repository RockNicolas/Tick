const EVENT = 'tick-settings-changed'

const KEYS = {
  autoOpenToday: 'tick:settings:autoOpenToday',
  showClockSeconds: 'tick:settings:showClockSeconds',
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
