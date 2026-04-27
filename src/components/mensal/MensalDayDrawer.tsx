import MensalDayDemandsPanel from '../MensalDayDemandsPanel'
import type { MonthlyDemand } from '../../types/monthlyDemand'

type NewDemandForm = {
  title: string
  category: string
  note: string
  priority: 'baixa' | 'media' | 'importante'
  startTime: string
  endTime: string
  setTitle: (v: string) => void
  setCategory: (v: string) => void
  setNote: (v: string) => void
  setPriority: (v: 'baixa' | 'media' | 'importante') => void
  setStartTime: (v: string) => void
  setEndTime: (v: string) => void
}

type MensalDayDrawerProps = {
  dateLabel: string
  demands: MonthlyDemand[]
  form: NewDemandForm
  onClose: () => void
  onAddDemand: () => void
  onUpdateDemand: (index: number, demand: MonthlyDemand) => void
  onToggleDemandDone: (index: number) => void
  onRemoveDemand: (index: number) => void
}

export default function MensalDayDrawer({
  dateLabel,
  demands,
  form,
  onClose,
  onAddDemand,
  onUpdateDemand,
  onToggleDemandDone,
  onRemoveDemand,
}: MensalDayDrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Fechar painel de demandas"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm dark:bg-black/70 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md overflow-y-auto p-2 sm:p-3 lg:static lg:inset-auto lg:z-auto lg:h-full lg:w-[350px] lg:max-w-none lg:shrink-0 lg:overflow-y-auto lg:p-0">
        <MensalDayDemandsPanel
          dateLabel={dateLabel}
          demands={demands}
          newDemandTitle={form.title}
          newDemandCategory={form.category}
          newDemandNote={form.note}
          newDemandPriority={form.priority}
          newDemandStartTime={form.startTime}
          newDemandEndTime={form.endTime}
          onNewDemandTitleChange={form.setTitle}
          onNewDemandCategoryChange={form.setCategory}
          onNewDemandNoteChange={form.setNote}
          onNewDemandPriorityChange={form.setPriority}
          onNewDemandStartTimeChange={form.setStartTime}
          onNewDemandEndTimeChange={form.setEndTime}
          onAddDemand={onAddDemand}
          onUpdateDemand={onUpdateDemand}
          onToggleDemandDone={onToggleDemandDone}
          onRemoveDemand={onRemoveDemand}
          onClose={onClose}
          className="h-full border-zinc-200/90 bg-white/95 dark:border-white/15 dark:bg-zinc-950 lg:border-zinc-200/80 lg:bg-white/95 lg:dark:border-white/10 lg:dark:bg-zinc-950/95"
        />
      </div>
    </>
  )
}
