import { useMemo, useState } from 'react'
import { X } from 'lucide-react'

const TZ_BR = 'America/Sao_Paulo'

function getHourBrazil(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ_BR,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const hourPart = parts.find((p) => p.type === 'hour')?.value
  return Number.parseInt(hourPart ?? '0', 10)
}

function periodGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const USER_NAME = 'Niicolas'

export default function WelcomeGreeting() {
  const [dismissed, setDismissed] = useState(false)

  const message = useMemo(() => {
    const hour = getHourBrazil()
    const greet = periodGreeting(hour)
    return `${greet}, ${USER_NAME} — vamos dar uma olhada na sua agenda hoje.`
  }, [])

  if (dismissed) return null

  return (
    <div
      className="relative mb-4 rounded-2xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 pr-11 text-sm leading-relaxed text-zinc-100 shadow-sm backdrop-blur-md sm:mb-6 sm:rounded-3xl sm:px-5 sm:py-4 sm:text-base"
      role="status"
    >
      <p className="min-w-0">{message}</p>
      <button
        type="button"
        className="absolute right-2 top-2 inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
        aria-label="Fechar mensagem"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}
