import { Card } from '../components/ui/Card'
import { Navbar } from '../components/ui/Navbar'
import { PageLayout } from '../components/ui/PageLayout'
import { useAuth } from '../contexts/useAuth'
import { useLogout } from '../hooks/useLogout'
import { useRequireAuth } from '../hooks/useRequireAuth'

const navLinks = [
  { label: 'Painel', to: '/dashboard' },
  { label: 'Perfil', to: '/profile' },
]

export default function Profile() {
  const accessToken = useRequireAuth()
  const { user } = useAuth()
  const handleLogout = useLogout()

  if (!accessToken) return null

  return (
    <div className="min-h-svh bg-surface">
      <Navbar links={navLinks} user={user} onLogout={handleLogout} />

      <PageLayout>
        <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">Meu perfil</h1>

        {user ? (
          <Card className="mt-8 max-w-lg">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`Foto de perfil de ${user.username}`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-xl font-semibold text-text"
                >
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-lg font-bold text-text">{user.username}</p>
                <p className="text-sm text-text-muted">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-medium text-text-muted">ID da conta</dt>
                <dd className="truncate text-text">{user.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-medium text-text-muted">Google ID</dt>
                <dd className="truncate text-text">{user.googleId}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card className="mt-8 max-w-lg text-sm text-text-muted">
            Não foi possível carregar as informações do seu perfil. Saia e faça login novamente para atualizá-las.
          </Card>
        )}
      </PageLayout>
    </div>
  )
}
