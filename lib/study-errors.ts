'use client'

import type { Flashcard } from '@/lib/data/flashcards'
import { getLocalStorage, setLocalStorage } from '@/lib/utils'

export const STUDY_ERROR_STORAGE_KEY = 'study_plan_errors'

export const STUDY_ERROR_TRACK = {
  WRITING: 'writing',
  SPEAKING: 'speaking',
} as const

export type StudyErrorTrack = (typeof STUDY_ERROR_TRACK)[keyof typeof STUDY_ERROR_TRACK]

export const STUDY_ERROR_CATEGORY = {
  GRAMMAR: 'grammar',
  CLARITY: 'clarity',
  VOCABULARY: 'vocabulary',
  STRUCTURE: 'structure',
  FLUENCY: 'fluency',
  PRONUNCIATION: 'pronunciation',
  TECHNICAL_PRECISION: 'technical_precision',
} as const

export type StudyErrorCategory = (typeof STUDY_ERROR_CATEGORY)[keyof typeof STUDY_ERROR_CATEGORY]

export const STUDY_ERROR_CATEGORY_LABEL = {
  [STUDY_ERROR_CATEGORY.GRAMMAR]: 'Grammar',
  [STUDY_ERROR_CATEGORY.CLARITY]: 'Clarity',
  [STUDY_ERROR_CATEGORY.VOCABULARY]: 'Vocabulary',
  [STUDY_ERROR_CATEGORY.STRUCTURE]: 'Structure',
  [STUDY_ERROR_CATEGORY.FLUENCY]: 'Fluency',
  [STUDY_ERROR_CATEGORY.PRONUNCIATION]: 'Pronunciation risk',
  [STUDY_ERROR_CATEGORY.TECHNICAL_PRECISION]: 'Technical precision',
} as const satisfies Record<StudyErrorCategory, string>

export const STUDY_ERROR_TRACK_LABEL = {
  [STUDY_ERROR_TRACK.WRITING]: 'Writing',
  [STUDY_ERROR_TRACK.SPEAKING]: 'Speaking',
} as const satisfies Record<StudyErrorTrack, string>

export interface StudyErrorRecord {
  id: string
  dayId: string
  dayTitle: string
  phaseSlug: string
  weekId: string
  track: StudyErrorTrack
  category: StudyErrorCategory
  original: string
  corrected: string
  explanation: string
  nextAction: string
  flashcardAdded: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStudyErrorInput {
  dayId: string
  dayTitle: string
  phaseSlug: string
  weekId: string
  track: StudyErrorTrack
}

export interface StudyErrorCategorySummary {
  category: StudyErrorCategory
  label: string
  count: number
}

export interface StudyErrorTrackSummary {
  track: StudyErrorTrack
  label: string
  count: number
}

export interface StudyErrorSummary {
  totalErrors: number
  linkedFlashcardsCount: number
  weakPoints: StudyErrorCategorySummary[]
  byTrack: StudyErrorTrackSummary[]
  recentErrors: StudyErrorRecord[]
}

function buildStudyErrorId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `study-error-${crypto.randomUUID()}`
  }

  return `study-error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createStudyErrorRecord(input: CreateStudyErrorInput): StudyErrorRecord {
  const now = new Date().toISOString()

  return {
    id: buildStudyErrorId(),
    dayId: input.dayId,
    dayTitle: input.dayTitle,
    phaseSlug: input.phaseSlug,
    weekId: input.weekId,
    track: input.track,
    category: STUDY_ERROR_CATEGORY.GRAMMAR,
    original: '',
    corrected: '',
    explanation: '',
    nextAction: '',
    flashcardAdded: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function getStudyErrors() {
  return getLocalStorage<StudyErrorRecord[]>(STUDY_ERROR_STORAGE_KEY, [])
}

export function saveStudyErrors(errors: StudyErrorRecord[]) {
  setLocalStorage(STUDY_ERROR_STORAGE_KEY, errors)
}

export function buildStudyErrorFlashcard(error: StudyErrorRecord): Flashcard {
  return {
    id: `study-error-flashcard-${error.id}`,
    front: `Fix this ${STUDY_ERROR_TRACK_LABEL[error.track].toLowerCase()} mistake: ${error.original}`,
    back: [
      `Correct version: ${error.corrected}`,
      error.explanation ? `Why: ${error.explanation}` : null,
      error.nextAction ? `Practice target: ${error.nextAction}` : null,
      `Category: ${STUDY_ERROR_CATEGORY_LABEL[error.category]}`,
      `Source: ${error.dayTitle}`,
    ]
      .filter(Boolean)
      .join('\n'),
    category: 'Personal corrections',
  }
}

export function summarizeStudyErrors(errors: StudyErrorRecord[]): StudyErrorSummary {
  const categoryCounts = Object.values(STUDY_ERROR_CATEGORY).reduce<Record<StudyErrorCategory, number>>(
    (accumulator, category) => {
      accumulator[category] = 0
      return accumulator
    },
    {} as Record<StudyErrorCategory, number>
  )

  const trackCounts = Object.values(STUDY_ERROR_TRACK).reduce<Record<StudyErrorTrack, number>>(
    (accumulator, track) => {
      accumulator[track] = 0
      return accumulator
    },
    {} as Record<StudyErrorTrack, number>
  )

  errors.forEach((error) => {
    categoryCounts[error.category] += 1
    trackCounts[error.track] += 1
  })

  return {
    totalErrors: errors.length,
    linkedFlashcardsCount: errors.filter((error) => error.flashcardAdded).length,
    weakPoints: Object.values(STUDY_ERROR_CATEGORY)
      .map((category) => ({
        category,
        label: STUDY_ERROR_CATEGORY_LABEL[category],
        count: categoryCounts[category],
      }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count),
    byTrack: Object.values(STUDY_ERROR_TRACK)
      .map((track) => ({
        track,
        label: STUDY_ERROR_TRACK_LABEL[track],
        count: trackCounts[track],
      }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count),
    recentErrors: [...errors]
      .sort((left, right) => (left.updatedAt < right.updatedAt ? 1 : -1))
      .slice(0, 5),
  }
}
