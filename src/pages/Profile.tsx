import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/useAuth'

export default function Profile() {
  const { user, isLoadingUser } = useAuth()

  return (
    <AppLayout title="Meu perfil">
      {isLoadingUser ? (
        <Card className="flex max-w-lg items-center justify-center gap-3 py-12 text-sm text-text-muted">
          <Spinner size="sm" />
          Carregando perfil...
        </Card>
      ) : user ? (
        <Card className="max-w-lg">
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
                className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-xl font-semibold text-text"
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
        <Card className="max-w-lg text-sm text-text-muted">
          Não foi possível carregar as informações do seu perfil. Saia e faça login novamente para atualizá-las.
        </Card>
      )}
    </AppLayout>
  )
}
