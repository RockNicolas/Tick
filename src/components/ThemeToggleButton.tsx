import { Moon, Sun } from 'lucide-react'
import { useTickTheme } from '../hooks/useTickTheme'

type ThemeToggleButtonProps = {
  className?: string
}

const baseClass =
  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100'

export default function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { theme, toggle } = useTickTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className={className ? `${baseClass} ${className}` : baseClass}
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  )
}
