import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function PageLayout({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-6 py-12 md:px-8', className)} {...props}>
      {children}
    </div>
  )
}
