export default function AppBackground() {
  return (
    <>
      <div
        className="tick-app-bg-gradient pointer-events-none fixed inset-0 -z-20"
        aria-hidden
      />
      <div
        className="tick-app-bg-radials pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />
      <div
        className="tick-app-bg-orb-left pointer-events-none fixed -left-40 top-1/4 -z-10 h-[32rem] w-[32rem] rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="tick-app-bg-orb-right pointer-events-none fixed -right-32 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="tick-app-bg-orb-mid pointer-events-none fixed left-1/3 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        aria-hidden
      />
    </>
  )
}
