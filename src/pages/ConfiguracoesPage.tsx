import {
  Calendar,
  Clock,
  Keyboard,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { SITE_NAME } from '../constants/branding'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readAutoOpenTodayPanel,
  readShowClockSeconds,
  writeAutoOpenTodayPanel,
  writeShowClockSeconds,
} from '../lib/tickSettings'

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition ${
          checked
            ? 'border-red-500/50 bg-red-600/90 shadow-[0_0_16px_rgba(220,38,38,0.25)]'
            : 'border-zinc-300/80 bg-zinc-100/90 hover:border-zinc-400 dark:border-white/15 dark:bg-black/40 dark:hover:border-white/25'
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-black/35">
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-white/[0.06]">
        <Icon className="h-5 w-5 shrink-0 text-red-400/90" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide text-zinc-800 uppercase dark:text-zinc-200">
          {title}
        </h2>
      </div>
      <div className="mt-4 min-h-0 flex-1 space-y-6">{children}</div>
    </section>
  )
}

export default function ConfiguracoesPage() {
  const tickSettingsVersion = useTickSettingsVersion()

  const [autoOpen, setAutoOpen] = useState(() => readAutoOpenTodayPanel())
  const [showSeconds, setShowSeconds] = useState(() => readShowClockSeconds())

  useEffect(() => {
    setAutoOpen(readAutoOpenTodayPanel())
    setShowSeconds(readShowClockSeconds())
  }, [tickSettingsVersion])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Settings className="h-7 w-7 shrink-0 text-zinc-600 sm:h-8 sm:w-8 dark:text-zinc-300" />
        <span className="min-w-0">Configurações</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
        Ajustes rápidos do {SITE_NAME}. As opções abaixo ficam salvas neste navegador.
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard icon={Calendar} title="Visão mensal">
          <ToggleRow
            id="toggle-auto-open"
            label="Abrir painel do dia automaticamente"
            description="Se hoje tiver demandas, o painel lateral abre sozinho ao carregar a página mensal."
            checked={autoOpen}
            onChange={(next) => {
              writeAutoOpenTodayPanel(next)
              setAutoOpen(next)
            }}
          />
        </SectionCard>

        <SectionCard icon={Clock} title="Aparência">
          <ToggleRow
            id="toggle-seconds"
            label="Mostrar segundos no relógio"
            description="No topo da visão mensal, o relógio pode mostrar ou esconder os segundos."
            checked={showSeconds}
            onChange={(next) => {
              writeShowClockSeconds(next)
              setShowSeconds(next)
            }}
          />
        </SectionCard>

        <SectionCard icon={Keyboard} title="Atalhos">
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Esc</span> — fecha o painel de
              demandas do dia (quando aberto).
            </li>
            <li>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Esc</span> — dentro do modal de
              edição de uma demanda, fecha só o modal.
            </li>
          </ul>
        </SectionCard>

        <SectionCard icon={Sparkles} title="Sobre">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{SITE_NAME}</span> — agenda e
            demandas com foco no mês atual. Versão do pacote:{' '}
            <span className="tabular-nums text-zinc-800 dark:text-zinc-300">0.0.0</span>
          </p>
        </SectionCard>
      </div>
    </div>
  )
}
