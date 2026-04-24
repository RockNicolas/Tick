import { Bell, UserRound } from 'lucide-react'
import ThemeToggleButton from './ThemeToggleButton'

export default function DesktopTopBar() {
  return (
    <header
      className="fixed left-[13.5rem] right-0 top-0 z-30 hidden h-14 items-center justify-end gap-0.5 border-b border-zinc-200/80 bg-white/85 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/90 md:flex md:pl-4 md:pr-5"
      role="banner"
    >
      <ThemeToggleButton />
      <button
        type="button"
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
        aria-label="Conta"
      >
        <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </button>
    </header>
  )
}
