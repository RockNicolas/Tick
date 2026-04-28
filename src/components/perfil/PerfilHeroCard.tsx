type PerfilHeroCardProps = {
  initials: string
  userName: string
  userEmail: string
}

export default function PerfilHeroCard({ initials, userName, userEmail }: PerfilHeroCardProps) {
  return (
    <section className="w-full max-w-[220px] self-start rounded-2xl border border-zinc-200/90 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-black/35">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-zinc-100/70 text-4xl font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{userEmail}</p>
        </div>
      </div>
    </section>
  )
}
