'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { getLocalStorage, setLocalStorage, getDayKey } from '../utils'

export interface StudySession {
  id: string
  activityType: string
  durationSeconds: number
  startedAt: string
  createdAt: string
}

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [selectedActivity, setSelectedActivity] = useState('')
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (!selectedActivity) return
    setIsRunning(true)
    startTimeRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current!) / 1000))
    }, 1000)
  }, [selectedActivity, elapsed])

  const pause = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (elapsed > 0 && selectedActivity) {
      const session: StudySession = {
        id: crypto.randomUUID(),
        activityType: selectedActivity,
        durationSeconds: elapsed,
        startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }
      const sessions = getLocalStorage<StudySession[]>('study_sessions', [])
      sessions.push(session)
      setLocalStorage('study_sessions', sessions)
      updateStreak()
    }
    setElapsed(0)
    startTimeRef.current = null
  }, [elapsed, selectedActivity])

  const reset = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setElapsed(0)
    startTimeRef.current = null
  }, [])

  function updateStreak() {
    const today = getDayKey()
    const studyDays = getLocalStorage<string[]>('study_days', [])
    if (!studyDays.includes(today)) {
      studyDays.push(today)
      setLocalStorage('study_days', studyDays)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    isRunning,
    elapsed,
    selectedActivity,
    setSelectedActivity,
    start,
    pause,
    stop,
    reset,
  }
}

export function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([])

  useEffect(() => {
    setSessions(getLocalStorage<StudySession[]>('study_sessions', []))
  }, [])

  const todaySessions = sessions.filter(s => s.startedAt.startsWith(getDayKey()))
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0)

  const refresh = () => {
    setSessions(getLocalStorage<StudySession[]>('study_sessions', []))
  }

  return { sessions, todaySessions, todaySeconds, refresh }
}
