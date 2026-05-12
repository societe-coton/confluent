import type { AccessStatus } from '@/features/shares/access-entry'
import { cn } from '@/lib/utils'

export type { AccessStatus as StatusValue } from '@/features/shares/access-entry'

const STATUS_COPY: Record<AccessStatus, { label: string; dotClass: string }> = {
  active: { label: 'Actif', dotClass: 'bg-[var(--status-active)]' },
  pending: { label: 'En attente', dotClass: 'bg-[var(--status-pending)]' },
  revoked: { label: 'Révoqué', dotClass: 'bg-[var(--status-neutral)]' },
}

export interface StatusDotProps {
  status: AccessStatus
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const { label, dotClass } = STATUS_COPY[status]
  return (
    <span
      aria-label={`Statut : ${label}`}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-[7px] rounded-full', dotClass)}
      />
      {label}
    </span>
  )
}
