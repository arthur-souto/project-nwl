import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'outline'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error: 'bg-error-light text-error',
  info: 'bg-info-light text-info',
  outline: 'border border-border text-text-muted',
}

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
