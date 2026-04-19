import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  illustration: ReactNode
  title: string
  description: string
  cta?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  illustration,
  title,
  description,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="text-foreground">{illustration}</div>
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {cta ? (
        <Button size="lg" className="h-11 px-4" onClick={cta.onClick}>
          {cta.label}
        </Button>
      ) : null}
    </div>
  )
}
