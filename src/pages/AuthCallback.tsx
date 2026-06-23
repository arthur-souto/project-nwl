import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { AUTH_EXCHANGE_URL, type ExchangeResponse } from '../api/client'
import { styles } from '../styles/shared'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')

  const [error, setError] = useState<string | null>(() => {
    if (oauthError) return 'O Google negou a autorização de login.'
    if (!code) return 'Código de autorização não encontrado na URL.'
    return null
  })

  useEffect(() => {
    if (error || !code) return

    let cancelled = false

    axios
      .post<ExchangeResponse>(AUTH_EXCHANGE_URL, { code })
      .then(({ data }) => {
        if (cancelled) return
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        if (cancelled) return
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
        setError(message ?? 'Não foi possível concluir a autenticação. Tente novamente.')
      })

    return () => {
      cancelled = true
    }
  }, [code, error, navigate])

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <span style={styles.errorBadge}>Falha na autenticação</span>
          <p style={styles.subtitle}>{error}</p>
          <Link to="/" style={styles.link}>
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <p style={styles.subtitle}>Autenticando...</p>
      </div>
    </div>
  )
}
