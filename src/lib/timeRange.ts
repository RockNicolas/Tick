/** Minutos desde meia-noite (0–1440). Aceita HH:mm ou HH:mm:ss (comum em `<input type="time">`). */
export function parseHHmmToMinutes(s: string | null | undefined): number | null {
  if (s == null || typeof s !== 'string') return null
  const t = s.trim()
  if (!t) return null
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(t)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  const sec = m[3] != null ? Number(m[3]) : 0
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(min) ||
    !Number.isFinite(sec) ||
    h < 0 ||
    h > 23 ||
    min < 0 ||
    min > 59 ||
    sec < 0 ||
    sec > 59
  ) {
    return null
  }
  return h * 60 + min + sec / 60
}

export function demandHasTimeRange(d: {
  startTime?: string | null
  endTime?: string | null
}): boolean {
  const a = parseHHmmToMinutes(d.startTime)
  const bRaw = parseHHmmToMinutes(d.endTime)
  const b = bRaw === null ? null : expandInclusiveHourEnd(bRaw)
  return a !== null && b !== null && a < b
}

/**
 * A UI semanal usa "até HH:00" como inclusivo da hora final.
 * Ex.: 13:00–17:00 ocupa visualmente até 18:00 (inclui o campo das 17h).
 */
export function expandInclusiveHourEnd(endMin: number): number {
  if (!Number.isFinite(endMin)) return endMin
  const rounded = Math.round(endMin)
  const isWholeHour = rounded % 60 === 0
  if (!isWholeHour) return endMin
  return Math.min(24 * 60, rounded + 60)
}

export function clipMinutesToView(
  startMin: number,
  endMin: number,
  viewStart: number,
  viewEnd: number,
): { start: number; end: number } | null {
  const s = Math.max(startMin, viewStart)
  const e = Math.min(endMin, viewEnd)
  if (s >= e) return null
  return { start: s, end: e }
}
