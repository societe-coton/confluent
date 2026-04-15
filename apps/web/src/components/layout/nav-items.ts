import { FolderOpen, LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface NavItemSpec {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const NAV_ITEMS: NavItemSpec[] = [
  { to: '/dashboard', label: 'Mes dossiers', icon: FolderOpen, end: true },
  { to: '/dashboard/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
]
