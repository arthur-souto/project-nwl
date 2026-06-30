import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/useTheme'
import { cn } from '../../lib/cn'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-background hover:text-text',
        className,
      )}
    >
      {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
    </button>
  )
}
