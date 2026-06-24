import { Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CurrentUser } from '../../api/client'
import { Badge } from '../ui/Badge'

export interface TopbarProps {
  title: string
  isVerified: boolean
  user: CurrentUser | null
  onMenuClick: () => void
}

export function Topbar({ title, isVerified, user, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-white px-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-background hover:text-text md:hidden"
      >
        <Menu size={16} strokeWidth={1.5} />
      </button>

      <h1 className="text-sm font-medium text-text">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant={isVerified ? 'success' : 'warning'}>{isVerified ? 'Verificado' : 'Pendente'}</Badge>

        {user && (
          <Link to="/profile" aria-label="Ver perfil" title="Perfil">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-semibold text-text">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  )
}
