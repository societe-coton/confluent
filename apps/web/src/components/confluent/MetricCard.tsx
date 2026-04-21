import { cn } from '@/lib/utils'

export interface MetricCardProps {
  label: string
  value: string
  subLabel?: string
  className?: string
}

export function MetricCard({
  label,
  value,
  subLabel,
  className,
}: MetricCardProps) {
  return (
    <article
      aria-label={`${label} : ${value}`}
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
        {value}
      </p>
      {subLabel ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{subLabel}</p>
      ) : null}
    </article>
  )
}
