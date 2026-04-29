'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { getLocalStorage, setLocalStorage } from '@/lib/utils'

const SUPPORT_MODE_STORAGE_KEY = 'support_mode_enabled_global'

interface SupportModeContextValue {
  supportModeEnabled: boolean
  setSupportModeEnabled: (nextValue: boolean | ((current: boolean) => boolean)) => void
}

// Default is `true` only as a safety fallback when the context is consumed outside a provider.
// The actual initial value is always read from localStorage inside SupportModeProvider.
const SupportModeContext = createContext<SupportModeContextValue>({
  supportModeEnabled: true,
  setSupportModeEnabled: () => {},
})

export function SupportModeProvider({ children }: { children: React.ReactNode }) {
  const [supportModeEnabled, setSupportModeEnabledState] = useState<boolean>(() =>
    getLocalStorage(SUPPORT_MODE_STORAGE_KEY, true)
  )

  const setSupportModeEnabled = useCallback((nextValue: boolean | ((current: boolean) => boolean)) => {
    setSupportModeEnabledState((current) => {
      const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
      setLocalStorage(SUPPORT_MODE_STORAGE_KEY, resolved)
      return resolved
    })
  }, [])

  return (
    <SupportModeContext.Provider value={{ supportModeEnabled, setSupportModeEnabled }}>
      {children}
    </SupportModeContext.Provider>
  )
}

export function useSupportMode() {
  return useContext(SupportModeContext)
}
