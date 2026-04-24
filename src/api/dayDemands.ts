import type { MonthlyDemand } from '../components/MensalDayDemandsPanel'

export type DemandsByDate = Record<string, MonthlyDemand[]>

const API_PREFIX = '/api'

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
  const params = new URLSearchParams({
    year: String(year),
    month: String(month1to12),
  })
  const res = await fetch(`${API_PREFIX}/day-demands?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `GET day-demands failed: ${res.status}`)
  }
  const data = (await res.json()) as { byDate?: DemandsByDate }
  return data.byDate ?? {}
}

export async function saveDayDemandsForMonth(
  year: number,
  month1to12: number,
  byDate: DemandsByDate,
): Promise<void> {
  const res = await fetch(`${API_PREFIX}/day-demands`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, month: month1to12, byDate }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `PUT day-demands failed: ${res.status}`)
  }
}
