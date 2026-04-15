import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavItemSpec } from './nav-items'

type Variant = 'desktop' | 'rail' | 'bottom'

const base =
  'flex items-center rounded-md text-sidebar-foreground transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]'

const variantClasses: Record<Variant, string> = {
  desktop: 'gap-3 px-3 py-2 text-sm',
  rail: 'h-10 w-10 justify-center',
  bottom: 'h-full flex-1 flex-col justify-center gap-1',
}

const iconClasses: Record<Variant, string> = {
  desktop: 'size-4 shrink-0',
  rail: 'size-5',
  bottom: 'size-5',
}

export interface NavItemProps {
  item: NavItemSpec
  variant: Variant
}

export function NavItem({ item, variant }: NavItemProps) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={variant === 'desktop' ? undefined : item.label}
      aria-label={variant === 'desktop' ? undefined : item.label}
      className={({ isActive }) =>
        cn(
          base,
          variantClasses[variant],
          isActive
            ? 'bg-sidebar-accent font-medium'
            : 'hover:bg-sidebar-accent/60'
        )
      }
    >
      <Icon className={iconClasses[variant]} aria-hidden="true" />
      {variant === 'desktop' && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}
