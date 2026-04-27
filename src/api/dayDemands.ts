import type { MonthlyDemand } from '../components/MensalDayDemandsPanel'

export type DemandsByDate = Record<string, MonthlyDemand[]>

function normalizePriority(raw: unknown): 'baixa' | 'media' | 'importante' {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (value === 'baixa' || value === 'importante') return value
  return 'media'
}

function colorFromPriority(priority: 'baixa' | 'media' | 'importante'): string {
  if (priority === 'baixa') return '#3b82f6'
  if (priority === 'importante') return '#ef4444'
  return '#f59e0b'
}

function normalizeDemands(byDate: DemandsByDate): DemandsByDate {
  const out: DemandsByDate = {}
  for (const [dateKey, list] of Object.entries(byDate)) {
    if (!Array.isArray(list)) continue
    out[dateKey] = list.map((d) => {
      const priority = normalizePriority(d.priority)
      return {
        ...d,
        priority,
        color: colorFromPriority(priority),
      }
    })
  }
  return out
}

const API_PREFIX = '/api'

function requireLoggedUserId() {
  const raw = localStorage.getItem('tick:user')
  if (!raw) {
    throw new Error('Usuario nao autenticado')
  }
  try {
    const parsed = JSON.parse(raw) as { id?: string }
    if (!parsed?.id) throw new Error('missing id')
    return parsed.id
  } catch {
    throw new Error('Usuario nao autenticado')
  }
}

function monthPrefix(year: number, month1to12: number) {
  return `${year}-${String(month1to12).padStart(2, '0')}-`
}

/** Remove todas as chaves do mês (YYYY-MM-*) do mapa. */
export function stripMonthKeys(
  all: DemandsByDate,
  year: number,
  month1to12: number,
): DemandsByDate {
  const prefix = monthPrefix(year, month1to12)
  const out: DemandsByDate = { ...all }
  for (const k of Object.keys(out)) {
    if (k.startsWith(prefix)) delete out[k]
  }
  return out
}

/** Monta payload só com dias do mês que ainda têm itens (arrays não vazios). */
export function pickMonthEntries(
  all: DemandsByDate,
  year: number,
  month1to12: number,
): DemandsByDate {
  const prefix = monthPrefix(year, month1to12)
  const out: DemandsByDate = {}
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(prefix)) continue
    if (Array.isArray(v) && v.length > 0) out[k] = v
  }
  return out
}

export async function fetchDayDemandsForMonth(
  year: number,
  month1to12: number,
): Promise<DemandsByDate> {
  const userId = requireLoggedUserId()
  const params = new URLSearchParams({
    userId,
    year: String(year),
    month: String(month1to12),
  })
  const res = await fetch(`${API_PREFIX}/day-demands?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `GET day-demands failed: ${res.status}`)
  }
  const data = (await res.json()) as { byDate?: DemandsByDate }
  return normalizeDemands(data.byDate ?? {})
}

export async function saveDayDemandsForMonth(
  year: number,
  month1to12: number,
  byDate: DemandsByDate,
): Promise<void> {
  const userId = requireLoggedUserId()
  const sanitized = normalizeDemands(byDate)
  const res = await fetch(`${API_PREFIX}/day-demands`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, year, month: month1to12, byDate: sanitized }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `PUT day-demands failed: ${res.status}`)
  }
}

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Domingo 00:00 da semana que contém `reference`. */
export function startOfWeekSunday(reference: Date): Date {
  const d = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

/** Carrega demandas para os 7 dias (pode cruzar dois meses). */
export async function fetchDayDemandsForWeek(weekStartSunday: Date): Promise<DemandsByDate> {
  const monthKeys = new Set<string>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartSunday)
    d.setDate(weekStartSunday.getDate() + i)
    monthKeys.add(`${d.getFullYear()}-${d.getMonth() + 1}`)
  }
  let merged: DemandsByDate = {}
  for (const mk of monthKeys) {
    const [y, m] = mk.split('-').map(Number)
    const part = await fetchDayDemandsForMonth(y, m)
    merged = { ...merged, ...part }
  }
  return merged
}
