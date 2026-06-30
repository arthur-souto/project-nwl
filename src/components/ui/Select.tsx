import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, id, className, children, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'rounded border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary-dark focus:ring-2 focus:ring-primary-dark',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
})
