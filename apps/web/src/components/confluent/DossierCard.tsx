import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/relative-date'

export interface DossierCardProps {
  slug: string
  name: string
  sector: string
  maturity: string
  activeShareLinksCount: number
  createdAt: string
  className?: string
}

function formatAccessLabel(count: number): string {
  if (count <= 1) return `${count} accès actif`
  return `${count} accès actifs`
}

export function DossierCard({
  slug,
  name,
  sector,
  maturity,
  activeShareLinksCount,
  createdAt,
  className,
}: DossierCardProps) {
  const relativeCreatedAt = formatRelativeDate(createdAt)
  const accessLabel = formatAccessLabel(activeShareLinksCount)
  const ariaLabel = `${name}, secteur ${sector}, stade ${maturity}, ${accessLabel}, créé ${relativeCreatedAt}`
  return (
    <Link
      to={`/dashboard/dossiers/view/${slug}`}
      aria-label={ariaLabel}
      className={cn(
        'group flex min-h-11 flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors',
        'hover:border-foreground/20',
        'focus-visible:border-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-medium text-foreground">
          {name}
        </h3>
        <Badge variant="secondary" className="shrink-0">
          {maturity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{sector}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{accessLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{`Créé ${relativeCreatedAt}`}</span>
      </div>
    </Link>
  )
}
