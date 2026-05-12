import { Outlet } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { useCurrentUser } from '@/features/current-user/context'
import { Breadcrumbs } from './Breadcrumbs'
import { NavItem } from './NavItem'
import { VersionBadge } from './VersionBadge'
import { ADMIN_NAV_ITEMS, NAV_ITEMS, type NavItemSpec } from './nav-items'
import type { CurrentUser } from '@confluent/shared'

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      Aller au contenu principal
    </a>
  )
}

function DesktopSidebar({ user, navItems }: { user: CurrentUser; navItems: NavItemSpec[] }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar lg:flex">
      <div className="px-4 py-6 text-lg font-heading font-medium text-sidebar-foreground">
        Confluent
      </div>
      <Separator />
      <nav
        aria-label="Navigation principale"
        className="flex-1 px-2 py-4"
      >
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavItem item={item} variant="desktop" />
            </li>
          ))}
        </ul>
      </nav>
      <Separator />
      <div className="px-4 py-4 text-sm">
        <div
          className="truncate font-medium text-sidebar-foreground"
          title={user.name}
        >
          {user.name}
        </div>
        <div
          className="truncate text-xs text-muted-foreground"
          title={user.email}
        >
          {user.email}
        </div>
      </div>
      <VersionBadge />
    </aside>
  )
}

function TabletRail({ user, navItems }: { user: CurrentUser; navItems: NavItemSpec[] }) {
  const initial = (user.name.charAt(0) || '?').toUpperCase()
  return (
    <aside className="hidden w-[60px] shrink-0 flex-col items-center bg-sidebar md:flex lg:hidden">
      <div
        className="py-6 text-lg font-heading font-medium text-sidebar-foreground"
        aria-hidden="true"
      >
        C
      </div>
      <Separator />
      <nav
        aria-label="Navigation principale"
        className="flex-1 py-4"
      >
        <ul className="flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavItem item={item} variant="rail" />
            </li>
          ))}
        </ul>
      </nav>
      <Separator />
      <div className="py-4">
        <div
          role="img"
          title={user.name}
          aria-label={user.name}
          className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
        >
          {initial}
        </div>
      </div>
    </aside>
  )
}

function MobileBottomNav({ navItems }: { navItems: NavItemSpec[] }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-sidebar-border bg-sidebar md:hidden"
    >
      <ul className="flex w-full">
        {navItems.map((item) => (
          <li key={item.to} className="flex min-h-11 flex-1">
            <NavItem item={item} variant="bottom" />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AppShell() {
  const user = useCurrentUser()
  const navItems = user.role === 'admin' ? ADMIN_NAV_ITEMS : NAV_ITEMS

  return (
    <div className="flex min-h-screen bg-background">
      <SkipLink />
      <DesktopSidebar user={user} navItems={navItems} />
      <TabletRail user={user} navItems={navItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 px-6 py-8 pb-16 md:pb-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ring)]"
      >
        <Breadcrumbs />
        <Outlet />
      </main>
      <MobileBottomNav navItems={navItems} />
    </div>
  )
}
