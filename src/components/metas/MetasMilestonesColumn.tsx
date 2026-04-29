import { Droplets, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchHydrationForDate, upsertHydrationForDate } from '../../api/hydration'
import { triggerNotificationEvent } from '../../lib/tickNotifications'
import { useTickSettingsVersion } from '../../hooks/useTickSettings'
import { readWaterGoalEnabledForCurrentUser } from '../../lib/tickSettings'

type MetasMilestonesColumnProps = {
  onAddClick: () => void
}

export default function MetasMilestonesColumn({ onAddClick }: MetasMilestonesColumnProps) {
  const tickSettingsVersion = useTickSettingsVersion()
  const waterTarget = 3
  const getLocalDateKey = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const [todayKey, setTodayKey] = useState(() => getLocalDateKey())
  const [waterCups, setWaterCups] = useState(0)
  const [hydrationLoaded, setHydrationLoaded] = useState(false)
  const [waterGoalEnabled, setWaterGoalEnabled] = useState(() => readWaterGoalEnabledForCurrentUser())
  const isWaterTaskCompleted = waterCups >= waterTarget

  useEffect(() => {
    void tickSettingsVersion
    setWaterGoalEnabled(readWaterGoalEnabledForCurrentUser())
  }, [tickSettingsVersion])

  useEffect(() => {
    let cancelled = false
    setHydrationLoaded(false)
    ;(async () => {
      try {
        const cups = await fetchHydrationForDate(todayKey)
        if (cancelled) return
        setWaterCups(cups)
      } catch {
        if (cancelled) return
        setWaterCups(0)
      } finally {
        if (!cancelled) setHydrationLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [todayKey, waterTarget])

  useEffect(() => {
    if (!hydrationLoaded) return
    ;(async () => {
      try {
        await upsertHydrationForDate(todayKey, waterCups)
      } catch {
        // silently ignore persistence hiccups in this auxiliary widget
      }
    })()
  }, [hydrationLoaded, todayKey, waterCups])

  useEffect(() => {
    const id = window.setInterval(() => {
      const nextDateKey = getLocalDateKey()
      setTodayKey((prev) => (prev === nextDateKey ? prev : nextDateKey))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!hydrationLoaded) return
    if (waterCups < waterTarget) return
    triggerNotificationEvent('water_goal_completed', {
      title: 'Parabéns! Meta de água concluída',
      body: `Você completou ${waterCups}/${waterTarget} copos hoje.`,
      dedupeKey: `water_goal_completed:${todayKey}`,
      minIntervalMs: 24 * 60 * 60 * 1000,
    })
  }, [hydrationLoaded, todayKey, waterCups])

  return (
    <section className="flex flex-col gap-3">
      {waterGoalEnabled ? (
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
                aria-label="Remover uma garrafa de água"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setWaterCups((prev) => Math.min(waterTarget, prev + 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/50 bg-cyan-300/20 text-cyan-800 transition hover:bg-cyan-300/30 dark:text-cyan-100"
                aria-label="Adicionar uma garrafa de água"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            {isWaterTaskCompleted ? (
              <span className="font-medium text-emerald-600 dark:text-emerald-300" role="status" aria-live="polite">
                Voce ja completou essa tarefa diaria hoje.
              </span>
            ) : (
              'Meta extra da pagina de metas (sem agenda).'
            )}
          </div>
        </div>
      ) : null}
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
