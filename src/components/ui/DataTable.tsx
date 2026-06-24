import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Skeleton } from './Skeleton'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  skeletonRows?: number
  emptyState?: ReactNode
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  skeletonRows = 8,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-[#f9fafb] text-text-muted">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[#f3f4f6] last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    <Skeleton className="h-4 w-full max-w-[160px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-[#f3f4f6] transition-colors last:border-0 hover:bg-[#fafafa]"
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-2', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
