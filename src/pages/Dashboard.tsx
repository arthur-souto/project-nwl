import { Navbar } from '../components/ui/Navbar'
import { PageLayout } from '../components/ui/PageLayout'
import { useAuth } from '../contexts/useAuth'
import { useLogout } from '../hooks/useLogout'
import { useRequireAuth } from '../hooks/useRequireAuth'

const navLinks = [
  { label: 'Painel', to: '/dashboard' },
  { label: 'Perfil', to: '/profile' },
]

export default function Dashboard() {
  const accessToken = useRequireAuth()
  const { user } = useAuth()
  const handleLogout = useLogout()

  if (!accessToken) return null

  return (
    <div className="min-h-svh bg-surface">
      <Navbar links={navLinks} user={user} onLogout={handleLogout} />

      <PageLayout>
        <section>
          <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Bem-vindo ao painel de ativos
          </h1>
          <p className="mt-2 text-text-muted">Acompanhe lotes, validades e alertas dos seus ativos farmacêuticos.</p>
        </section>
      </PageLayout>
    </div>
  )
}
