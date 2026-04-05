'use client'

import { createContext, useContext, useEffect } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { applyTokens } from '@/lib/design-tokens'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Inner component — has access to next-themes context
function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme()
  const theme: Theme = resolvedTheme === 'light' ? 'light' : 'dark'

  // Sync custom CSS vars whenever resolved theme changes
  useEffect(() => {
    applyTokens(theme)
  }, [theme])

  const setTheme = (t: Theme) => setNextTheme(t)
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="clario-theme"
    >
      <ThemeBridge>{children}</ThemeBridge>
    </NextThemesProvider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
