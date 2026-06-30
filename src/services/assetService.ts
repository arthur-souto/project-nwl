import { httpClient } from '../api/httpClient'
import {
  ASSETS_FAVORITES_URL,
  ASSETS_SEARCH_URL,
  ASSETS_URL,
  type Asset,
  type AssetAssociation,
  type AssetAssociationRequest,
  type AssetIndication,
  type AssetIndicationRequest,
  type AssetUpdateRequest,
  type ConcentrationCheckResponse,
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

export async function checkConcentration(assetId: string, value: number): Promise<ConcentrationCheckResponse> {
  const { data } = await httpClient.get<ConcentrationCheckResponse>(
    `${ASSETS_URL}/${assetId}/concentration-check`,
    { params: { value } },
  )
  return data
}

export async function listAssociations(
  assetId: string,
  pageable: PageableParams,
): Promise<Page<AssetAssociation>> {
  const { data } = await httpClient.get<Page<AssetAssociation>>(`${ASSETS_URL}/${assetId}/associations`, {
    params: { page: pageable.page, size: pageable.size },
  })
  return data
}

export async function addAssociation(
  assetId: string,
  request: AssetAssociationRequest,
): Promise<AssetAssociation> {
  const { data } = await httpClient.post<AssetAssociation>(`${ASSETS_URL}/${assetId}/associations`, request)
  return data
}

export async function deleteAssociation(assetId: string, associationId: string): Promise<void> {
  await httpClient.delete<void>(`${ASSETS_URL}/${assetId}/associations/${associationId}`)
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
