export function ComingSoon({ themeLabel }: { themeLabel: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-950 text-white">
      <h1 className="text-3xl font-semibold">{themeLabel} theme coming soon</h1>
      <p className="text-white/60">Use the switcher to try another design language.</p>
    </div>
  );
}
