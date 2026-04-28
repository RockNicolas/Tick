import { BookOpen, CircleDollarSign, Dumbbell, Gem, Tag, Trophy } from 'lucide-react'

type PerfilConquistasCardProps = {
  doneWishCount: number
}

export default function PerfilConquistasCard({ doneWishCount }: PerfilConquistasCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Últimas conquistas</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { id: 'goal', icon: Trophy, color: 'bg-amber-500/20 text-amber-300' },
          { id: 'fit', icon: Dumbbell, color: 'bg-cyan-500/20 text-cyan-300' },
          { id: 'money', icon: CircleDollarSign, color: 'bg-emerald-500/20 text-emerald-300' },
          { id: 'read', icon: BookOpen, color: 'bg-violet-500/20 text-violet-300' },
          { id: 'tag', icon: Tag, color: 'bg-sky-500/20 text-sky-300' },
          { id: 'gem', icon: Gem, color: 'bg-pink-500/20 text-pink-300' },
        ].map(({ id, icon: Icon, color }) => (
          <span
            key={id}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 ${color}`}
          >
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Itens concluídos: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{doneWishCount}</span>
      </p>
    </section>
  )
}
