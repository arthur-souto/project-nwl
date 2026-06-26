import { createContext } from 'react'
import type { CurrentUser, UserRole } from '../api/client'

export interface AuthContextValue {
  user: CurrentUser | null
  isLoadingUser: boolean
  loadCurrentUser: () => Promise<void>
  clearUser: () => void
  isVerified: boolean
  markVerified: () => void
  role: UserRole | null
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
