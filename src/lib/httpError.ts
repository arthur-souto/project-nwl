import axios from 'axios'

/**
 * By the time a 401 reaches a feature's own catch block, httpClient's interceptor has
 * already tried (and failed) to refresh the access token — so this is not a "session
 * expired" case, it's the backend rejecting the request for another reason (e.g. an
 * unverified account). Treat it accordingly instead of showing a generic error.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401) {
      return 'Verifique sua conta para usar este recurso.'
    }
    const backendMessage = (err.response?.data as { message?: string } | undefined)?.message
    if (backendMessage) return backendMessage
  }
  return fallback
}
