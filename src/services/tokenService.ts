import { jwtDecode } from 'jwt-decode'
import type { ExchangeResponse } from '../api/client'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export interface JwtPayload {
  sub: string
  email: string
  username: string
  isVerified: boolean
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getAccessTokenPayload(): JwtPayload | null {
  const token = getAccessToken()
  if (!token) return null

  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}

export function setTokens({ accessToken, refreshToken }: ExchangeResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
