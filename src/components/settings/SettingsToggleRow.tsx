type SettingsToggleRowProps = {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}

export default function SettingsToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: SettingsToggleRowProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition ${
          checked
            ? 'border-red-500/50 bg-red-600/90 shadow-[0_0_16px_rgba(220,38,38,0.25)]'
            : 'border-zinc-300/80 bg-zinc-100/90 hover:border-zinc-400 dark:border-white/15 dark:bg-black/40 dark:hover:border-white/25'
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}
