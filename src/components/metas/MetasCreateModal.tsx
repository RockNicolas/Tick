import { Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
  FIXED_CATEGORIES,
  canonicalCategoryId,
  customCategoryName,
  type FixedCategoryId,
} from '../../lib/categoryOptions'

type MetasCreateModalProps = {
  open: boolean
  onClose: () => void
  title: string
  onTitleChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  targetCount: number
  onTargetCountChange: (value: number) => void
  dueDate: string
  onDueDateChange: (value: string) => void
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function MetasCreateModal({
  open,
  onClose,
  title,
  onTitleChange,
  category,
  onCategoryChange,
  targetCount,
  onTargetCountChange,
  dueDate,
  onDueDateChange,
  isSubmitting,
  onSubmit,
}: MetasCreateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<FixedCategoryId>(canonicalCategoryId(category))
  const [customCategory, setCustomCategory] = useState(customCategoryName(category))

  useEffect(() => {
    setSelectedCategory(canonicalCategoryId(category))
    setCustomCategory(customCategoryName(category))
  }, [category])

  function handleCategorySelect(next: FixedCategoryId) {
    setSelectedCategory(next)
    if (next === 'outros') {
      onCategoryChange(customCategory.trim() || 'geral')
      return
    }
    onCategoryChange(next)
  }

  function handleCustomCategoryChange(value: string) {
    setCustomCategory(value)
    onCategoryChange(value.trim() || 'geral')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Fechar modal de nova meta"
        onClick={onClose}
      />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900/95"
      >
        <div>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Adicionar meta</p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Crie uma nova meta e acompanhe seu progresso na lista principal.
          </p>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="goal-title"
            className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
          >
            Título
          </label>
          <input
            id="goal-title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ex.: Ler 2 livros este mês"
            required
            className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:[color-scheme:dark]"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
            Categoria
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FIXED_CATEGORIES.map((item) => {
              const isActive = selectedCategory === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategorySelect(item.id)}
                  className={
                    isActive
                      ? 'min-h-10 rounded-xl border border-teal-300/60 bg-teal-400/20 px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100'
                      : 'min-h-10 rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-800 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15'
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          {selectedCategory === 'outros' ? (
            <input
              value={customCategory}
              onChange={(event) => handleCustomCategoryChange(event.target.value)}
              placeholder="Nome da categoria"
              required
              className="mt-2 min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="goal-target-count"
            className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
          >
            Alvo de tarefas
          </label>
          <input
            id="goal-target-count"
            value={targetCount}
            onChange={(event) => onTargetCountChange(Number(event.target.value))}
            type="number"
            min={1}
            className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="goal-due-date"
            className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
          >
            Prazo (opcional)
          </label>
          <input
            id="goal-due-date"
            value={dueDate}
            onChange={(event) => onDueDateChange(event.target.value)}
            type="date"
            className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300/80 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-300/40 bg-teal-200/30 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-teal-200/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {isSubmitting ? 'Salvando...' : 'Salvar meta'}
          </button>
        </div>
      </form>
    </div>
  )
}
