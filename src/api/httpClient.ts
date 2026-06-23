import axios from 'axios'
import { API_URL } from './client'
import { getAccessToken } from '../services/tokenService'

export const httpClient = axios.create({ baseURL: API_URL })

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
