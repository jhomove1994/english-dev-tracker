'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseVoiceRecorderReturn {
  isRecording: boolean
  seconds: number
  audioBlob: Blob | null
  isSupported: boolean
  permissionError: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

const MAX_SECONDS = 120
const MIME_TYPE = 'audio/webm'

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) return

    // If already recording, stop instead
    if (isRecording) {
      stopRecording()
      return
    }

    setAudioBlob(null)
    setSeconds(0)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      setPermissionError(null)
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Allow access in your browser settings.'
          : 'Could not access microphone.'
      setPermissionError(msg)
      return
    }

    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported(MIME_TYPE) ? MIME_TYPE : ''
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      setAudioBlob(blob)
      cleanup()
    }

    recorder.start(250) // collect data every 250ms
    setIsRecording(true)

    // Live seconds counter
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1
        if (next >= MAX_SECONDS) {
          stopRecording()
        }
        return next
      })
    }, 1000)
  }, [isSupported, isRecording, stopRecording, cleanup])

  const reset = useCallback(() => {
    stopRecording()
    setAudioBlob(null)
    setSeconds(0)
  }, [stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isRecording,
    seconds,
    audioBlob,
    isSupported,
    permissionError,
    startRecording,
    stopRecording,
    reset,
  }
}
