import { createContext } from 'react'
import type { CurrentUser } from '../api/client'

export interface AuthContextValue {
  user: CurrentUser | null
  isLoadingUser: boolean
  loadCurrentUser: () => Promise<void>
  clearUser: () => void
  isVerified: boolean
  markVerified: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
