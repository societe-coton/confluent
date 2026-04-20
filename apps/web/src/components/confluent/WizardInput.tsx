import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export interface WizardInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'className'> {
  className?: string
}

export function WizardInput({ className, ...rest }: WizardInputProps) {
  return (
    <input
      type="text"
      className={cn(
        'w-full border-0 border-b border-border bg-transparent py-2 text-lg outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus:border-foreground focus-visible:border-foreground',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...rest}
    />
  )
}
