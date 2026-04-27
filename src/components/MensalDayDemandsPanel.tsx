import { Plus } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import type { MonthlyDemand } from '../types/monthlyDemand'
import MensalDayDemandAddForm from './mensal-day/MensalDayDemandAddForm'
import MensalDayDemandEditDialog from './mensal-day/MensalDayDemandEditDialog'
import MensalDayDemandList from './mensal-day/MensalDayDemandList'
import MensalDayPanelHeader from './mensal-day/MensalDayPanelHeader'

export type { MonthlyDemand }

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
    startTransition(() => {
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
    })
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
    if (editingIndex === null || editingIndex < demands.length) return
    startTransition(() => {
      setEditingIndex(null)
      setEditTitle('')
      setEditCategory('geral')
      setEditNote('')
      setEditPriority('media')
      setEditStartTime('')
      setEditEndTime('')
    })
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
      <MensalDayPanelHeader dateLabel={dateLabel} onClose={onClose} />

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
          <MensalDayDemandAddForm
            newDemandTitle={newDemandTitle}
            newDemandCategory={newDemandCategory}
            newDemandNote={newDemandNote}
            newDemandPriority={newDemandPriority}
            newDemandStartTime={newDemandStartTime}
            newDemandEndTime={newDemandEndTime}
            onNewDemandTitleChange={onNewDemandTitleChange}
            onNewDemandCategoryChange={onNewDemandCategoryChange}
            onNewDemandNoteChange={onNewDemandNoteChange}
            onNewDemandPriorityChange={onNewDemandPriorityChange}
            onNewDemandStartTimeChange={onNewDemandStartTimeChange}
            onNewDemandEndTimeChange={onNewDemandEndTimeChange}
            onCancel={cancelAdd}
            onSubmit={submitAdd}
          />
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <MensalDayDemandList
            demands={demands}
            onToggleDone={onToggleDemandDone}
            onOpenEdit={openEdit}
          />
        </div>
      </div>

      <MensalDayDemandEditDialog
        open={editingIndex !== null}
        dateLabel={dateLabel}
        editTitle={editTitle}
        onEditTitleChange={setEditTitle}
        editCategory={editCategory}
        onEditCategoryChange={setEditCategory}
        editNote={editNote}
        onEditNoteChange={setEditNote}
        editPriority={editPriority}
        onEditPriorityChange={setEditPriority}
        editStartTime={editStartTime}
        onEditStartTimeChange={setEditStartTime}
        editEndTime={editEndTime}
        onEditEndTimeChange={setEditEndTime}
        onCancel={cancelEdit}
        onSubmit={submitEdit}
        onDelete={confirmDelete}
      />
    </aside>
  )
}
