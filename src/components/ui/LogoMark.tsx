import { cn } from '../../lib/cn'

export interface LogoMarkProps {
  tone?: 'default' | 'light'
  className?: string
}

export function LogoMark({ tone = 'default', className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        tone === 'light' ? 'bg-white text-primary-dark' : 'bg-primary-dark text-white',
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  )
}
