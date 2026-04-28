import type { Goal } from '../../api/goals'
import { useEffect, useState, type FormEvent } from 'react'
import {
  FIXED_CATEGORIES,
  canonicalCategoryId,
  customCategoryName,
  type FixedCategoryId,
} from '../../lib/categoryOptions'

type MetasEditModalProps = {
  goal: Goal | null
  onClose: () => void
  editTitle: string
  onEditTitleChange: (value: string) => void
  editCategory: string
  onEditCategoryChange: (value: string) => void
  editTargetCount: number
  onEditTargetCountChange: (value: number) => void
  editDueDate: string
  onEditDueDateChange: (value: string) => void
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: () => void
}

export default function MetasEditModal({
  goal,
  onClose,
  editTitle,
  onEditTitleChange,
  editCategory,
  onEditCategoryChange,
  editTargetCount,
  onEditTargetCountChange,
  editDueDate,
  onEditDueDateChange,
  isSubmitting,
  onSubmit,
  onDelete,
}: MetasEditModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<FixedCategoryId>(
    canonicalCategoryId(editCategory),
  )
  const [customCategory, setCustomCategory] = useState(customCategoryName(editCategory))

  useEffect(() => {
    setSelectedCategory(canonicalCategoryId(editCategory))
    setCustomCategory(customCategoryName(editCategory))
  }, [editCategory])

  function handleCategorySelect(next: FixedCategoryId) {
    setSelectedCategory(next)
    if (next === 'outros') {
      onEditCategoryChange(customCategory.trim() || 'geral')
      return
    }
    onEditCategoryChange(next)
  }

  function handleCustomCategoryChange(value: string) {
    setCustomCategory(value)
    onEditCategoryChange(value.trim() || 'geral')
  }

  if (!goal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Fechar modal de edição"
        onClick={onClose}
      />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900/95"
      >
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Editar meta</p>
        <input
          value={editTitle}
          onChange={(event) => onEditTitleChange(event.target.value)}
          required
          className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
        />
        <div className="space-y-2">
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
              className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
          ) : null}
        </div>
        <input
          value={editTargetCount}
          onChange={(event) => onEditTargetCountChange(Number(event.target.value))}
          type="number"
          min={1}
          className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
        />
        <input
          value={editDueDate}
          onChange={(event) => onEditDueDateChange(event.target.value)}
          type="date"
          className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-xl border border-red-300/70 bg-red-50/80 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
          >
            Excluir meta
          </button>
          <div className="flex items-center gap-2">
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
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
