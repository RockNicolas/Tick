import {
  Bell,
  CheckCircle2,
  CircleOff,
  Focus,
  Link2,
  NotepadText,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useMemo } from 'react'

type StoredUser = {
  id: string
  name: string
  email: string
}

function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem('tick:user')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredUser
    if (!parsed?.id || !parsed?.name || !parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

function getUserInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-black/35">
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-white/[0.06]">
        <Icon className="h-5 w-5 shrink-0 text-red-400/90" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide text-zinc-800 uppercase dark:text-zinc-200">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function PerfilPage() {
  const user = useMemo(() => readStoredUser(), [])
  const userName = user?.name ?? 'Usuário Tick'
  const userEmail = user?.email ?? 'usuario@tick.app'
  const initials = getUserInitials(userName)

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 sm:h-8 sm:w-8 dark:text-zinc-300" />
        <span className="min-w-0">Perfil de usuário</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard title="Identidade e foco" icon={Focus}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-300/80 bg-zinc-100 text-xl font-semibold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
              <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{userEmail}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Membro desde abril de 2026</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Metas e conquistas" icon={Trophy}>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              4 metas ativas
            </li>
            <li className="flex items-center gap-2">
              <NotepadText className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
              19 tarefas concluídas nesta semana
            </li>
            <li className="flex items-center gap-2">
              <CircleOff className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              Foco semanal: produtividade
            </li>
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Integrações e ferramentas" icon={Link2}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Google Calendar', connected: true },
              { label: 'Outlook Calendar', connected: false },
              { label: 'Notion', connected: true },
              { label: 'Slack', connected: false },
            ].map(({ label, connected }) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-200/80 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-zinc-800 dark:text-zinc-200">{label}</p>
                <p
                  className={`mt-1 text-xs ${
                    connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {connected ? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Privacidade e notificações" icon={Bell}>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Email diário: ativado</li>
            <li>Lembretes de metas: ativado</li>
            <li>Modo privado: desativado</li>
            <li>Alertas sonoros: ativos</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}
