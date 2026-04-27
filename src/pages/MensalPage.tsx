import MensalCalendarGrid from '../components/mensal/MensalCalendarGrid'
import MensalDayDrawer from '../components/mensal/MensalDayDrawer'
import MensalTopSummary from '../components/mensal/MensalTopSummary'
import { useMensalPage } from '../hooks/useMensalPage'

export default function MensalPage() {
  const m = useMensalPage()

  return (
    <div className="flex h-full min-h-0 min-w-0 gap-2 lg:gap-4">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 sm:gap-5">
        <MensalTopSummary
          monthLabel={m.monthLabel}
          timeLabel={m.timeLabel}
          fullDateLabel={m.fullDateLabel}
        />

        <MensalCalendarGrid
          weekDays={m.weekDays}
          monthCells={m.monthCells}
          now={m.now}
          todayDay={m.todayDay}
          selectedDay={m.selectedDay}
          demandsByDate={m.demandsByDate}
          onOpenDayDemands={m.openDayDemands}
        />
      </div>

      {m.drawerOpen ? (
        <MensalDayDrawer
          dateLabel={m.selectedDateLabel}
          demands={m.selectedDemands}
          form={m.newDemand}
          onClose={m.closeDrawer}
          onAddDemand={m.addDemand}
          onUpdateDemand={m.updateDemand}
          onToggleDemandDone={m.toggleDemandDone}
          onRemoveDemand={m.removeDemand}
        />
      ) : null}
    </div>
  )
}
