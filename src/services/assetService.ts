import { httpClient } from '../api/httpClient'
import {
  ASSETS_FAVORITES_URL,
  ASSETS_SEARCH_URL,
  type Asset,
  type Favorite,
  type FlatPage,
  type Page,
  type PageableParams,
} from '../api/client'

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

export async function listFavorites(pageable: PageableParams): Promise<FlatPage<Favorite>> {
  const { data } = await httpClient.get<FlatPage<Favorite>>(ASSETS_FAVORITES_URL, {
    params: { page: pageable.page, size: pageable.size },
  })
  return data
}

export async function toggleFavorite(assetId: string): Promise<void> {
  await httpClient.put<void>(`${ASSETS_FAVORITES_URL}/${assetId}/toggle`)
}
