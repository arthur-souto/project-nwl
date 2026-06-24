import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../api/client'
import { fetchCurrentUser } from '../services/authService'
import { getAccessToken, getAccessTokenPayload } from '../services/tokenService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(() => Boolean(getAccessToken()))
  const [isVerified, setIsVerified] = useState(() => getAccessTokenPayload()?.isVerified ?? true)

  const loadCurrentUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      setIsVerified(currentUser.isVerified)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
  }, [])

  const markVerified = useCallback(() => {
    setIsVerified(true)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return

    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setIsVerified(currentUser.isVerified)
      })
      .catch(() => {})
      .finally(() => setIsLoadingUser(false))
  }, [])

  const value = useMemo(
    () => ({ user, isLoadingUser, loadCurrentUser, clearUser, isVerified, markVerified }),
    [user, isLoadingUser, loadCurrentUser, clearUser, isVerified, markVerified],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
