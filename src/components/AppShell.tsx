import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { SITE_LOGO_SRC, SITE_NAME } from '../constants/branding'
import AppBackground from './AppBackground'
import DesktopTopBar from './DesktopTopBar'
import Sidebar from './Sidebar'
import ThemeToggleButton from './ThemeToggleButton'
/*import WelcomeGreeting from './WelcomeGreeting'*/

const MD_MIN = 768

export default function AppShell() {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const mq = window.matchMedia(`(max-width: ${MD_MIN - 1}px)`)
    if (!mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_MIN}px)`)
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden text-zinc-900 dark:text-zinc-100">
      <AppBackground />
      <div className="relative z-10 flex min-h-[100dvh] flex-col md:flex-row">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60 md:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DesktopTopBar />

          <header className="relative sticky top-0 z-30 flex min-h-[3.25rem] shrink-0 items-center justify-center border-b border-zinc-200/80 bg-white/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/80 md:hidden">
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-100/80 text-zinc-800 transition hover:bg-zinc-200/80 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              aria-expanded={mobileNavOpen}
              aria-controls="app-sidebar"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              <span className="sr-only">Abrir ou fechar menu</span>
            </button>
            <img
              src={SITE_LOGO_SRC}
              alt=""
              width={120}
              height={36}
              className="h-9 w-auto max-w-[min(200px,55vw)] cursor-default object-contain object-center"
              decoding="async"
            />
            <span className="sr-only">{SITE_NAME}</span>
            <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center md:hidden">
              <ThemeToggleButton />
            </div>
          </header>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:pb-6 md:pt-[calc(3.5rem+1.25rem)] lg:px-8 lg:pb-8 lg:pt-[calc(3.5rem+1.5rem)]">
            <main
              id="main-content"
              className="glass-panel min-h-0 min-w-0 flex-1 overflow-x-auto rounded-2xl p-4 shadow-lg shadow-zinc-400/20 sm:rounded-3xl sm:p-6 dark:shadow-black/40"
            >
             {/* <WelcomeGreeting /> */}
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
