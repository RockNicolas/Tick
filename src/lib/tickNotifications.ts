import {
  readNotificationPreferencesForCurrentUser,
  type TickNotificationCategory,
  type TickNotificationChannel,
} from './tickSettings'

const EVENT = 'tick-notifications-changed'
const STORAGE_KEY = 'tick:notifications:inbox'
const DEDUPE_KEY = 'tick:notifications:last-triggered'

export type TickNotificationSeverity = 'normal' | 'high' | 'critical'
export type TickNotificationEventId =
  | 'task_due_soon'
  | 'goal_progress_milestone'
  | 'overdue_critical'
  | 'water_goal_completed'

export type TickNotificationEventDefinition = {
  id: TickNotificationEventId
  category: TickNotificationCategory
  severity: TickNotificationSeverity
  channels: TickNotificationChannel[]
  title: string
  body: string
}

export type TickNotificationRecord = {
  id: string
  eventId: TickNotificationEventId
  category: TickNotificationCategory
  severity: TickNotificationSeverity
  channels: TickNotificationChannel[]
  title: string
  body: string
  read: boolean
  createdAt: string
}

export const TICK_NOTIFICATION_EVENT_CATALOG: Record<TickNotificationEventId, TickNotificationEventDefinition> = {
  task_due_soon: {
    id: 'task_due_soon',
    category: 'reminders',
    severity: 'high',
    channels: ['push', 'email'],
    title: 'Lembrete de prazo',
    body: 'Você tem uma tarefa com prazo próximo. Abra o painel para revisar.',
  },
  goal_progress_milestone: {
    id: 'goal_progress_milestone',
    category: 'progress',
    severity: 'normal',
    channels: ['push', 'email'],
    title: 'Marco de progresso',
    body: 'Boa! Você alcançou um marco em uma meta.',
  },
  overdue_critical: {
    id: 'overdue_critical',
    category: 'alerts',
    severity: 'critical',
    channels: ['push', 'email'],
    title: 'Alerta crítico',
    body: 'Existe um item em atraso que precisa de atenção imediata.',
  },
  water_goal_completed: {
    id: 'water_goal_completed',
    category: 'progress',
    severity: 'normal',
    channels: ['push', 'email'],
    title: 'Meta de água concluída',
    body: 'Boa! Você bateu sua meta de hidratação de hoje.',
  },
}

export function subscribeTickNotifications(listener: () => void) {
  const wrapped = () => listener()
  window.addEventListener(EVENT, wrapped)
  window.addEventListener('storage', wrapped)
  return () => {
    window.removeEventListener(EVENT, wrapped)
    window.removeEventListener('storage', wrapped)
  }
}

function emitTickNotificationsChanged() {
  window.dispatchEvent(new Event(EVENT))
}

function readInbox(): TickNotificationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TickNotificationRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeInbox(next: TickNotificationRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    emitTickNotificationsChanged()
  } catch {
    /* ignore */
  }
}

function readDedupeMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DEDUPE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

function writeDedupeMap(value: Record<string, number>) {
  try {
    localStorage.setItem(DEDUPE_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map((part) => Number(part))
  return h * 60 + m
}

function isWithinQuietHours(now: Date, start: string, end: string) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)
  if (startMinutes === endMinutes) return true
  if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes
  return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

function canSendNow(definition: TickNotificationEventDefinition, eventId: TickNotificationEventId) {
  const prefs = readNotificationPreferencesForCurrentUser()
  if (!prefs.enabled) return false
  if (!prefs.categories[definition.category]) return false
  if (eventId === 'water_goal_completed' && !prefs.waterRemindersEnabled) return false
  const hasEnabledChannel = definition.channels.some((channel) => prefs.channels[channel])
  if (!hasEnabledChannel) return false
  if (!prefs.quietHours.enabled) return true
  const withinQuiet = isWithinQuietHours(new Date(), prefs.quietHours.start, prefs.quietHours.end)
  if (!withinQuiet) return true
  if (definition.severity === 'critical' && prefs.criticalOverrideQuietHours) return true
  return false
}

type TriggerOptions = {
  title?: string
  body?: string
  dedupeKey?: string
  minIntervalMs?: number
}

export function triggerNotificationEvent(eventId: TickNotificationEventId, options?: TriggerOptions) {
  const definition = TICK_NOTIFICATION_EVENT_CATALOG[eventId]
  const nowTs = Date.now()
  const minInterval = options?.minIntervalMs ?? 0
  let shouldPersistDedupe = false
  let dedupeMap: Record<string, number> | null = null
  if (options?.dedupeKey) {
    dedupeMap = readDedupeMap()
    const lastTs = dedupeMap[options.dedupeKey] ?? 0
    if (nowTs - lastTs < minInterval) return null
    shouldPersistDedupe = true
  }
  const shouldDispatch = canSendNow(definition, eventId)
  if (!shouldDispatch) return null
  if (shouldPersistDedupe && options?.dedupeKey && dedupeMap) {
    dedupeMap[options.dedupeKey] = nowTs
    writeDedupeMap(dedupeMap)
  }
  const prefs = readNotificationPreferencesForCurrentUser()
  const channels = definition.channels.filter((channel) => prefs.channels[channel])
  const next: TickNotificationRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventId: definition.id,
    category: definition.category,
    severity: definition.severity,
    channels,
    title: options?.title ?? definition.title,
    body: options?.body ?? definition.body,
    read: false,
    createdAt: new Date().toISOString(),
  }
  const inbox = readInbox()
  writeInbox([next, ...inbox].slice(0, 100))
  return next
}

export function listTickNotifications() {
  return readInbox()
}

export function getUnreadTickNotificationCount() {
  return readInbox().reduce((total, item) => total + (item.read ? 0 : 1), 0)
}

export function markTickNotificationAsRead(id: string) {
  const inbox = readInbox()
  const next = inbox.map((item) => (item.id === id ? { ...item, read: true } : item))
  writeInbox(next)
}

export function markAllTickNotificationsAsRead() {
  const inbox = readInbox()
  if (inbox.every((item) => item.read)) return
  writeInbox(inbox.map((item) => ({ ...item, read: true })))
}

export function clearAllTickNotifications() {
  writeInbox([])
}

export function seedTickNotificationsDemo() {
  if (readInbox().length > 0) return
  triggerNotificationEvent('task_due_soon')
  triggerNotificationEvent('goal_progress_milestone')
}
