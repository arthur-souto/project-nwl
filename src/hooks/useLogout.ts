import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { clearTokens } from '../services/tokenService'

export function useLogout(): () => void {
  const navigate = useNavigate()
  const { clearUser } = useAuth()

  return () => {
    clearTokens()
    clearUser()
    navigate('/', { replace: true })
  }
}
