import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { styles } from '../styles/shared'

export default function Dashboard() {
  const navigate = useNavigate()
  const [accessToken] = useState(() => localStorage.getItem('accessToken'))

  useEffect(() => {
    if (!accessToken) {
      navigate('/', { replace: true })
    }
  }, [accessToken, navigate])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/', { replace: true })
  }

  if (!accessToken) return null

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: 480, alignItems: 'stretch' }}>
        <div style={{ alignSelf: 'center' }}>
          <span style={styles.badge}>Autenticado com sucesso!</span>
        </div>
        <h1 style={{ ...styles.title, textAlign: 'center' }}>Dashboard</h1>
        <p style={styles.label}>Seu token JWT (accessToken)</p>
        <textarea style={styles.tokenBox} readOnly value={accessToken} />
        <button type="button" style={styles.secondaryButton} onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  )
}
