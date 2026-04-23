'use client'

import { useState, useCallback } from 'react'
import { FLASHCARDS } from '../data/flashcards'
import { getLocalStorage, setLocalStorage } from '../utils'

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy'

export interface FlashcardState {
  cardId: string
  intervalDays: number
  nextReviewAt: string
  lastRating: FlashcardRating
}

function getNextInterval(current: number, rating: FlashcardRating): number {
  switch (rating) {
    case 'again': return 1
    case 'hard': return Math.max(1, Math.floor(current * 1.2))
    case 'good': return current < 1 ? 1 : current < 3 ? 3 : current < 7 ? 7 : current < 14 ? 14 : 30
    case 'easy': return current < 3 ? 3 : current < 7 ? 7 : current < 14 ? 14 : 30
  }
}

export function useFlashcards(category?: string) {
  const [cardStates, setCardStates] = useState<FlashcardState[]>(() =>
    getLocalStorage<FlashcardState[]>('flashcard_states', [])
  )

  const filteredCards = category && category !== 'All'
    ? FLASHCARDS.filter(c => c.category === category)
    : FLASHCARDS

  const now = new Date().toISOString()
  const dueCards = filteredCards.filter(card => {
    const state = cardStates.find(s => s.cardId === card.id)
    if (!state) return true
    return state.nextReviewAt <= now
  })

  const rateCard = useCallback((cardId: string, rating: FlashcardRating) => {
    const existing = cardStates.find(s => s.cardId === cardId)
    const currentInterval = existing?.intervalDays ?? 1
    const newInterval = getNextInterval(currentInterval, rating)
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + newInterval)

    const newState: FlashcardState = {
      cardId,
      intervalDays: newInterval,
      nextReviewAt: nextReview.toISOString(),
      lastRating: rating,
    }

    const updated = cardStates.filter(s => s.cardId !== cardId).concat(newState)
    setCardStates(updated)
    setLocalStorage('flashcard_states', updated)
  }, [cardStates])

  const masteredCount = cardStates.filter(s => s.intervalDays >= 14).length

  return {
    allCards: filteredCards,
    dueCards,
    rateCard,
    cardStates,
    masteredCount,
    totalCards: FLASHCARDS.length,
  }
}
