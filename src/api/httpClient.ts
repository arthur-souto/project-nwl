import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { API_URL, AUTH_EXCHANGE_URL, AUTH_REFRESH_URL, type ExchangeResponse } from './client'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../services/tokenService'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const httpClient = axios.create({ baseURL: API_URL })

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('Nenhum refresh token disponível')
      }

      const { data } = await axios.post<ExchangeResponse>(AUTH_REFRESH_URL, { refreshToken })
      setTokens(data)
      return data.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined
    const isExchangeRequest = originalRequest?.url === AUTH_EXCHANGE_URL
    if (!originalRequest || originalRequest._retry || isExchangeRequest) {
      return Promise.reject(error)
    }
    originalRequest._retry = true

    try {
      const newAccessToken = await refreshAccessToken()
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return httpClient(originalRequest)
    } catch (refreshError) {
      clearTokens()
      window.location.href = '/'
      return Promise.reject(refreshError)
    }
  },
)
