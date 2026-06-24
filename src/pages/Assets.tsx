import { Download, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Asset } from '../api/client'
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
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { searchAssets } from '../services/assetService'

const SEARCH_DEBOUNCE_MS = 300
const SUPPLIER_MAX_CHARS = 30

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
      .catch(() => {
        if (cancelled) return
        setAssetsError('Não foi possível carregar os ativos. Tente novamente.')
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingAssets(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearchTerm, page, pageSize])

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
        <button
          type="button"
          onClick={() => setSelectedAsset(asset)}
          aria-label={`Ver detalhes de ${asset.name}`}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-background hover:text-text"
        >
          <Eye size={16} strokeWidth={1.5} />
        </button>
      ),
    },
  ]

  return (
    <AppLayout title="Ativos">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-text">Ativos</h2>
          <span className="text-xs text-text-muted">({totalElements})</span>
        </div>
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
      </div>

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

            {!isLoadingAssets && assets.length > 0 && (
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
