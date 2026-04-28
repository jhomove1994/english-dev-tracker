'use client'

import { useCallback, useMemo } from 'react'
import { FLASHCARDS } from '@/lib/data/flashcards'
import { getCustomFlashcards } from '@/lib/custom-flashcards'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'
import { PERSISTENT_STORAGE_KEY } from '@/lib/persistence'

export const FLASHCARD_RATING = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
} as const

export type FlashcardRating = (typeof FLASHCARD_RATING)[keyof typeof FLASHCARD_RATING]

const FLASHCARD_STAGE = {
  NEW: 'new',
  LEARNING: 'learning',
  REVIEW: 'review',
} as const

type FlashcardStage = (typeof FLASHCARD_STAGE)[keyof typeof FLASHCARD_STAGE]

export interface FlashcardState {
  cardId: string
  intervalDays: number
  nextReviewAt: string
  lastRating: FlashcardRating
  repetition: number
  easeFactor: number
  lapses: number
  learningStage: FlashcardStage
  lastReviewedAt: string | null
}

interface StoredFlashcardState {
  cardId: string
  intervalDays: number
  nextReviewAt: string
  lastRating: FlashcardRating
  repetition?: number
  easeFactor?: number
  lapses?: number
  learningStage?: FlashcardStage
  lastReviewedAt?: string | null
}

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
const MASTERED_INTERVAL_DAYS = 21

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next.toISOString()
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

function normalizeState(state: StoredFlashcardState): FlashcardState {
  return {
    cardId: state.cardId,
    intervalDays: state.intervalDays,
    nextReviewAt: state.nextReviewAt,
    lastRating: state.lastRating,
    repetition: state.repetition ?? (state.intervalDays >= 3 ? 2 : state.intervalDays >= 1 ? 1 : 0),
    easeFactor: state.easeFactor ?? DEFAULT_EASE_FACTOR,
    lapses: state.lapses ?? 0,
    learningStage:
      state.learningStage ??
      (state.intervalDays >= 3 ? FLASHCARD_STAGE.REVIEW : state.intervalDays >= 1 ? FLASHCARD_STAGE.LEARNING : FLASHCARD_STAGE.NEW),
    lastReviewedAt: state.lastReviewedAt ?? null,
  }
}

function getNextState(cardId: string, current: FlashcardState | undefined, rating: FlashcardRating, now: Date): FlashcardState {
  const baseState: FlashcardState =
    current ??
    normalizeState({
      cardId,
      intervalDays: 0,
      nextReviewAt: now.toISOString(),
      lastRating: FLASHCARD_RATING.AGAIN,
    })

  let easeFactor = baseState.easeFactor
  let repetition = baseState.repetition
  let intervalDays = baseState.intervalDays
  let lapses = baseState.lapses
  let learningStage = baseState.learningStage
  let nextReviewAt = baseState.nextReviewAt

  switch (rating) {
    case FLASHCARD_RATING.AGAIN: {
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2)
      repetition = 0
      intervalDays = 0
      lapses += 1
      learningStage = FLASHCARD_STAGE.LEARNING
      nextReviewAt = addMinutes(now, 10)
      break
    }
    case FLASHCARD_RATING.HARD: {
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15)
      if (repetition < 2) {
        repetition = Math.max(1, repetition)
        intervalDays = 0
        learningStage = FLASHCARD_STAGE.LEARNING
        nextReviewAt = addMinutes(now, 180)
      } else {
        intervalDays = Math.max(1, Math.round(Math.max(1, intervalDays) * 1.2))
        learningStage = FLASHCARD_STAGE.REVIEW
        nextReviewAt = addDays(now, intervalDays)
      }
      break
    }
    case FLASHCARD_RATING.GOOD: {
      if (repetition === 0) {
        repetition = 1
        intervalDays = 1
        learningStage = FLASHCARD_STAGE.LEARNING
        nextReviewAt = addDays(now, intervalDays)
      } else if (repetition === 1) {
        repetition = 2
        intervalDays = 3
        learningStage = FLASHCARD_STAGE.REVIEW
        nextReviewAt = addDays(now, intervalDays)
      } else {
        repetition += 1
        intervalDays = Math.max(4, Math.round(Math.max(1, intervalDays) * easeFactor))
        learningStage = FLASHCARD_STAGE.REVIEW
        nextReviewAt = addDays(now, intervalDays)
      }
      break
    }
    case FLASHCARD_RATING.EASY: {
      easeFactor += 0.15
      if (repetition < 2) {
        repetition = 2
        intervalDays = 4
        learningStage = FLASHCARD_STAGE.REVIEW
        nextReviewAt = addDays(now, intervalDays)
      } else {
        repetition += 1
        intervalDays = Math.max(6, Math.round(Math.max(1, intervalDays) * easeFactor * 1.3))
        learningStage = FLASHCARD_STAGE.REVIEW
        nextReviewAt = addDays(now, intervalDays)
      }
      break
    }
  }

  return {
    cardId,
    intervalDays,
    nextReviewAt,
    lastRating: rating,
    repetition,
    easeFactor: Math.round(easeFactor * 100) / 100,
    lapses,
    learningStage,
    lastReviewedAt: now.toISOString(),
  }
}

export function useFlashcards(category?: string) {
  const [storedStates, setStoredStates] = usePersistentStorage<StoredFlashcardState[]>(
    PERSISTENT_STORAGE_KEY.FLASHCARD_STATES,
    []
  )
  const [customCards] = usePersistentStorage(PERSISTENT_STORAGE_KEY.CUSTOM_FLASHCARDS, getCustomFlashcards())
  const cardStates = useMemo(() => storedStates.map(normalizeState), [storedStates])

  const allSourceCards = useMemo(() => FLASHCARDS.concat(customCards), [customCards])

  const filteredCards = useMemo(
    () =>
      category && category !== 'All'
        ? allSourceCards.filter((card) => card.category === category)
        : allSourceCards,
    [allSourceCards, category]
  )

  const now = new Date().toISOString()

  const dueCards = useMemo(
    () =>
      filteredCards
        .filter((card) => {
          const state = cardStates.find((item) => item.cardId === card.id)
          if (!state) return true
          return state.nextReviewAt <= now
        })
        .sort((left, right) => {
          const leftState = cardStates.find((item) => item.cardId === left.id)
          const rightState = cardStates.find((item) => item.cardId === right.id)
          return (leftState?.nextReviewAt ?? '') < (rightState?.nextReviewAt ?? '') ? -1 : 1
        }),
    [cardStates, filteredCards, now]
  )

  const rateCard = useCallback(
    (cardId: string, rating: FlashcardRating) => {
      const existing = cardStates.find((item) => item.cardId === cardId)
      const updatedState = getNextState(cardId, existing, rating, new Date())
      const updatedStates = cardStates.filter((item) => item.cardId !== cardId).concat(updatedState)

      setStoredStates(updatedStates)
    },
    [cardStates, setStoredStates]
  )

  const masteredCount = cardStates.filter(
    (state) => state.learningStage === FLASHCARD_STAGE.REVIEW && state.intervalDays >= MASTERED_INTERVAL_DAYS
  ).length

  return {
    allCards: filteredCards,
    dueCards,
    rateCard,
    cardStates,
    masteredCount,
    totalCards: allSourceCards.length,
    categories: Array.from(new Set(allSourceCards.map((card) => card.category))).sort(),
  }
}
