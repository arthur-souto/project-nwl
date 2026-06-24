import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Card } from './Card'

export interface MetricCardProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  valueClassName?: string
}

export function MetricCard({ label, value, icon: Icon, valueClassName }: MetricCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
        <p className={cn('mt-1.5 text-2xl font-bold text-text', valueClassName)}>{value}</p>
      </div>
      <Icon size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-text-muted" />
    </Card>
  )
}
