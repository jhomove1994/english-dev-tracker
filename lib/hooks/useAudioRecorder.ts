'use client'

import { useState, useRef, useCallback } from 'react'

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
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

        setRecordings(prev => [recording, ...prev])
        resolve(recording)
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    })
  }, [])

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id)
      if (rec) URL.revokeObjectURL(rec.blobUrl)
      return prev.filter(r => r.id !== id)
    })
  }, [])

  const updateNotes = useCallback((id: string, notes: string) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, notes } : r))
  }, [])

  return {
    isRecording,
    currentDuration,
    recordings,
    startRecording,
    stopRecording,
    deleteRecording,
    updateNotes,
  }
}
