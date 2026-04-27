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
  const b = parseHHmmToMinutes(d.endTime)
  return a !== null && b !== null && a < b
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
