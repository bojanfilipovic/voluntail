export function MapLoadingFallback() {
  return (
    <div className="bg-muted/40 text-muted-foreground flex min-h-[220px] flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-sm">
      <span
        className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden
      />
      <span>Loading map…</span>
    </div>
  )
}
