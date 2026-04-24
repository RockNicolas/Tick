export default function AppBackground() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        aria-hidden
        style={{
          background: 'linear-gradient(155deg, #030303 0%, #121212 38%, #27272a 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          backgroundImage: `
              radial-gradient(ellipse 110% 70% at 15% -10%, rgba(255,255,255,0.06) 0%, transparent 45%),
              radial-gradient(ellipse 90% 60% at 100% 100%, rgba(0,0,0,0.55) 0%, transparent 50%)
            `,
        }}
      />
      <div
        className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[32rem] w-[32rem] rounded-full bg-zinc-600/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-32 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-black/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed left-1/3 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-zinc-500/10 blur-2xl"
        aria-hidden
      />
    </>
  )
}
