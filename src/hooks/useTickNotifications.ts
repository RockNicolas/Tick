import { useEffect, useState } from 'react'
import { subscribeTickNotifications } from '../lib/tickNotifications'

export function useTickNotificationsVersion() {
  const [version, setVersion] = useState(0)
  useEffect(() => subscribeTickNotifications(() => setVersion((v) => v + 1)), [])
  return version
}
