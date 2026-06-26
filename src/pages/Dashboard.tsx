import { AlertTriangle, Clock, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { MetricCard } from '../components/ui/MetricCard'
import { useAuth } from '../contexts/useAuth'
import { searchAssets } from '../services/assetService'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [totalAssets, setTotalAssets] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    searchAssets('', { page: 0, size: 1 }).then((result) => {
      if (cancelled) return
      setTotalAssets(result.totalElements)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppLayout title="Início">
      <section>
        <h1 className="text-lg font-semibold text-text">
          {getGreeting()}
          {user ? `, ${user.username}` : ''}
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">Aqui está o resumo dos seus ativos.</p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total de ativos" value={totalAssets ?? '—'} icon={Package} />
        <MetricCard label="Validades próximas" value={12} icon={Clock} valueClassName="text-warning" />
        <MetricCard label="Alertas ativos" value={3} icon={AlertTriangle} valueClassName="text-error" />
      </section>
    </AppLayout>
  )
}
