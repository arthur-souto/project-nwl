import { cn } from '../../lib/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-10 w-10 border-[3px]',
}

export function Spinner({ size = 'md', className, 'aria-label': ariaLabel = 'Carregando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-block animate-spin rounded-full border-border border-t-primary-dark',
        sizeClasses[size],
        className,
      )}
    />
  )
}
