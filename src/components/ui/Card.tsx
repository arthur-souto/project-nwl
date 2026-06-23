import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type CardVariant = 'default' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Aplica o padding interno padrão. Desative para controlar o espaçamento manualmente (ex: tabelas). */
  padded?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: 'shadow-sm',
  elevated: 'shadow-lg',
}

export function Card({ variant = 'default', padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-white', variantClasses[variant], padded && 'p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
