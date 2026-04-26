import { useEffect, useRef, useState } from 'react'
import { Bell, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggleButton from './ThemeToggleButton'

type StoredUser = {
  id: string
  name: string
  email: string
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

export default function DesktopTopBar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('tick:user')
    if (!raw) {
      setUser(null)
      return
    }
    try {
      const parsed = JSON.parse(raw) as StoredUser
      if (parsed?.id && parsed?.email) {
        setUser(parsed)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      const target = event.target
      if (target instanceof Node && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const handleAccountClick = () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    setMenuOpen((value) => !value)
  }

  const handleLogout = () => {
    localStorage.removeItem('tick:user')
    setUser(null)
    setMenuOpen(false)
    navigate('/auth/login')
  }

  return (
    <header
      className="relative z-30 flex h-14 w-full shrink-0 items-center justify-end gap-0.5 border-b border-zinc-200/80 bg-white/85 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/90 md:pl-4 md:pr-5"
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
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className={[
            'inline-flex min-h-10 min-w-10 items-center justify-center transition',
            user
              ? 'h-10 w-10 rounded-full border border-zinc-300/80 bg-zinc-100 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/20'
              : 'rounded-xl text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100',
          ].join(' ')}
          aria-label="Conta"
          aria-haspopup={user ? 'menu' : undefined}
          aria-expanded={user ? menuOpen : undefined}
          onClick={handleAccountClick}
        >
          {user ? (
            <span aria-hidden>{getUserInitials(user.name)}</span>
          ) : (
            <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          )}
        </button>

        {user && menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-44 rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => {
                setMenuOpen(false)
                navigate('/perfil')
              }}
            >
              Perfil 
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={handleLogout}
            >
              Deslogar
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
