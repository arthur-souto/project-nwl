import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../api/client'
import { fetchCurrentUser } from '../services/authService'
import { getAccessToken } from '../services/tokenService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(() => Boolean(getAccessToken()))

  const loadCurrentUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return

    fetchCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {})
      .finally(() => setIsLoadingUser(false))
  }, [])

  const value = useMemo(
    () => ({ user, isLoadingUser, loadCurrentUser, clearUser }),
    [user, isLoadingUser, loadCurrentUser, clearUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
