'use client'

import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'
import { PERSISTENT_STORAGE_KEY } from '@/lib/persistence'
import type { StudySession } from './useTimer'

export function useStudyStats() {
  const [sessions] = usePersistentStorage<StudySession[]>(PERSISTENT_STORAGE_KEY.STUDY_SESSIONS, [])
  const [studyDays] = usePersistentStorage<string[]>(PERSISTENT_STORAGE_KEY.STUDY_DAYS, [])

  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0)
  const totalHours = Math.round(totalSeconds / 3600 * 10) / 10

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeekSessions = sessions.filter(s => new Date(s.startedAt) >= weekAgo)
  const thisWeekSeconds = thisWeekSessions.reduce((acc, s) => acc + s.durationSeconds, 0)
  const thisWeekHours = Math.round(thisWeekSeconds / 3600 * 10) / 10

  const sortedDays = [...studyDays].sort().reverse()
  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  const todayDate = new Date()
  const today = todayDate.toISOString().split('T')[0]
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  if (sortedDays.length > 0) {
    const start = sortedDays[0] === today || sortedDays[0] === yesterday ? 0 : -1
    if (start >= 0) {
      currentStreak = 1
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1])
        const curr = new Date(sortedDays[i])
        const diff = (prev.getTime() - curr.getTime()) / 86400000
        if (Math.round(diff) === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }
  }

  const asc = [...studyDays].sort()
  tempStreak = asc.length > 0 ? 1 : 0
  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1])
    const curr = new Date(asc[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (Math.round(diff) === 1) {
      tempStreak++
      if (tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      tempStreak = 1
    }
  }
  if (tempStreak > bestStreak) bestStreak = tempStreak

  const activityMap: Record<string, number> = {}
  for (const s of sessions) {
    activityMap[s.activityType] = (activityMap[s.activityType] || 0) + s.durationSeconds
  }

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const daySessions = sessions.filter(s => s.startedAt.startsWith(key))
    const dayMinutes = Math.round(daySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      minutes: dayMinutes,
    }
  })

  return {
    totalHours,
    thisWeekHours,
    currentStreak,
    bestStreak,
    activityMap,
    weeklyData,
    sessions,
    studyDays,
  }
}
