import { cn } from '../../lib/cn'

export interface PaginationProps {
  /** Página atual, indexada a partir de 0. */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-end gap-3 text-xs text-text-muted', className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="font-medium transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-text-muted"
      >
        ← Anterior
      </button>
      <span>
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="font-medium transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-text-muted"
      >
        Próximo →
      </button>
    </div>
  )
}
