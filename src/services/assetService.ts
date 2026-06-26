import { httpClient } from '../api/httpClient'
import {
  ASSETS_FAVORITES_URL,
  ASSETS_SEARCH_URL,
  ASSETS_URL,
  type Asset,
  type AssetIndication,
  type AssetIndicationRequest,
  type AssetUpdateRequest,
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

export async function updateAsset(id: string, updates: AssetUpdateRequest): Promise<Asset> {
  const { data } = await httpClient.patch<Asset>(`${ASSETS_URL}/${id}`, updates)
  return data
}

export async function listIndications(
  assetId: string,
  pageable: PageableParams,
): Promise<Page<AssetIndication>> {
  const { data } = await httpClient.get<Page<AssetIndication>>(`${ASSETS_URL}/${assetId}/indications`, {
    params: { page: pageable.page, size: pageable.size },
  })
  return data
}

export async function addIndication(
  assetId: string,
  request: AssetIndicationRequest,
): Promise<AssetIndication> {
  const { data } = await httpClient.post<AssetIndication>(`${ASSETS_URL}/${assetId}/indications`, request)
  return data
}

export async function deleteIndication(assetId: string, indicationId: string): Promise<void> {
  await httpClient.delete<void>(`${ASSETS_URL}/${assetId}/indications/${indicationId}`)
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
