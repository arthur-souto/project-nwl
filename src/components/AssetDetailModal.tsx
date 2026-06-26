import { ExternalLink, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Asset, AssetIndication, AssetUpdateRequest } from '../api/client'
import { useAuth } from '../contexts/useAuth'
import { useToast } from '../hooks/useToast'
import { getErrorMessage } from '../lib/httpError'
import { addIndication, deleteIndication, listIndications, updateAsset } from '../services/assetService'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { Spinner } from './ui/Spinner'
import { Textarea } from './ui/Textarea'

const INDICATIONS_PAGE_SIZE = 50

interface AssetFormState {
  name: string
  supplier: string
  unit: string
  manufacturer: string
  composition: string
  dosage: string
  mechanism: string
  associations: string
  pharmaForms: string
  literatureUrl: string
  category: string
  isExclusive: boolean
}

function toFormState(asset: Asset): AssetFormState {
  return {
    name: asset.name,
    supplier: asset.supplier ?? '',
    unit: asset.unit ?? '',
    manufacturer: asset.manufacturer ?? '',
    composition: asset.composition ?? '',
    dosage: asset.dosage ?? '',
    mechanism: asset.mechanism ?? '',
    associations: asset.associations ?? '',
    pharmaForms: asset.pharmaForms ?? '',
    literatureUrl: asset.literatureUrl ?? '',
    category: asset.category ?? '',
    isExclusive: asset.isExclusive,
  }
}

function buildUpdatePayload(original: Asset, form: AssetFormState): AssetUpdateRequest {
  const payload: AssetUpdateRequest = {}
  if (form.name !== original.name) payload.name = form.name
  if (form.supplier !== (original.supplier ?? '')) payload.supplier = form.supplier
  if (form.unit !== (original.unit ?? '')) payload.unit = form.unit
  if (form.manufacturer !== (original.manufacturer ?? '')) payload.manufacturer = form.manufacturer
  if (form.composition !== (original.composition ?? '')) payload.composition = form.composition
  if (form.dosage !== (original.dosage ?? '')) payload.dosage = form.dosage
  if (form.mechanism !== (original.mechanism ?? '')) payload.mechanism = form.mechanism
  if (form.associations !== (original.associations ?? '')) payload.associations = form.associations
  if (form.pharmaForms !== (original.pharmaForms ?? '')) payload.pharmaForms = form.pharmaForms
  if (form.literatureUrl !== (original.literatureUrl ?? '')) payload.literatureUrl = form.literatureUrl
  if (form.category !== (original.category ?? '')) payload.category = form.category
  if (form.isExclusive !== original.isExclusive) payload.isExclusive = form.isExclusive
  return payload
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR')
}

export interface AssetDetailModalProps {
  asset: Asset | null
  onClose: () => void
  onAssetUpdated: (asset: Asset) => void
}

export function AssetDetailModal({ asset, onClose, onAssetUpdated }: AssetDetailModalProps) {
  const { isAdmin } = useAuth()
  const { showSuccess, showError } = useToast()
  const [form, setForm] = useState<AssetFormState>(() => toFormState(asset ?? ({} as Asset)))
  const [isSaving, setIsSaving] = useState(false)

  const [indications, setIndications] = useState<AssetIndication[]>([])
  const [isLoadingIndications, setIsLoadingIndications] = useState(true)
  const [indicationsError, setIndicationsError] = useState<string | null>(null)
  const [newIndication, setNewIndication] = useState('')
  const [isAddingIndication, setIsAddingIndication] = useState(false)
  const [deletingIndicationIds, setDeletingIndicationIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!asset) return
    let cancelled = false

    listIndications(asset.id, { page: 0, size: INDICATIONS_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setIndications(result.content)
        setIndicationsError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setIndicationsError(getErrorMessage(err, 'Não foi possível carregar as indicações.'))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingIndications(false)
      })

    return () => {
      cancelled = true
    }
  }, [asset])

  if (!asset) return null

  const handleFieldChange =
    (field: keyof Omit<AssetFormState, 'isExclusive'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const updates = buildUpdatePayload(asset, form)
    if (Object.keys(updates).length === 0) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateAsset(asset.id, updates)
      showSuccess('Ativo atualizado com sucesso.')
      onAssetUpdated(updated)
      onClose()
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível salvar as alterações.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddIndication = async () => {
    const indication = newIndication.trim()
    if (!indication || isAddingIndication) return

    setIsAddingIndication(true)
    try {
      const created = await addIndication(asset.id, { indication })
      setIndications((prev) => [...prev, created])
      setNewIndication('')
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível adicionar a indicação.'))
    } finally {
      setIsAddingIndication(false)
    }
  }

  const handleDeleteIndication = async (indicationId: string) => {
    setDeletingIndicationIds((prev) => new Set(prev).add(indicationId))
    try {
      await deleteIndication(asset.id, indicationId)
      setIndications((prev) => prev.filter((item) => item.id !== indicationId))
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover a indicação.'))
    } finally {
      setDeletingIndicationIds((prev) => {
        const next = new Set(prev)
        next.delete(indicationId)
        return next
      })
    }
  }

  return (
    <Modal open onClose={onClose} size="lg" title={asset.name} subtitle={asset.code}>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" value={form.name} onChange={handleFieldChange('name')} disabled={!isAdmin} required />
            <Input label="Fornecedor" value={form.supplier} onChange={handleFieldChange('supplier')} disabled={!isAdmin} />
            <Input label="Unidade" value={form.unit} onChange={handleFieldChange('unit')} disabled={!isAdmin} />
            <Input
              label="Fabricante"
              value={form.manufacturer}
              onChange={handleFieldChange('manufacturer')}
              disabled={!isAdmin}
            />
            <Input label="Dosagem" value={form.dosage} onChange={handleFieldChange('dosage')} disabled={!isAdmin} />
            <Input label="Categoria" value={form.category} onChange={handleFieldChange('category')} disabled={!isAdmin} />
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-text">
              <input
                type="checkbox"
                checked={form.isExclusive}
                onChange={(event) => setForm((prev) => ({ ...prev, isExclusive: event.target.checked }))}
                disabled={!isAdmin}
                className="h-4 w-4 rounded border-border text-primary-dark focus:ring-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              />
              Exclusivo
            </label>
          </div>

          <Input
            label="URL da literatura"
            type="url"
            value={form.literatureUrl}
            onChange={handleFieldChange('literatureUrl')}
            disabled={!isAdmin}
            icon={
              form.literatureUrl ? (
                <a href={form.literatureUrl} target="_blank" rel="noreferrer" aria-label="Abrir literatura em nova aba">
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              ) : undefined
            }
          />

          <Textarea
            label="Composição"
            value={form.composition}
            onChange={handleFieldChange('composition')}
            disabled={!isAdmin}
            rows={3}
          />
          <Textarea
            label="Mecanismo de ação"
            value={form.mechanism}
            onChange={handleFieldChange('mechanism')}
            disabled={!isAdmin}
            rows={3}
          />
          <Textarea
            label="Associações"
            value={form.associations}
            onChange={handleFieldChange('associations')}
            disabled={!isAdmin}
            rows={3}
          />
          <Textarea
            label="Formas farmacêuticas"
            value={form.pharmaForms}
            onChange={handleFieldChange('pharmaForms')}
            disabled={!isAdmin}
            rows={3}
          />

          <p className="text-xs text-text-muted">
            Criado em {formatDate(asset.createdAt)} · Atualizado em {formatDate(asset.updatedAt)}
          </p>

          <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
            {isAdmin ? (
              <>
                <button type="button" onClick={onClose} className="text-sm font-medium text-text-muted hover:underline">
                  Cancelar
                </button>
                <Button type="submit" loading={isSaving}>
                  Salvar
                </Button>
              </>
            ) : (
              <Button type="button" variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </form>

        <section className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text">Indicações</h3>

          {isLoadingIndications ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <Spinner size="sm" />
              Carregando indicações...
            </div>
          ) : indicationsError ? (
            <p className="mt-3 text-sm text-error">{indicationsError}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {indications.length === 0 && (
                <li className="text-sm text-text-muted">Nenhuma indicação cadastrada.</li>
              )}
              {indications.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2 text-sm"
                >
                  <span className="text-text">{item.indication}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteIndication(item.id)}
                      disabled={deletingIndicationIds.has(item.id)}
                      aria-label={`Remover indicação ${item.indication}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-background hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingIndicationIds.has(item.id) ? <Spinner size="sm" /> : <Trash2 size={14} strokeWidth={1.5} />}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <div className="mt-3 flex items-end gap-2">
              <Input
                placeholder="Nova indicação"
                value={newIndication}
                onChange={(event) => setNewIndication(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddIndication()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" loading={isAddingIndication} onClick={handleAddIndication}>
                Adicionar
              </Button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}
