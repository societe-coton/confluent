const VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'dev'

export function VersionBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span
        className="text-[10px] text-muted-foreground"
        title={`Version ${VERSION}`}
        aria-label={`Version ${VERSION}`}
      >
        v{VERSION}
      </span>
    )
  }
  return (
    <div
      className="px-4 py-2 text-xs text-muted-foreground"
      title={`Version ${VERSION}`}
    >
      v{VERSION}
    </div>
  )
}
