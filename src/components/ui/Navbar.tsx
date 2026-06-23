import { useState } from 'react'
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  )
}

export function Navbar({ links = [], user, onLogout, className }: NavbarProps) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(location.pathname)

  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    setIsMenuOpen(false)
  }

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

        {(user || links.length > 0) && (
          <div className="flex items-center gap-3">
            {user && (
              <>
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
              </>
            )}

            {links.length > 0 && (
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                className="-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-text md:hidden"
              >
                <MenuIcon open={isMenuOpen} />
              </button>
            )}
          </div>
        )}
      </div>

      {links.length > 0 && isMenuOpen && (
        <nav id="mobile-nav-menu" aria-label="Navegação principal" className="border-t border-border bg-white md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {links.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-light text-primary-dark' : 'text-text-muted hover:bg-surface hover:text-text',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
