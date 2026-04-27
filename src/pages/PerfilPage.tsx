import {
  Bell,
  CheckCircle2,
  CircleOff,
  Focus,
  Link2,
  NotepadText,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useMemo } from 'react'
import SettingsSectionCard from '../components/settings/SettingsSectionCard'
import { getUserInitials, readTickStoredUser } from '../lib/tickUser'

export default function PerfilPage() {
  const user = useMemo(() => readTickStoredUser(), [])
  const userName = user?.name?.trim() ? user.name : 'Usuário Tick'
  const userEmail = user?.email ?? 'usuario@tick.app'
  const initials = getUserInitials(userName)

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 sm:h-8 sm:w-8 dark:text-zinc-300" />
        <span className="min-w-0">Perfil de usuário</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SettingsSectionCard title="Identidade e foco" icon={Focus}>
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
        </SettingsSectionCard>

        <SettingsSectionCard title="Metas e conquistas" icon={Trophy}>
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
        </SettingsSectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsSectionCard title="Integrações e ferramentas" icon={Link2}>
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
        </SettingsSectionCard>

        <SettingsSectionCard title="Privacidade e notificações" icon={Bell}>
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Email diário: ativado</li>
            <li>Lembretes de metas: ativado</li>
            <li>Modo privado: desativado</li>
            <li>Alertas sonoros: ativos</li>
          </ul>
        </SettingsSectionCard>
      </div>
    </div>
  )
}
