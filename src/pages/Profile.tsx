import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Favorite } from '../api/client'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/useAuth'
import { getErrorMessage } from '../lib/httpError'
import { listFavorites } from '../services/assetService'

const FAVORITES_PAGE_SIZE = 20
const FAVORITES_SKELETON_COUNT = 10

export default function Profile() {
  const { user, isLoadingUser, isVerified } = useAuth()
  const [favoritesPage, setFavoritesPage] = useState(0)
  const [favoritesTotalPages, setFavoritesTotalPages] = useState(0)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listFavorites({ page: favoritesPage, size: FAVORITES_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setFavorites(result.content)
        setFavoritesTotalPages(result.totalPages)
        setFavoritesError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setFavoritesError(getErrorMessage(err, 'Não foi possível carregar os favoritos.'))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingFavorites(false)
      })

    return () => {
      cancelled = true
    }
  }, [favoritesPage])

  const handleFavoritesPageChange = (newPage: number) => {
    setFavoritesPage(newPage)
    setIsLoadingFavorites(true)
  }

  return (
    <AppLayout title="Perfil">
      {isLoadingUser ? (
        <Card className="flex max-w-lg items-center justify-center gap-3 py-12 text-sm text-text-muted">
          <Spinner size="sm" />
          Carregando perfil...
        </Card>
      ) : user ? (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`Foto de perfil de ${user.username}`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-24 w-24 items-center justify-center rounded-full bg-background text-3xl font-semibold text-text"
              >
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-lg font-bold text-text">{user.username}</p>
              <p className="mt-0.5 text-sm text-text-muted">{user.email}</p>
              <Badge variant={isVerified ? 'success' : 'warning'} className="mt-2 inline-flex">
                {isVerified ? 'Verificado' : 'Pendente'}
              </Badge>
            </div>
          </Card>

          <section>
            <h2 className="text-sm font-semibold text-text">Ativos favoritos</h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {isLoadingFavorites ? (
                Array.from({ length: FAVORITES_SKELETON_COUNT }).map((_, index) => (
                  <Card key={index} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </Card>
                ))
              ) : favoritesError ? (
                <p className="col-span-full text-sm text-error">{favoritesError}</p>
              ) : favorites.length === 0 ? (
                <p className="col-span-full text-sm text-text-muted">Nenhum ativo favoritado ainda.</p>
              ) : (
                favorites.map((favorite) => (
                  <Card key={favorite.id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-text">{favorite.asset.name}</p>
                      <Star size={14} strokeWidth={1.5} fill="currentColor" className="shrink-0 text-warning" />
                    </div>
                    <p className="font-mono text-xs text-text-muted">{favorite.asset.code}</p>
                    <Badge variant="outline" className="self-start">
                      {favorite.asset.unit}
                    </Badge>
                  </Card>
                ))
              )}
            </div>

            {!isLoadingFavorites && (
              <Pagination
                page={favoritesPage}
                totalPages={favoritesTotalPages}
                onPageChange={handleFavoritesPageChange}
                className="mt-4"
              />
            )}
          </section>

          <Card className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Detalhes da conta</p>
            <dl className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
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
        </div>
      ) : (
        <Card className="max-w-lg text-sm text-text-muted">
          Não foi possível carregar as informações do seu perfil. Saia e faça login novamente para atualizá-las.
        </Card>
      )}
    </AppLayout>
  )
}
