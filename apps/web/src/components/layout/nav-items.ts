import {
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from 'lucide-react'

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

export const ADMIN_NAV_ITEMS: NavItemSpec[] = [
  { to: '/admin', label: 'Pipeline', icon: LayoutDashboard, end: true },
  { to: '/admin/dossiers', label: 'Dossiers', icon: FolderOpen },
  { to: '/admin/questionnaire', label: 'Questionnaire', icon: ClipboardList },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
]
