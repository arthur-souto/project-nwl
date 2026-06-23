import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../services/tokenService'

export function useRequireAuth(): string | null {
  const navigate = useNavigate()
  const [accessToken] = useState(() => getAccessToken())

  useEffect(() => {
    if (!accessToken) {
      navigate('/', { replace: true })
    }
  }, [accessToken, navigate])

  return accessToken
}
