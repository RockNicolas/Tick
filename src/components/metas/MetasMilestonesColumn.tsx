import { Droplets, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type MetasMilestonesColumnProps = {
  onAddClick: () => void
}

export default function MetasMilestonesColumn({ onAddClick }: MetasMilestonesColumnProps) {
  const waterTarget = 8
  const waterStorageKey = 'tick:water-goal'
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [waterCups, setWaterCups] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(waterStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { date?: string; cups?: number }
      if (parsed?.date !== todayKey) return
      const cups = Number(parsed?.cups ?? 0)
      if (Number.isFinite(cups)) setWaterCups(Math.max(0, Math.min(waterTarget, Math.round(cups))))
    } catch {
      // no-op
    }
  }, [todayKey])

  useEffect(() => {
    localStorage.setItem(waterStorageKey, JSON.stringify({ date: todayKey, cups: waterCups }))
  }, [todayKey, waterCups])

  return (
    <section className="flex flex-col gap-3">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-3 dark:border-white/10 dark:bg-black/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg border border-zinc-300/70 bg-zinc-100/70 dark:border-white/10 dark:bg-white/5">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-cyan-300/40 bg-cyan-500/15">
                <Droplets className="h-4 w-4 text-cyan-300" aria-hidden />
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">Agua</span>
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{waterCups} / {waterTarget}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWaterCups((prev) => Math.max(0, prev - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300/80 bg-white/80 text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              aria-label="Remover um copo de água"
            >
              <Minus className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setWaterCups((prev) => Math.min(waterTarget, prev + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/50 bg-cyan-300/20 text-cyan-800 transition hover:bg-cyan-300/30 dark:text-cyan-100"
              aria-label="Adicionar um copo de água"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
          Meta extra da pagina de metas (sem agenda).
        </div>
      </div>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/40 bg-teal-200/30 px-4 py-2.5 text-base font-medium text-zinc-900 transition hover:bg-teal-200/40 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
      >
        <Plus className="h-5 w-5" aria-hidden />
        Adicionar Meta
      </button>
    </section>
  )
}
