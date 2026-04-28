type MensalDayDemandAddFormProps = {
  newDemandTitle: string
  newDemandCategory: string
  newDemandNote: string
  newDemandPriority: 'baixa' | 'media' | 'importante'
  newDemandStartTime: string
  newDemandEndTime: string
  onNewDemandTitleChange: (value: string) => void
  onNewDemandCategoryChange: (value: string) => void
  onNewDemandNoteChange: (value: string) => void
  onNewDemandPriorityChange: (value: 'baixa' | 'media' | 'importante') => void
  onNewDemandStartTimeChange: (value: string) => void
  onNewDemandEndTimeChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export default function MensalDayDemandAddForm({
  newDemandTitle,
  newDemandCategory,
  newDemandNote,
  newDemandPriority,
  newDemandStartTime,
  newDemandEndTime,
  onNewDemandTitleChange,
  onNewDemandCategoryChange,
  onNewDemandNoteChange,
  onNewDemandPriorityChange,
  onNewDemandStartTimeChange,
  onNewDemandEndTimeChange,
  onCancel,
  onSubmit,
}: MensalDayDemandAddFormProps) {
  return (
    <div className="max-h-[62vh] shrink-0 space-y-3 overflow-y-auto rounded-xl border border-zinc-200/90 bg-zinc-100/70 p-3 dark:border-white/10 dark:bg-black/25 lg:max-h-none">
      <div>
        <label
          htmlFor="demand-title"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500"
        >
          Título
        </label>
        <input
          id="demand-title"
          value={newDemandTitle}
          onChange={(event) => onNewDemandTitleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
          autoFocus
          placeholder="Ex.: Revisar layout"
          className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        />
      </div>
      <div>
        <label
          htmlFor="demand-category"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500"
        >
          Categoria
        </label>
        <input
          id="demand-category"
          value={newDemandCategory}
          onChange={(event) => onNewDemandCategoryChange(event.target.value)}
          placeholder="Ex.: academia"
          className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        />
      </div>
      <div>
        <label
          htmlFor="demand-note"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500"
        >
          Observação
        </label>
        <textarea
          id="demand-note"
          value={newDemandNote}
          onChange={(event) => onNewDemandNoteChange(event.target.value)}
          rows={3}
          placeholder="Detalhes, links, contexto..."
          className="w-full resize-none rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        />
      </div>
      <div>
        <label
          htmlFor="demand-priority"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500"
        >
          Prioridade
        </label>
        <select
          id="demand-priority"
          value={newDemandPriority}
          onChange={(event) => onNewDemandPriorityChange(event.target.value as 'baixa' | 'media' | 'importante')}
          className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        >
          <option value="baixa">Baixa (Azul)</option>
          <option value="media">Média (Laranja)</option>
          <option value="importante">Importante (Vermelho)</option>
        </select>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-500">
          Horário na semana <span className="font-normal normal-case text-zinc-500">(opcional)</span>
        </p>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="demand-start" className="sr-only">
              Início
            </label>
            <input
              id="demand-start"
              type="time"
              value={newDemandStartTime}
              onChange={(event) => onNewDemandStartTimeChange(event.target.value)}
              className="w-full rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="demand-end" className="sr-only">
              Fim
            </label>
            <input
              id="demand-end"
              type="time"
              value={newDemandEndTime}
              onChange={(event) => onNewDemandEndTimeChange(event.target.value)}
              className="w-full rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
          Preencha início e fim para o item aparecer na grade Semana. O horário de{' '}
          <span className="font-medium text-zinc-600 dark:text-zinc-400">fim</span> é inclusivo quando cai em
          hora cheia (ex.: 13:00–17:00 ocupa até o campo das 17h).
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-zinc-300/80 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
