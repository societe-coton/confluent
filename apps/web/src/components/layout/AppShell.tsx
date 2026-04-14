import { NavLink, Outlet } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { useCurrentUser } from '@/features/current-user/context'
import { cn } from '@/lib/utils'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors',
    isActive ? 'bg-sidebar-accent font-medium' : 'hover:bg-sidebar-accent/60'
  )

export function AppShell() {
  const user = useCurrentUser()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar md:flex">
        <div className="px-4 py-6 text-lg font-heading font-medium text-sidebar-foreground">
          Confluent
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 px-2 py-4">
          <NavLink to="/dashboard" end className={navLinkClasses}>
            Dashboard
          </NavLink>
        </nav>
        <Separator />
        <div className="px-4 py-4 text-sm">
          <div className="font-medium text-sidebar-foreground">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
