export const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.usegrowe.com.br'

export const GOOGLE_AUTH_URL =
  import.meta.env.VITE_GOOGLE_AUTH_URL ?? `${API_URL}/oauth2/authorization/google`

export const AUTH_EXCHANGE_URL =
  import.meta.env.VITE_AUTH_EXCHANGE_URL ?? `${API_URL}/v1/api/auth/exchange`

export const AUTH_ME_URL = import.meta.env.VITE_AUTH_ME_URL ?? `${API_URL}/v1/api/auth/me`

export interface ExchangeResponse {
  accessToken: string
  refreshToken: string
}

export interface CurrentUser {
  id: string
  googleId: string
  email: string
  username: string
  profileImage: string
}
