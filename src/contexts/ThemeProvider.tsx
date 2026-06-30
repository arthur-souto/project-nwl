import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from './ThemeContext'
import type { Theme } from './ThemeContext'

const THEME_STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  // The inline script in index.html already applied the right class before React mounted
  // (avoids a flash of the wrong theme) — this just reads that decision back, it doesn't make it.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
