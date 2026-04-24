const STORAGE_KEY = 'tick:theme'
const EVENT = 'tick-theme-changed'

export type TickTheme = 'dark' | 'light'

export function readTickTheme(): TickTheme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTickThemeToDocument(theme: TickTheme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function writeTickTheme(theme: TickTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTickThemeToDocument(theme)
    window.dispatchEvent(new Event(EVENT))
  } catch {
    /* ignore */
  }
}

export function initTickThemeFromStorage() {
  applyTickThemeToDocument(readTickTheme())
}

export function subscribeTickTheme(listener: () => void) {
  const wrapped = () => listener()
  window.addEventListener(EVENT, wrapped)
  window.addEventListener('storage', wrapped)
  return () => {
    window.removeEventListener(EVENT, wrapped)
    window.removeEventListener('storage', wrapped)
  }
}
