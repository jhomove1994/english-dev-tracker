'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getLocalStorage,
  hydrateStorageKey,
  PERSISTENT_STORAGE_UPDATED_EVENT,
  setLocalStorage,
} from '@/lib/utils'

type PersistentStateAction<T> = T | ((current: T) => T)

export function usePersistentStorage<T>(key: string, defaultValue: T) {
  const defaultValueRef = useRef(defaultValue)
  const [value, setValue] = useState<T>(() => getLocalStorage(key, defaultValue))

  useEffect(() => {
    let cancelled = false
    const stableDefaultValue = defaultValueRef.current
    const localValue = getLocalStorage(key, stableDefaultValue)

    void hydrateStorageKey(key, stableDefaultValue, localValue)
      .then((storedValue) => {
        if (!cancelled) {
          setValue(storedValue)
        }
      })
      .catch((error: unknown) => {
        console.warn(`Failed to hydrate storage key "${key}" from SQLite.`, error)
      })

    return () => {
      cancelled = true
    }
  }, [key])

  useEffect(() => {
    const handlePersistentStorageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: T }>

      if (customEvent.detail?.key === key) {
        setValue(customEvent.detail.value)
      }
    }

    const handleBrowserStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      setValue(getLocalStorage(key, defaultValueRef.current))
    }

    window.addEventListener(PERSISTENT_STORAGE_UPDATED_EVENT, handlePersistentStorageUpdate)
    window.addEventListener('storage', handleBrowserStorage)

    return () => {
      window.removeEventListener(PERSISTENT_STORAGE_UPDATED_EVENT, handlePersistentStorageUpdate)
      window.removeEventListener('storage', handleBrowserStorage)
    }
  }, [key])

  const setPersistentValue = useCallback(
    (nextValue: PersistentStateAction<T>) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === 'function'
            ? (nextValue as (current: T) => T)(currentValue)
            : nextValue

        setLocalStorage(key, resolvedValue)
        return resolvedValue
      })
    },
    [key]
  )

  return [value, setPersistentValue] as const
}
