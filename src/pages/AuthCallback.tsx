import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../contexts/useAuth'
import { exchangeAuthCode } from '../services/authService'
import { setTokens } from '../services/tokenService'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loadCurrentUser } = useAuth()
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')

  const [error, setError] = useState<string | null>(() => {
    if (oauthError) return 'O Google negou a autorização de login.'
    if (!code) return 'Código de autorização não encontrado na URL.'
    return null
  })

  const hasExchangedRef = useRef(false)

  useEffect(() => {
    if (error || !code) return
    if (hasExchangedRef.current) return
    hasExchangedRef.current = true

    exchangeAuthCode(code)
      .then(async (data) => {
        setTokens(data)
        await loadCurrentUser()
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
        setError(message ?? 'Não foi possível concluir a autenticação. Tente novamente.')
      })
  }, [code, error, navigate, loadCurrentUser])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <Card variant="elevated" className="w-full max-w-sm text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <Badge variant="error">Falha na autenticação</Badge>
            <p className="text-sm text-text-muted">{error}</p>
            <Link to="/" className="text-sm font-semibold text-primary-dark hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <Spinner size="lg" aria-label="Autenticando" />
            <p className="text-sm font-medium text-text-muted">Autenticando sua conta...</p>
          </div>
        )}
      </Card>
    </main>
  )
}
