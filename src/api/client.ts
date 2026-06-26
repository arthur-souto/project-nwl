export const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.usegrowe.com.br'

export const GOOGLE_AUTH_URL =
  import.meta.env.VITE_GOOGLE_AUTH_URL ?? `${API_URL}/oauth2/authorization/google`

export const AUTH_EXCHANGE_URL =
  import.meta.env.VITE_AUTH_EXCHANGE_URL ?? `${API_URL}/v1/api/auth/exchange`

export const AUTH_ME_URL = import.meta.env.VITE_AUTH_ME_URL ?? `${API_URL}/v1/api/auth/me`

export const ACTIVATE_ACCOUNT_URL =
  import.meta.env.VITE_ACTIVATE_ACCOUNT_URL ?? `${API_URL}/v1/api/auth/active`

export const ASSETS_URL = import.meta.env.VITE_ASSETS_URL ?? `${API_URL}/v1/api/assets`

export const ASSETS_SEARCH_URL = import.meta.env.VITE_ASSETS_SEARCH_URL ?? `${ASSETS_URL}/search`

export const AUTH_REFRESH_URL =
  import.meta.env.VITE_AUTH_REFRESH_URL ?? `${API_URL}/v1/api/auth/refresh`

export const ASSETS_FAVORITES_URL =
  import.meta.env.VITE_ASSETS_FAVORITES_URL ?? `${ASSETS_URL}/favorites`

export interface ExchangeResponse {
  accessToken: string
  refreshToken: string
}

export type UserRole = 'USER' | 'ADMIN'

export interface CurrentUser {
  id: string
  googleId: string
  email: string
  username: string
  profileImage: string
  role: UserRole
  isVerified: boolean
}

export interface Asset {
  id: string
  code: string
  name: string
  supplier: string | null
  unit: string | null
  manufacturer: string | null
  composition: string | null
  dosage: string | null
  mechanism: string | null
  associations: string | null
  pharmaForms: string | null
  literatureUrl: string | null
  category: string | null
  isExclusive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssetUpdateRequest {
  name?: string
  supplier?: string
  unit?: string
  manufacturer?: string
  composition?: string
  dosage?: string
  mechanism?: string
  associations?: string
  pharmaForms?: string
  literatureUrl?: string
  category?: string
  isExclusive?: boolean
}

export interface AssetIndication {
  id: string
  assetId: string
  indication: string
  createdAt: string
}

export interface AssetIndicationRequest {
  indication: string
}

export interface PageableParams {
  page: number
  size: number
  sort?: string[]
}

/** Pagination wrapper shared by all paginated asset endpoints (search, indications). */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface FavoriteAssetSummary {
  id: string
  code: string
  name: string
  unit: string | null
  createdAt: string
  updatedAt: string
}

export interface Favorite {
  id: string
  asset: FavoriteAssetSummary
  createdAt: string
}

/** Flat pagination shape used by /assets/favorites — same fields as `Page<T>` minus first/last/empty. */
export interface FlatPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
