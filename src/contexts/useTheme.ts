import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'
import type { ThemeContextValue } from './ThemeContext'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  return context
}
