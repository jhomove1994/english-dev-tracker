import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LocalStorageOptions {
  skipPersist?: boolean
}

interface PersistentStorageUpdateDetail<T> {
  key: string
  value: T
}

export const PERSISTENT_STORAGE_UPDATED_EVENT = 'persistent-storage-updated'

function areSerializedValuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T, options?: LocalStorageOptions): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(
      new CustomEvent<PersistentStorageUpdateDetail<T>>(PERSISTENT_STORAGE_UPDATED_EVENT, {
        detail: { key, value },
      })
    )
  } catch {
    // ignore
  }

  if (options?.skipPersist) return

  void fetch('/api/storage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entries: {
        [key]: value,
      },
    }),
  }).catch((error: unknown) => {
    console.warn(`Failed to persist storage key "${key}" to SQLite.`, error)
  })
}

export async function hydrateStorageKey<T>(key: string, defaultValue: T, localValue: T) {
  const response = await fetch(`/api/storage?keys=${encodeURIComponent(key)}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to load persistent storage key "${key}".`)
  }

  const payload = (await response.json()) as {
    entries?: Record<string, unknown>
    keys?: string[]
  }
  const hasRemoteValue = Array.isArray(payload.keys) && payload.keys.includes(key)
  const hasMeaningfulLocalValue = !areSerializedValuesEqual(localValue, defaultValue)

  if (hasRemoteValue && payload.entries && key in payload.entries) {
    const remoteValue = payload.entries[key] as T

    if (hasMeaningfulLocalValue && !areSerializedValuesEqual(localValue, remoteValue)) {
      setLocalStorage(key, localValue)
      return localValue
    }

    setLocalStorage(key, remoteValue, { skipPersist: true })
    return remoteValue
  }

  if (hasMeaningfulLocalValue) {
    setLocalStorage(key, localValue)
  }

  return localValue
}

export function getDayKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getWeekDays(): string[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(getDayKey(d))
  }
  return days
}
