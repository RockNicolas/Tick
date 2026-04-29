type DesejosSummaryProps = {
  doneWishCount: number
}

export default function DesejosSummary({ doneWishCount }: DesejosSummaryProps) {
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      {doneWishCount} item(ns) marcado(s) como concluido(s).
    </p>
  )
}
