import { AlertTriangle, CheckCircle2, ExternalLink, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Asset, AssetAssociation, AssetIndication, AssetUpdateRequest, ConcentrationCheckResponse } from '../api/client'
import { useAuth } from '../contexts/useAuth'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useToast } from '../hooks/useToast'
import { cn } from '../lib/cn'
import { getErrorMessage } from '../lib/httpError'
import {
  addAssociation,
  addIndication,
  checkConcentration,
  deleteAssociation,
  deleteIndication,
  listAssociations,
  listIndications,
  updateAsset,
} from '../services/assetService'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { Spinner } from './ui/Spinner'
import { Textarea } from './ui/Textarea'

const INDICATIONS_PAGE_SIZE = 50
const INDICATION_CHIP_COLORS = [
  'bg-primary-light text-primary',
  'bg-info-light text-info',
  'bg-success-light text-success',
  'bg-warning-light text-warning',
] as const
const ASSOCIATIONS_PAGE_SIZE = 50
const CONCENTRATION_CHECK_DEBOUNCE_MS = 500

interface AssetFormState {
  name: string
  supplier: string
  unit: string
  manufacturer: string
  composition: string
  dosage: string
  mechanism: string
  pharmaForms: string
  literatureUrl: string
  category: string
  isExclusive: boolean
  concentrationMin: string
  concentrationMax: string
  concentrationUsual: string
  concentrationUnit: string
  concentrationSource: string
  concentrationPharmaForm: string
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
    pharmaForms: asset.pharmaForms ?? '',
    literatureUrl: asset.literatureUrl ?? '',
    category: asset.category ?? '',
    isExclusive: asset.isExclusive,
    concentrationMin: asset.concentrationMin?.toString() ?? '',
    concentrationMax: asset.concentrationMax?.toString() ?? '',
    concentrationUsual: asset.concentrationUsual?.toString() ?? '',
    concentrationUnit: asset.concentrationUnit ?? '',
    concentrationSource: asset.concentrationSource ?? '',
    concentrationPharmaForm: asset.concentrationPharmaForm ?? '',
  }
}

/** Empty string → unchanged (omit from payload); invalid number → unchanged too. */
function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
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
  if (form.pharmaForms !== (original.pharmaForms ?? '')) payload.pharmaForms = form.pharmaForms
  if (form.literatureUrl !== (original.literatureUrl ?? '')) payload.literatureUrl = form.literatureUrl
  if (form.category !== (original.category ?? '')) payload.category = form.category
  if (form.isExclusive !== original.isExclusive) payload.isExclusive = form.isExclusive

  const concentrationMin = parseOptionalNumber(form.concentrationMin)
  if (concentrationMin !== undefined && concentrationMin !== original.concentrationMin) {
    payload.concentrationMin = concentrationMin
  }
  const concentrationMax = parseOptionalNumber(form.concentrationMax)
  if (concentrationMax !== undefined && concentrationMax !== original.concentrationMax) {
    payload.concentrationMax = concentrationMax
  }
  const concentrationUsual = parseOptionalNumber(form.concentrationUsual)
  if (concentrationUsual !== undefined && concentrationUsual !== original.concentrationUsual) {
    payload.concentrationUsual = concentrationUsual
  }
  if (form.concentrationUnit !== (original.concentrationUnit ?? '')) {
    payload.concentrationUnit = form.concentrationUnit
  }
  if (form.concentrationSource !== (original.concentrationSource ?? '')) {
    payload.concentrationSource = form.concentrationSource
  }
  if (form.concentrationPharmaForm !== (original.concentrationPharmaForm ?? '')) {
    payload.concentrationPharmaForm = form.concentrationPharmaForm
  }

  return payload
}

function hasConcentrationData(asset: Asset): boolean {
  return (
    asset.concentrationMin != null ||
    asset.concentrationMax != null ||
    asset.concentrationUsual != null ||
    asset.concentrationUnit != null ||
    asset.concentrationSource != null ||
    asset.concentrationPharmaForm != null
  )
}

function formatConcentrationSummary(asset: Asset): string {
  const unit = asset.concentrationUnit ?? ''
  const parts: string[] = []

  if (asset.concentrationMin != null && asset.concentrationMax != null) {
    parts.push(`${asset.concentrationMin}${unit} – ${asset.concentrationMax}${unit}`)
  } else if (asset.concentrationMin != null) {
    parts.push(`mín. ${asset.concentrationMin}${unit}`)
  } else if (asset.concentrationMax != null) {
    parts.push(`máx. ${asset.concentrationMax}${unit}`)
  }

  if (asset.concentrationUsual != null) {
    parts.push(`usual: ${asset.concentrationUsual}${unit}`)
  }

  const range = parts.join(', ')
  if (asset.concentrationPharmaForm) {
    return range ? `${range} · Para: ${asset.concentrationPharmaForm}` : `Para: ${asset.concentrationPharmaForm}`
  }
  return range
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

  const [associations, setAssociations] = useState<AssetAssociation[]>([])
  const [isLoadingAssociations, setIsLoadingAssociations] = useState(true)
  const [associationsError, setAssociationsError] = useState<string | null>(null)
  const [newAssociation, setNewAssociation] = useState('')
  const [isAddingAssociation, setIsAddingAssociation] = useState(false)
  const [deletingAssociationIds, setDeletingAssociationIds] = useState<Set<string>>(new Set())

  const [checkValueInput, setCheckValueInput] = useState('')
  const debouncedCheckValue = useDebouncedValue(checkValueInput, CONCENTRATION_CHECK_DEBOUNCE_MS)
  const [checkResult, setCheckResult] = useState<ConcentrationCheckResponse | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!asset) return
    let cancelled = false

    listAssociations(asset.id, { page: 0, size: ASSOCIATIONS_PAGE_SIZE })
      .then((result) => {
        if (cancelled) return
        setAssociations(result.content)
        setAssociationsError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setAssociationsError(getErrorMessage(err, 'Não foi possível carregar as associações.'))
      })
      .finally(() => {
        if (cancelled) return
        setIsLoadingAssociations(false)
      })

    return () => {
      cancelled = true
    }
  }, [asset])

  useEffect(() => {
    if (!asset) return

    const trimmed = debouncedCheckValue.trim()
    const numericValue = Number(trimmed)
    if (!trimmed || Number.isNaN(numericValue) || numericValue < 0) {
      return
    }

    let cancelled = false
    checkConcentration(asset.id, numericValue)
      .then((result) => {
        if (cancelled) return
        setCheckResult(result)
        setCheckError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setCheckError(getErrorMessage(err, 'Não foi possível verificar a concentração.'))
      })

    return () => {
      cancelled = true
    }
  }, [asset, debouncedCheckValue])

  if (!asset) return null

  const handleFieldChange =
    (field: keyof Omit<AssetFormState, 'isExclusive'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const min = parseOptionalNumber(form.concentrationMin)
    const max = parseOptionalNumber(form.concentrationMax)
    const usual = parseOptionalNumber(form.concentrationUsual)

    if (min !== undefined && max !== undefined && min > max) {
      showError('A concentração mínima não pode ser maior que a máxima.')
      return
    }
    if (usual !== undefined && min !== undefined && usual < min) {
      showError('A concentração usual não pode ser menor que a mínima.')
      return
    }
    if (usual !== undefined && max !== undefined && usual > max) {
      showError('A concentração usual não pode ser maior que a máxima.')
      return
    }

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

  const handleAddAssociation = async () => {
    const association = newAssociation.trim()
    if (!association || isAddingAssociation) return

    setIsAddingAssociation(true)
    try {
      const created = await addAssociation(asset.id, { association })
      setAssociations((prev) => [...prev, created])
      setNewAssociation('')
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível adicionar a associação.'))
    } finally {
      setIsAddingAssociation(false)
    }
  }

  const handleDeleteAssociation = async (associationId: string) => {
    setDeletingAssociationIds((prev) => new Set(prev).add(associationId))
    try {
      await deleteAssociation(asset.id, associationId)
      setAssociations((prev) => prev.filter((item) => item.id !== associationId))
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover a associação.'))
    } finally {
      setDeletingAssociationIds((prev) => {
        const next = new Set(prev)
        next.delete(associationId)
        return next
      })
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

  const showsConcentrationData = hasConcentrationData(asset)

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
          <h3 className="text-sm font-semibold text-text">Concentração segura</h3>

          <p className="mt-2 text-sm text-text-muted">
            {showsConcentrationData ? formatConcentrationSummary(asset) : 'Sem dados de concentração cadastrados.'}
          </p>
          {asset.concentrationSource && (
            <Badge variant="outline" className="mt-2">
              Fonte: {asset.concentrationSource}
            </Badge>
          )}

          {isAdmin && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input
                label="Concentração mínima"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.5"
                value={form.concentrationMin}
                onChange={handleFieldChange('concentrationMin')}
              />
              <Input
                label="Concentração máxima"
                type="number"
                step="0.01"
                min="0"
                placeholder="5.0"
                value={form.concentrationMax}
                onChange={handleFieldChange('concentrationMax')}
              />
              <Input
                label="Concentração usual"
                type="number"
                step="0.01"
                min="0"
                placeholder="2.0"
                value={form.concentrationUsual}
                onChange={handleFieldChange('concentrationUsual')}
              />
              <Input
                label="Unidade"
                placeholder="%, mg/g, UI/g"
                value={form.concentrationUnit}
                onChange={handleFieldChange('concentrationUnit')}
              />
              <Input
                label="Fonte"
                placeholder="ANVISA, Literatura, Consenso"
                value={form.concentrationSource}
                onChange={handleFieldChange('concentrationSource')}
              />
              <Input
                label="Forma farmacêutica"
                placeholder="Creme, Cápsula, Solução"
                value={form.concentrationPharmaForm}
                onChange={handleFieldChange('concentrationPharmaForm')}
              />
            </div>
          )}

          {showsConcentrationData && (
            <div className="mt-4 max-w-xs">
              <Input
                label="Verificar concentração"
                type="number"
                step="0.01"
                min="0"
                placeholder={`Ex: ${asset.concentrationUsual ?? '2'}${asset.concentrationUnit ?? ''}`}
                value={checkValueInput}
                onChange={(event) => setCheckValueInput(event.target.value)}
              />

              {checkValueInput.trim() !== '' && checkResult?.status === 'WITHIN_RANGE' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  Dentro do range seguro.
                </p>
              )}
              {checkValueInput.trim() !== '' && checkResult?.status === 'BELOW_MIN' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-warning">
                  <AlertTriangle size={14} strokeWidth={1.5} />
                  Abaixo do mínimo recomendado ({checkResult.concentrationMin}
                  {checkResult.concentrationUnit ?? ''}).
                </p>
              )}
              {checkValueInput.trim() !== '' && checkResult?.status === 'ABOVE_MAX' && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error">
                  <AlertTriangle size={14} strokeWidth={1.5} />
                  Acima do máximo recomendado ({checkResult.concentrationMax}
                  {checkResult.concentrationUnit ?? ''}).
                </p>
              )}
              {checkValueInput.trim() !== '' && checkError && (
                <p className="mt-1.5 text-xs font-medium text-error">{checkError}</p>
              )}
            </div>
          )}
        </section>

        <section className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text">Indicações</h3>

          {isLoadingIndications ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <Spinner size="sm" />
              Carregando indicações...
            </div>
          ) : indicationsError ? (
            <p className="mt-3 text-sm text-error">{indicationsError}</p>
          ) : indications.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Nenhuma indicação cadastrada.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {indications.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
                    INDICATION_CHIP_COLORS[index % INDICATION_CHIP_COLORS.length],
                  )}
                >
                  <span>{item.indication}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteIndication(item.id)}
                      disabled={deletingIndicationIds.has(item.id)}
                      aria-label={`Remover indicação ${item.indication}`}
                      className="flex h-4 w-4 shrink-0 items-center justify-center opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                    >
                      {deletingIndicationIds.has(item.id) ? <Spinner size="sm" /> : <Trash2 size={12} strokeWidth={1.5} />}
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

        <section className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text">Associações</h3>

          {isLoadingAssociations ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <Spinner size="sm" />
              Carregando associações...
            </div>
          ) : associationsError ? (
            <p className="mt-3 text-sm text-error">{associationsError}</p>
          ) : associations.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Nenhuma associação cadastrada.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {associations.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
                    INDICATION_CHIP_COLORS[index % INDICATION_CHIP_COLORS.length],
                  )}
                >
                  <span>{item.association}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAssociation(item.id)}
                      disabled={deletingAssociationIds.has(item.id)}
                      aria-label={`Remover associação ${item.association}`}
                      className="flex h-4 w-4 shrink-0 items-center justify-center opacity-50 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
                    >
                      {deletingAssociationIds.has(item.id) ? <Spinner size="sm" /> : <Trash2 size={12} strokeWidth={1.5} />}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <div className="mt-3 flex items-end gap-2">
              <Input
                placeholder="Nova associação"
                value={newAssociation}
                onChange={(event) => setNewAssociation(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddAssociation()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" loading={isAddingAssociation} onClick={handleAddAssociation}>
                Adicionar
              </Button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  )
}
