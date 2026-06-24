import { httpClient } from '../api/httpClient'
import { ASSETS_SEARCH_URL, type Asset, type Page, type PageableParams } from '../api/client'

export async function searchAssets(target: string, pageable: PageableParams): Promise<Page<Asset>> {
  const { data } = await httpClient.get<Page<Asset>>(ASSETS_SEARCH_URL, {
    params: {
      target,
      page: pageable.page,
      size: pageable.size,
      sort: pageable.sort,
    },
  })
  return data
}
