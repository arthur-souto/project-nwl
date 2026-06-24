import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children?: ReactNode
  /** Quando false, clicar no overlay não fecha o modal (uso bloqueante). */
  closeOnOverlayClick?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={cn('w-full max-w-md rounded-md bg-white p-8 shadow-lg', className)}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold text-text">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  )
}
