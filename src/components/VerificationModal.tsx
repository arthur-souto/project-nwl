import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { useToast } from '../hooks/useToast'
import { activateAccount } from '../services/authService'

export interface VerificationModalProps {
  open: boolean
  onClose: () => void
  onVerified: () => void
}

export function VerificationModal({ open, onClose, onVerified }: VerificationModalProps) {
  const [secret, setSecret] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!secret.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await activateAccount(secret.trim())
      showSuccess('Conta verificada com sucesso! Bem-vindo.')
      setSecret('')
      onVerified()
      onClose()
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      showError(
        status === 403
          ? 'Código de ativação inválido.'
          : 'Não foi possível verificar sua conta. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      title="Verificar conta"
      subtitle="Insira o código de ativação para liberar o acesso completo."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          label="Código de ativação"
          placeholder="Digite o código secreto"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          autoFocus
        />

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-text-muted transition-colors hover:underline"
          >
            Agora não
          </button>
          <Button type="submit" loading={isSubmitting}>
            Verificar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
