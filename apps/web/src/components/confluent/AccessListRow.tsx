import { StatusDot } from '@/components/confluent/StatusDot'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AccessEntry } from '@/features/shares/access-entry'
import { cn } from '@/lib/utils'

function formatRevokedTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface AccessListRowProps {
  entry: AccessEntry
  onRevokeClick?: (entry: AccessEntry) => void
  className?: string
}

export function AccessListRow({
  entry,
  onRevokeClick,
  className,
}: AccessListRowProps) {
  const isRevoked = entry.status === 'revoked'
  const isPending = entry.status === 'pending'

  return (
    <li
      className={cn(
        'flex flex-col gap-3 px-4 py-3 not-[:first-child]:border-t not-[:first-child]:border-border sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-3',
          isRevoked && 'opacity-[0.55]',
        )}
      >
        <Avatar role="img" aria-label={entry.email}>
          <AvatarFallback>{entry.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-foreground"
            title={entry.email}
          >
            {entry.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.lastSeen}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={cn(
            'text-[22px] tabular-nums',
            isPending
              ? 'font-normal text-muted-foreground'
              : 'font-bold text-foreground',
            isRevoked && 'opacity-[0.55]',
          )}
        >
          {entry.sessionDuration}
        </span>
        <StatusDot status={entry.status} />
        {entry.status === 'revoked' ? (
          <Tooltip>
            <TooltipTrigger
              className="cursor-help rounded-sm text-xs text-muted-foreground opacity-[0.55] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] focus-visible:opacity-100"
              render={<span tabIndex={0} />}
            >
              Révoqué le {entry.revokedAt}
            </TooltipTrigger>
            <TooltipContent>
              <p>à {formatRevokedTime(entry.revokedAtIso)}</p>
              <p className="mt-0.5 text-muted-foreground">
                par {entry.revokedBy}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Révoquer l'accès de ${entry.email}`}
            onClick={
              onRevokeClick ? () => onRevokeClick(entry) : undefined
            }
            className="min-h-11 border-border hover:border-destructive hover:bg-transparent hover:text-destructive"
          >
            Révoquer
          </Button>
        )}
      </div>
    </li>
  )
}
