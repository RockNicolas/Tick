import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type SettingsSectionCardProps = {
  icon: LucideIcon
  title: string
  children: ReactNode
  /** Quando true, preenche altura em grids (ex.: página de configurações). */
  fillHeight?: boolean
}

export default function SettingsSectionCard({
  icon: Icon,
  title,
  children,
  fillHeight,
}: SettingsSectionCardProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-black/35',
        fillHeight ? 'flex h-full min-h-0 flex-col' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-white/[0.06]">
        <Icon className="h-5 w-5 shrink-0 text-red-400/90" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide text-zinc-800 uppercase dark:text-zinc-200">
          {title}
        </h2>
      </div>
      <div className={fillHeight ? 'mt-4 min-h-0 flex-1 space-y-6' : 'mt-4'}>{children}</div>
    </section>
  )
}
