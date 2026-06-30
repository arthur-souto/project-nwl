import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ModalSize = 'md' | 'lg'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children?: ReactNode
  /** Quando false, clicar no overlay não fecha o modal (uso bloqueante). */
  closeOnOverlayClick?: boolean
  /** `md` (28rem, padrão) ou `lg` (42rem, para formulários maiores). */
  size?: ModalSize
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  closeOnOverlayClick = true,
  size = 'md',
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
        className={cn('max-h-[85vh] w-full overflow-y-auto rounded-md bg-surface p-8 shadow-lg', sizeClasses[size], className)}
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
