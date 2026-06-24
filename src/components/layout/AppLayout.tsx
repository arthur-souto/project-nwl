import { useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { VerificationModal } from '../VerificationModal'
import { useAuth } from '../../contexts/useAuth'
import { useLogout } from '../../hooks/useLogout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { getAccessTokenPayload } from '../../services/tokenService'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export interface AppLayoutProps {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps) {
  const accessToken = useRequireAuth()
  const { user } = useAuth()
  const handleLogout = useLogout()
  const location = useLocation()

  const [isVerified, setIsVerified] = useState(() => getAccessTokenPayload()?.isVerified ?? true)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(!isVerified)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(location.pathname)
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname)
    setIsSidebarOpen(false)
  }

  if (!accessToken) return null

  return (
    <div className="min-h-svh bg-background">
      <Sidebar user={user} onLogout={handleLogout} open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="md:pl-55">
        <Topbar title={title} isVerified={isVerified} user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </div>

      <VerificationModal
        open={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={() => setIsVerified(true)}
      />
    </div>
  )
}
