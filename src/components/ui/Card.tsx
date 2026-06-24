import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type CardVariant = 'default' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Aplica o padding interno padrão. Desative para controlar o espaçamento manualmente (ex: tabelas). */
  padded?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: '',
  elevated: 'shadow-sm',
}

export function Card({ variant = 'default', padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-md border border-border bg-white', variantClasses[variant], padded && 'p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
