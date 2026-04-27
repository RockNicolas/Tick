import { Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { demandHasTimeRange } from '../lib/timeRange'

export type MonthlyDemand = {
  title: string
  category: string
  note: string
  done: boolean
  priority?: 'baixa' | 'media' | 'importante'
  color?: string
  /** "HH:mm" local; ambos preenchidos aparecem na grade Semana. */
  startTime?: string | null
  endTime?: string | null
}

export type MensalDayDemandsPanelProps = {
  dateLabel: string
  demands: MonthlyDemand[]
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
  onAddDemand: () => void
  onUpdateDemand: (index: number, demand: MonthlyDemand) => void
  onToggleDemandDone: (index: number) => void
  onRemoveDemand: (index: number) => void
  onClose: () => void
  className?: string
}

export default function MensalDayDemandsPanel({
  dateLabel,
  demands,
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
  onAddDemand,
  onUpdateDemand,
  onToggleDemandDone,
  onRemoveDemand,
  onClose,
  className,
}: MensalDayDemandsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('geral')
  const [editNote, setEditNote] = useState('')
  const [editPriority, setEditPriority] = useState<'baixa' | 'media' | 'importante'>('media')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')

  useEffect(() => {
    setShowAddForm(false)
    setEditingIndex(null)
    setEditTitle('')
    setEditCategory('geral')
    setEditNote('')
    setEditPriority('media')
    onNewDemandTitleChange('')
    onNewDemandCategoryChange('geral')
    onNewDemandNoteChange('')
    onNewDemandPriorityChange('media')
    onNewDemandStartTimeChange('')
    onNewDemandEndTimeChange('')
  }, [
    dateLabel,
    onNewDemandCategoryChange,
    onNewDemandEndTimeChange,
    onNewDemandNoteChange,
    onNewDemandPriorityChange,
    onNewDemandStartTimeChange,
    onNewDemandTitleChange,
  ])

  useEffect(() => {
    if (editingIndex !== null && editingIndex >= demands.length) {
      setEditingIndex(null)
      setEditTitle('')
      setEditCategory('geral')
      setEditNote('')
      setEditPriority('media')
      setEditStartTime('')
      setEditEndTime('')
    }
  }, [demands.length, editingIndex])

  useEffect(() => {
    if (editingIndex === null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [editingIndex])

  useEffect(() => {
    if (editingIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setEditingIndex(null)
        setEditTitle('')
        setEditCategory('geral')
        setEditNote('')
        setEditPriority('media')
        setEditStartTime('')
        setEditEndTime('')
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [editingIndex])

  const cancelAdd = () => {
    onNewDemandTitleChange('')
    onNewDemandCategoryChange('geral')
    onNewDemandNoteChange('')
    onNewDemandPriorityChange('media')
    onNewDemandStartTimeChange('')
    onNewDemandEndTimeChange('')
    setShowAddForm(false)
  }

  const submitAdd = () => {
    if (!newDemandTitle.trim()) return
    onAddDemand()
    setShowAddForm(false)
  }

  const openEdit = (index: number) => {
    const item = demands[index]
    if (!item) return
    setShowAddForm(false)
    setEditingIndex(index)
    setEditTitle(item.title)
    setEditCategory(item.category || 'geral')
    setEditNote(item.note)
    setEditPriority(item.priority ?? 'media')
    setEditStartTime(item.startTime ?? '')
    setEditEndTime(item.endTime ?? '')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditTitle('')
    setEditCategory('geral')
    setEditNote('')
    setEditPriority('media')
    setEditStartTime('')
    setEditEndTime('')
  }

  const submitEdit = () => {
    if (editingIndex === null) return
    const title = editTitle.trim()
    if (!title) return
    onUpdateDemand(editingIndex, {
      title,
      category: editCategory.trim() || 'geral',
      note: editNote.trim(),
      priority: editPriority,
      color: editPriority === 'baixa' ? '#3b82f6' : editPriority === 'importante' ? '#ef4444' : '#f59e0b',
      done: demands[editingIndex]?.done ?? false,
      startTime: editStartTime.trim() || null,
      endTime: editEndTime.trim() || null,
    })
    cancelEdit()
  }

  const confirmDelete = () => {
    if (editingIndex === null) return
    onRemoveDemand(editingIndex)
    cancelEdit()
  }

  const openNewDemand = () => {
    setEditingIndex(null)
    setEditTitle('')
    setEditCategory('geral')
    setEditNote('')
    setEditPriority('media')
    setEditStartTime('')
    setEditEndTime('')
    setShowAddForm(true)
  }

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-2xl shadow-zinc-400/20 dark:border-white/10 dark:bg-zinc-950/95 dark:shadow-black/50 ${className ?? ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-900 dark:text-red-300/90">
            Demandas do dia
          </p>
          <h2 className="mt-1 break-words text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">
            {dateLabel}
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-600 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
          onClick={onClose}
          aria-label="Fechar lateral"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {!showAddForm ? (
          <button
            type="button"
            onClick={openNewDemand}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300/80 bg-zinc-50/80 px-3 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-red-400/50 hover:bg-red-50 dark:border-white/20 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-zinc-50"
          >
            <Plus className="h-4 w-4 shrink-0 text-red-400" />
            Nova demanda
          </button>
        ) : (
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
                    submitAdd()
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
                Preencha início e fim para o item aparecer na grade Semana.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelAdd}
                className="flex-1 rounded-lg border border-zinc-300/80 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200/80 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitAdd}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {demands.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300/70 p-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
              Nenhuma demanda cadastrada para este dia.
            </p>
          ) : (
            <ul className="space-y-2">
              {demands.map((demand, index) => (
                <li key={`demand-${index}`}>
                  <div className="flex items-start gap-2 rounded-xl border border-zinc-200/90 bg-white/80 p-2 transition hover:border-red-300/60 hover:bg-red-50/40 dark:border-white/10 dark:bg-black/30 dark:hover:border-red-400/30 dark:hover:bg-black/45">
                    <button
                      type="button"
                      aria-label={
                        demand.done
                          ? 'Marcar demanda como pendente'
                          : 'Marcar demanda como concluída'
                      }
                      onClick={() => onToggleDemandDone(index)}
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                        demand.done
                          ? 'border-emerald-600/50 bg-emerald-100/90 text-zinc-900 dark:border-emerald-400/70 dark:bg-emerald-500/20 dark:text-emerald-200'
                          : 'border-zinc-300/80 bg-zinc-100/80 text-transparent hover:border-emerald-500/50 dark:border-white/25 dark:bg-black/20 dark:hover:border-emerald-400/50'
                      }`}
                    >
                      ✓
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p
                        className={`text-sm font-semibold ${
                          demand.done
                            ? 'text-zinc-500 line-through dark:text-zinc-400'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {demand.title}
                      </p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                        {demand.category || 'geral'}
                        {demand.priority ? ` · ${demand.priority}` : ''}
                        {demandHasTimeRange(demand)
                          ? ` · ${demand.startTime}–${demand.endTime}`
                          : ''}
                      </p>
                      {demand.note ? (
                        <p
                          className={`mt-1 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap break-words text-xs leading-relaxed ${
                            demand.done
                              ? 'text-zinc-500 dark:text-zinc-500'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {demand.note}
                        </p>
                      ) : null}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fechar edição"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/75"
            onClick={cancelEdit}
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
                onClick={cancelEdit}
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
                  onChange={(event) => setEditTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      submitEdit()
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
                  onChange={(event) => setEditCategory(event.target.value)}
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
                  onChange={(event) => setEditNote(event.target.value)}
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
                  onChange={(event) => setEditPriority(event.target.value as 'baixa' | 'media' | 'importante')}
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
                    onChange={(event) => setEditStartTime(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
                    aria-label="Hora início"
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(event) => setEditEndTime(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300/80 bg-white px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
                    aria-label="Hora fim"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1 md:col-span-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 rounded-lg border border-zinc-300/80 px-3 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200/80 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={submitEdit}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
                >
                  Salvar
                </button>
              </div>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-800/25 bg-red-100/90 px-3 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-red-200/80 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20 md:col-span-2"
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                Excluir demanda
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
