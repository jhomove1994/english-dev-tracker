'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useIndexedDBAudio } from '@/lib/hooks/useIndexedDBAudio'

export interface Recording {
  id: string
  blobUrl: string
  durationSeconds: number
  notes: string
  recordedAt: string
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentDuration, setCurrentDuration] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const blobUrlsRef = useRef<Record<string, string>>({})

  const idb = useIndexedDBAudio()

  // Load persisted recordings on mount
  useEffect(() => {
    let cancelled = false
    idb.loadAllRecordings()
      .then((persisted) => {
        if (cancelled) return
        const restored: Recording[] = persisted.map((r) => {
          const blobUrl = URL.createObjectURL(r.blob)
          blobUrlsRef.current[r.id] = blobUrl
          return {
            id: r.id,
            blobUrl,
            durationSeconds: r.durationSeconds,
            notes: r.notes,
            recordedAt: r.recordedAt,
          }
        })
        setRecordings(restored)
        setLoaded(true)
      })
      .catch(() => { setLoaded(true) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Revoke blob URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      startTimeRef.current = Date.now()
      setCurrentDuration(0)

      intervalRef.current = setInterval(() => {
        setCurrentDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      console.error('Microphone access denied')
    }
  }, [])

  const stopRecording = useCallback((): Promise<Recording | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) { resolve(null); return }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType ?? 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const blobUrl = URL.createObjectURL(blob)
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRecording(false)
        setCurrentDuration(0)

        const recording: Recording = {
          id: crypto.randomUUID(),
          blobUrl,
          durationSeconds: duration,
          notes: '',
          recordedAt: new Date().toISOString(),
        }

        blobUrlsRef.current[recording.id] = blobUrl

        // Persist to IndexedDB
        idb.saveRecording({
          id: recording.id,
          blob,
          mimeType,
          durationSeconds: duration,
          notes: '',
          recordedAt: recording.recordedAt,
        }).catch((err: unknown) => console.warn('Failed to save audio to IndexedDB:', err))

        setRecordings(prev => [recording, ...prev])
        resolve(recording)
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    })
  }, [idb])

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id)
      if (rec) {
        URL.revokeObjectURL(rec.blobUrl)
        delete blobUrlsRef.current[id]
      }
      return prev.filter(r => r.id !== id)
    })
    idb.deleteRecording(id).catch((err: unknown) => console.warn('Failed to delete audio from IndexedDB:', err))
  }, [idb])

  const updateNotes = useCallback((id: string, notes: string) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, notes } : r))
    idb.updateNotes(id, notes).catch((err: unknown) => console.warn('Failed to update notes in IndexedDB:', err))
  }, [idb])

  return {
    isRecording,
    currentDuration,
    recordings,
    loaded,
    startRecording,
    stopRecording,
    deleteRecording,
    updateNotes,
  }
}
