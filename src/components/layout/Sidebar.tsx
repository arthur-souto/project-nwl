import { Home, LogOut, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { CurrentUser } from '../../api/client'
import { cn } from '../../lib/cn'

interface SidebarNavItem {
  label: string
  to: string
  icon: LucideIcon
}

const navItems: SidebarNavItem[] = [
  { label: 'Início', to: '/dashboard', icon: Home },
  { label: 'Ativos', to: '/assets', icon: Package },
  { label: 'Perfil', to: '/profile', icon: User },
]

function SidebarContent({ user, onLogout }: { user: CurrentUser | null; onLogout: () => void }) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center px-4 text-sm font-semibold text-text">Pharmly</div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-primary bg-primary-light text-primary'
                  : 'border-l-2 border-transparent text-text-muted hover:bg-background hover:text-text',
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-semibold text-text"
              >
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text">{user.username}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sair"
              title="Sair"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-background hover:text-text"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export interface SidebarProps {
  user: CurrentUser | null
  onLogout: () => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ user, onLogout, open, onClose }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-55 flex-col border-r border-border bg-surface md:flex">
        <SidebarContent user={user} onLogout={onLogout} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-55 bg-surface shadow-lg">
            <SidebarContent user={user} onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  )
}
