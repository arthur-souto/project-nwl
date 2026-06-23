import { GOOGLE_AUTH_URL } from '../api/client'
import { styles } from '../styles/shared'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-1.9 14-5.4l-6.4-5.3c-2 1.4-4.6 2.2-7.6 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.4 5.3C41.5 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

export default function Login() {
  const handleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Bem-vindo</h1>
        <p style={styles.subtitle}>Entre com sua conta Google para continuar</p>
        <button type="button" style={styles.button} onClick={handleLogin}>
          <GoogleIcon />
          Login com Google
        </button>
      </div>
    </div>
  )
}
