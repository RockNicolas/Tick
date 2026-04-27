type SemanaFetchErrorProps = {
  message: string
}

export default function SemanaFetchError({ message }: SemanaFetchErrorProps) {
  return (
    <p className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      {message}
    </p>
  )
}
