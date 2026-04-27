import { Trash2, X } from 'lucide-react'

type MensalDayDemandEditDialogProps = {
  open: boolean
  dateLabel: string
  editTitle: string
  onEditTitleChange: (value: string) => void
  editCategory: string
  onEditCategoryChange: (value: string) => void
  editNote: string
  onEditNoteChange: (value: string) => void
  editPriority: 'baixa' | 'media' | 'importante'
  onEditPriorityChange: (value: 'baixa' | 'media' | 'importante') => void
  editStartTime: string
  onEditStartTimeChange: (value: string) => void
  editEndTime: string
  onEditEndTimeChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
  onDelete: () => void
}

export default function MensalDayDemandEditDialog({
  open,
  dateLabel,
  editTitle,
  onEditTitleChange,
  editCategory,
  onEditCategoryChange,
  editNote,
  onEditNoteChange,
  editPriority,
  onEditPriorityChange,
  editStartTime,
  onEditStartTimeChange,
  editEndTime,
  onEditEndTimeChange,
  onCancel,
  onSubmit,
  onDelete,
}: MensalDayDemandEditDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Fechar edição"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/75"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-demand-dialog-title"
        className="relative z-[101] flex max-h-[86vh] w-[min(94vw,860px)] flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-3 shadow-xl shadow-zinc-400/15 dark:border-white/15 dark:bg-zinc-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              id="edit-demand-dialog-title"
              className="text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-red-300/90"
            >
              Editar demanda
            </p>
            <p className="mt-1 truncate text-sm text-zinc-900 dark:text-zinc-400">{dateLabel}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-900 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3">
            <div className="md:col-span-2">
              <label
                htmlFor="edit-demand-title"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-zinc-500"
              >
                Título
              </label>
              <input
                id="edit-demand-title"
                value={editTitle}
                onChange={(event) => onEditTitleChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    onSubmit()
                  }
                }}
                autoFocus
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
              />
            </div>
            <div>
              <label
                htmlFor="edit-demand-category"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-zinc-500"
              >
                Categoria
              </label>
              <input
                id="edit-demand-category"
                value={editCategory}
                onChange={(event) => onEditCategoryChange(event.target.value)}
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
              />
            </div>
            <div className="md:row-span-2">
              <label
                htmlFor="edit-demand-note"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-zinc-500"
              >
                Observação
              </label>
              <textarea
                id="edit-demand-note"
                value={editNote}
                onChange={(event) => onEditNoteChange(event.target.value)}
                rows={6}
                className="w-full resize-none rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
              />
            </div>
            <div>
              <label
                htmlFor="edit-demand-priority"
                className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-zinc-500"
              >
                Prioridade
              </label>
              <select
                id="edit-demand-priority"
                value={editPriority}
                onChange={(event) => onEditPriorityChange(event.target.value as 'baixa' | 'media' | 'importante')}
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
              >
                <option value="baixa">Baixa (Azul)</option>
                <option value="media">Média (Laranja)</option>
                <option value="importante">Importante (Vermelho)</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-900 dark:text-zinc-500">
                Horário na semana
              </p>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={editStartTime}
                  onChange={(event) => onEditStartTimeChange(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
                  aria-label="Hora início"
                />
                <input
                  type="time"
                  value={editEndTime}
                  onChange={(event) => onEditEndTimeChange(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
                  aria-label="Hora fim"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                Fim = horário de término na semana (a barra vai até esse horário).
              </p>
            </div>
            <div className="flex gap-2 pt-1 md:col-span-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-zinc-300/80 px-3 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200/80 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Salvar
              </button>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-800/25 bg-red-100/90 px-3 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-red-200/80 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20 md:col-span-2"
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
              Excluir demanda
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
