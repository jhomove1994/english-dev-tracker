'use client'

import { useCallback, useEffect, useRef } from 'react'

const DB_NAME = 'english-dev-tracker-audio'
const STORE_NAME = 'recordings'
const DB_VERSION = 1

export interface PersistedRecording {
  id: string
  blob: Blob
  mimeType: string
  durationSeconds: number
  notes: string
  recordedAt: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('recordedAt', 'recordedAt', { unique: false })
      }
    }
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    request.onerror = () => reject(request.error)
  })
}

export function useIndexedDBAudio() {
  const dbRef = useRef<IDBDatabase | null>(null)

  useEffect(() => {
    if (typeof indexedDB === 'undefined') return
    openDB()
      .then((db) => { dbRef.current = db })
      .catch((err: unknown) => console.warn('IndexedDB audio init failed:', err))
    return () => {
      dbRef.current?.close()
      dbRef.current = null
    }
  }, [])

  const saveRecording = useCallback(async (recording: PersistedRecording): Promise<void> => {
    const db = dbRef.current
    if (!db) return
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(recording)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }, [])

  const loadAllRecordings = useCallback(async (): Promise<PersistedRecording[]> => {
    const db = dbRef.current
    if (!db) return []
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const index = store.index('recordedAt')
      const req = index.getAll()
      req.onsuccess = () => {
        const results = (req.result as PersistedRecording[]).sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        )
        resolve(results)
      }
      req.onerror = () => reject(req.error)
    })
  }, [])

  const deleteRecording = useCallback(async (id: string): Promise<void> => {
    const db = dbRef.current
    if (!db) return
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }, [])

  const updateNotes = useCallback(async (id: string, notes: string): Promise<void> => {
    const db = dbRef.current
    if (!db) return
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const getReq = store.get(id)
      getReq.onsuccess = () => {
        const record = getReq.result as PersistedRecording | undefined
        if (!record) { resolve(); return }
        const putReq = store.put({ ...record, notes })
        putReq.onsuccess = () => resolve()
        putReq.onerror = () => reject(putReq.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  }, [])

  return { saveRecording, loadAllRecordings, deleteRecording, updateNotes }
}
