import { useEffect, useState } from 'react'
import { subscribeTickSettings } from '../lib/tickSettings'

/** Força re-render quando preferências em `localStorage` mudarem (mesma aba ou outra). */
export function useTickSettingsVersion() {
  const [version, setVersion] = useState(0)
  useEffect(() => subscribeTickSettings(() => setVersion((v) => v + 1)), [])
  return version
}
