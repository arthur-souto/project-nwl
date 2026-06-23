import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../api/client'
import { fetchCurrentUser } from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

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

  const value = useMemo(
    () => ({ user, isLoadingUser, loadCurrentUser, clearUser }),
    [user, isLoadingUser, loadCurrentUser, clearUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
