import { useCallback, useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 4000

let toasts: ToastItem[] = []
const listeners = new Set<(toasts: ToastItem[]) => void>()

function notify() {
  for (const listener of listeners) {
    listener(toasts)
  }
}

function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id)
  notify()
}

function pushToast(message: string, variant: ToastVariant) {
  const id = crypto.randomUUID()
  toasts = [...toasts, { id, message, variant }]
  notify()
  setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
}

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>(toasts)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  const showSuccess = useCallback((message: string) => pushToast(message, 'success'), [])
  const showError = useCallback((message: string) => pushToast(message, 'error'), [])

  return { toasts: items, showSuccess, showError, dismissToast }
}
