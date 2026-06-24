import { httpClient } from '../api/httpClient'
import { ACTIVATE_ACCOUNT_URL, AUTH_EXCHANGE_URL, AUTH_ME_URL, type CurrentUser, type ExchangeResponse } from '../api/client'

export async function exchangeAuthCode(code: string): Promise<ExchangeResponse> {
  const { data } = await httpClient.post<ExchangeResponse>(AUTH_EXCHANGE_URL, { code })
  return data
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await httpClient.get<CurrentUser>(AUTH_ME_URL)
  return data
}

export async function activateAccount(secret: string): Promise<void> {
  await httpClient.put<void>(ACTIVATE_ACCOUNT_URL, null, { params: { secret } })
}
