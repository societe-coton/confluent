import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

type ConfluentWordmarkProps = ComponentPropsWithoutRef<'svg'>

export function ConfluentWordmark({
  className,
  ...props
}: ConfluentWordmarkProps) {
  return (
    <svg
      role="img"
      aria-label="Confluent"
      viewBox="0 0 140 28"
      className={cn('h-7 w-auto', className)}
      {...props}
    >
      <text
        aria-hidden="true"
        x="50%"
        y="70%"
        textAnchor="middle"
        dominantBaseline="alphabetic"
        fill="currentColor"
        fontFamily="var(--font-heading, 'Inter Variable', sans-serif)"
        fontSize="20"
        fontWeight="500"
      >
        Confluent
      </text>
    </svg>
  )
}
