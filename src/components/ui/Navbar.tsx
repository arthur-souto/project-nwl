import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export interface LogoMarkProps {
  tone?: 'default' | 'light'
  className?: string
}

export function LogoMark({ tone = 'default', className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        tone === 'light' ? 'bg-white text-primary-dark' : 'bg-primary-dark text-white',
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  )
}

export interface NavLink {
  label: string
  to: string
}

export interface NavbarUser {
  username: string
  email: string
  profileImage?: string
}

export interface NavbarProps {
  links?: NavLink[]
  user?: NavbarUser | null
  onLogout?: () => void
  className?: string
}

export function Navbar({ links = [], user, onLogout, className }: NavbarProps) {
  const location = useLocation()

  return (
    <header className={cn('sticky top-0 z-10 w-full border-b border-border bg-white/90 backdrop-blur-sm', className)}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-extrabold text-text" aria-label="Pharmly, página inicial">
          <LogoMark />
          Pharmly
        </Link>

        {links.length > 0 && (
          <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-primary-dark' : 'text-text-muted hover:text-text',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}

        {user && (
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`Foto de perfil de ${user.username}`}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text"
              >
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden text-sm font-medium text-text sm:inline">{user.username}</span>
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Sair
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
