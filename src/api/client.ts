export const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.usegrowe.com.br'

export const GOOGLE_AUTH_URL =
  import.meta.env.VITE_GOOGLE_AUTH_URL ?? `${API_URL}/oauth2/authorization/google`

export const AUTH_EXCHANGE_URL =
  import.meta.env.VITE_AUTH_EXCHANGE_URL ?? `${API_URL}/v1/api/auth/exchange`

export const AUTH_ME_URL = import.meta.env.VITE_AUTH_ME_URL ?? `${API_URL}/v1/api/auth/me`

export const ACTIVATE_ACCOUNT_URL =
  import.meta.env.VITE_ACTIVATE_ACCOUNT_URL ?? `${API_URL}/v1/api/auth/active`

export const ASSETS_SEARCH_URL =
  import.meta.env.VITE_ASSETS_SEARCH_URL ?? `${API_URL}/v1/api/assets/search`

export const AUTH_REFRESH_URL =
  import.meta.env.VITE_AUTH_REFRESH_URL ?? `${API_URL}/v1/api/auth/refresh`

export const ASSETS_FAVORITES_URL =
  import.meta.env.VITE_ASSETS_FAVORITES_URL ?? `${API_URL}/v1/api/assets/favorites`

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
  isVerified: boolean
}

export interface Asset {
  id: string
  code: string
  name: string
  supplier: string | null
  unit: string
  createdAt: string
  updatedAt: string
}

export interface PageableParams {
  page: number
  size: number
  sort?: string[]
}

export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface FavoriteAssetSummary {
  id: string
  code: string
  name: string
  unit: string
  createdAt: string
  updatedAt: string
}

export interface Favorite {
  id: string
  asset: FavoriteAssetSummary
  createdAt: string
}

/** Flat pagination shape — distinct from `Page<T>`, which nests size/number/totalElements/totalPages under `page`. */
export interface FlatPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
