import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/cn'

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'animate-toast-in flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-lg',
            toast.variant === 'success' ? 'bg-success text-white' : 'bg-red-600 text-white',
          )}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Fechar notificação"
            className="text-white/80 transition-colors hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
