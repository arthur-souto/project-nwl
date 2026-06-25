import { Download, Eye, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Asset, Favorite } from '../api/client'
import { AppLayout } from '../components/layout/AppLayout'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { DataTableColumn } from '../components/ui/DataTable'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { Select } from '../components/ui/Select'
import { Spinner } from '../components/ui/Spinner'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useToast } from '../hooks/useToast'
import { listFavorites, searchAssets, toggleFavorite } from '../services/assetService'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../lib/httpError'

const SEARCH_DEBOUNCE_MS = 300
const SUPPLIER_MAX_CHARS = 30
const FAVORITES_PAGE_SIZE = 10
// One-shot, best-effort batch used only to know *which* assets are favorited (for the star
// icon state on both tables). Favorites beyond this count won't show as favorited on the
// "Todos" list until toggled there directly — the dedicated Favoritos tab is unaffected,
// since it's paginated independently.
const FAVORITES_STATUS_SEED_SIZE = 200

type AssetsView = 'all' | 'favorites'

function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '—'
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

function exportToCsv(assets: Asset[]) {
  const header = ['Código', 'Nome', 'Fornecedor', 'Unidade']
  const rows = assets.map((asset) => [asset.code, asset.name, asset.supplier ?? '', asset.unit])
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'ativos.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function Assets() {
  const { showError } = useToast()
  const [view, setView] = useState<AssetsView>('all')

  // "Todos" list
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [assetsError, setAssetsError] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // "Favoritos" list
  const [favoritesPage, setFavoritesPage] = useState(0)
  const [favoritesReloadToken, setFavoritesReloadToken] = useState(0)
  const [favoritesTotalPages, setFavoritesTotalPages] = useState(0)
  const [favoritesTotalElements, setFavoritesTotalElements] = useState(0)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)

  // Favorite status, shared by both tables' star buttons
  const [favoriteAssetIds, setFavoriteAssetIds] = useState<Set<string>>(new Set())
  const [togglingAssetIds, setTogglingAssetIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    searchAssets(debouncedSearchTerm, { page, size: pageSize })
      .then((result) => {
        if (cancelled) return
        setAssets(result.content)
        setTotalPages(result.page.totalPages)
        setTotalElements(result.page.totalElements)
        setAssetsError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setAssetsError(getErrorMessage(err, 'Não foi possível carregar os ativos. Tente novamente.'))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingAssets(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearchTerm, page, pageSize])

  useEffect(() => {
    if (view !== 'favorites') return

    let cancelled = false

    listFavorites({ page: favoritesPage, size: FAVORITES_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setFavorites(result.content)
        setFavoritesTotalPages(result.totalPages)
        setFavoritesTotalElements(result.totalElements)
        setFavoritesError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setFavoritesError(getErrorMessage(err, 'Não foi possível carregar os favoritos. Tente novamente.'))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingFavorites(false)
      })

    return () => {
      cancelled = true
    }
  }, [view, favoritesPage, favoritesReloadToken])

  useEffect(() => {
    listFavorites({ page: 0, size: FAVORITES_STATUS_SEED_SIZE })
      .then((result) => {
        setFavoriteAssetIds(new Set(result.content.map((favorite) => favorite.asset.id)))
      })
      .catch(() => {})
  }, [])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setIsLoadingAssets(true)
    setPage(0)
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value))
    setIsLoadingAssets(true)
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setIsLoadingAssets(true)
  }

  const handleViewChange = (newView: AssetsView) => {
    setView(newView)
    if (newView === 'favorites') {
      setIsLoadingFavorites(true)
    }
  }

  const handleFavoritesPageChange = (newPage: number) => {
    setFavoritesPage(newPage)
    setIsLoadingFavorites(true)
  }

  const handleToggleFavorite = useCallback(
    async (assetId: string) => {
      let wasFavorited = false
      setFavoriteAssetIds((prev) => {
        wasFavorited = prev.has(assetId)
        const next = new Set(prev)
        if (wasFavorited) {
          next.delete(assetId)
        } else {
          next.add(assetId)
        }
        return next
      })
      setTogglingAssetIds((prev) => new Set(prev).add(assetId))
      if (view === 'favorites') {
        setIsLoadingFavorites(true)
      }

      try {
        await toggleFavorite(assetId)
        if (view === 'favorites') {
          setFavoritesReloadToken((token) => token + 1)
        }
      } catch (err) {
        setFavoriteAssetIds((prev) => {
          const next = new Set(prev)
          if (wasFavorited) {
            next.add(assetId)
          } else {
            next.delete(assetId)
          }
          return next
        })
        if (view === 'favorites') {
          setIsLoadingFavorites(false)
        }
        showError(getErrorMessage(err, 'Não foi possível atualizar os favoritos.'))
      } finally {
        setTogglingAssetIds((prev) => {
          const next = new Set(prev)
          next.delete(assetId)
          return next
        })
      }
    },
    [view, showError],
  )

  function renderFavoriteButton(assetId: string) {
    const isFavorited = favoriteAssetIds.has(assetId)
    const isToggling = togglingAssetIds.has(assetId)

    return (
      <button
        type="button"
        onClick={() => handleToggleFavorite(assetId)}
        disabled={isToggling}
        aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        aria-pressed={isFavorited}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50',
          isFavorited ? 'text-warning' : 'text-text-muted hover:text-text',
        )}
      >
        {isToggling ? <Spinner size="sm" /> : <Star size={16} strokeWidth={1.5} fill={isFavorited ? 'currentColor' : 'none'} />}
      </button>
    )
  }

  const columns: DataTableColumn<Asset>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (asset) => <span className="font-mono text-xs text-text-muted">{asset.code}</span>,
    },
    {
      key: 'name',
      header: 'Nome',
      render: (asset) => <span className="text-[13px] font-medium text-text">{asset.name}</span>,
    },
    {
      key: 'supplier',
      header: 'Fornecedor',
      render: (asset) => (
        <span className="text-xs text-text-muted" title={asset.supplier ?? undefined}>
          {truncate(asset.supplier, SUPPLIER_MAX_CHARS)}
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unidade',
      render: (asset) => <Badge variant="outline">{asset.unit}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (asset) => (
        <div className="flex items-center justify-end gap-1">
          {renderFavoriteButton(asset.id)}
          <button
            type="button"
            onClick={() => setSelectedAsset(asset)}
            aria-label={`Ver detalhes de ${asset.name}`}
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-background hover:text-text"
          >
            <Eye size={16} strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ]

  const favoritesColumns: DataTableColumn<Favorite>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (favorite) => <span className="font-mono text-xs text-text-muted">{favorite.asset.code}</span>,
    },
    {
      key: 'name',
      header: 'Nome',
      render: (favorite) => <span className="text-[13px] font-medium text-text">{favorite.asset.name}</span>,
    },
    {
      key: 'unit',
      header: 'Unidade',
      render: (favorite) => <Badge variant="outline">{favorite.asset.unit}</Badge>,
    },
    {
      key: 'favoritedAt',
      header: 'Favoritado em',
      render: (favorite) => <span className="text-xs text-text-muted">{formatDate(favorite.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (favorite) => <div className="flex items-center justify-end">{renderFavoriteButton(favorite.asset.id)}</div>,
    },
  ]

  return (
    <AppLayout title="Ativos">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-text">{view === 'all' ? 'Ativos' : 'Favoritos'}</h2>
          <span className="text-xs text-text-muted">({view === 'all' ? totalElements : favoritesTotalElements})</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleViewChange('all')}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                view === 'all' ? 'bg-primary-light text-primary' : 'text-text-muted hover:text-text',
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('favorites')}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                view === 'favorites' ? 'bg-primary-light text-primary' : 'text-text-muted hover:text-text',
              )}
            >
              Favoritos
            </button>
          </div>

          {view === 'all' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} strokeWidth={1.5} />}
              iconPosition="left"
              disabled={assets.length === 0}
              onClick={() => exportToCsv(assets)}
            >
              Exportar
            </Button>
          )}
        </div>
      </div>

      {view === 'all' && (
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <Input
            placeholder="Buscar por nome, código ou fornecedor"
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm flex-1"
          />
          <Select value={pageSize} onChange={handlePageSizeChange} className="w-auto">
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </Select>
        </div>
      )}

      {view === 'all' ? (
        <Card padded={false} className="mt-3 overflow-hidden">
          {assetsError ? (
            <p className="px-4 py-12 text-center text-sm text-error">{assetsError}</p>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={assets}
                rowKey={(asset) => asset.id}
                isLoading={isLoadingAssets}
                emptyState={<p className="text-center text-sm text-text-muted">Nenhum ativo encontrado.</p>}
              />

              {!isLoadingAssets && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="border-t border-border px-4 py-2.5"
                />
              )}
            </>
          )}
        </Card>
      ) : (
        <Card padded={false} className="mt-3 overflow-hidden">
          {favoritesError ? (
            <p className="px-4 py-12 text-center text-sm text-error">{favoritesError}</p>
          ) : (
            <>
              <DataTable
                columns={favoritesColumns}
                data={favorites}
                rowKey={(favorite) => favorite.id}
                isLoading={isLoadingFavorites}
                emptyState={<p className="text-center text-sm text-text-muted">Nenhum ativo favoritado ainda.</p>}
              />

              {!isLoadingFavorites && (
                <Pagination
                  page={favoritesPage}
                  totalPages={favoritesTotalPages}
                  onPageChange={handleFavoritesPageChange}
                  className="border-t border-border px-4 py-2.5"
                />
              )}
            </>
          )}
        </Card>
      )}

      <Modal
        open={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
        title="Detalhes do ativo"
        subtitle={selectedAsset?.name}
      >
        {selectedAsset && (
          <dl className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-text-muted">Código</dt>
              <dd className="text-text">{selectedAsset.code}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-text-muted">Fornecedor</dt>
              <dd className="text-text">{selectedAsset.supplier ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-text-muted">Unidade</dt>
              <dd className="text-text">{selectedAsset.unit}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-text-muted">Criado em</dt>
              <dd className="text-text">{formatDate(selectedAsset.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="font-medium text-text-muted">Atualizado em</dt>
              <dd className="text-text">{formatDate(selectedAsset.updatedAt)}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </AppLayout>
  )
}
