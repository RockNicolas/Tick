import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  applyTickThemeToDocument,
  readTickTheme,
  subscribeTickTheme,
  writeTickTheme,
  type TickTheme,
} from '../lib/tickTheme'

export function useTickTheme() {
  const theme = useSyncExternalStore(
    subscribeTickTheme,
    readTickTheme,
    (): TickTheme => 'dark',
  )

  useEffect(() => {
    applyTickThemeToDocument(theme)
  }, [theme])

  const toggle = useCallback(() => {
    writeTickTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme])

  const setTheme = useCallback((next: TickTheme) => {
    writeTickTheme(next)
  }, [])

  return { theme, toggle, setTheme }
}
