'use client'

import { getLocalStorage, setLocalStorage } from '@/lib/utils'
import type { Flashcard } from '@/lib/data/flashcards'

export const CUSTOM_FLASHCARDS_STORAGE_KEY = 'custom_flashcards'
export const CUSTOM_FLASHCARD_SAVE_RESULT = {
  ADDED: 'added',
  EXISTS: 'exists',
} as const

export type CustomFlashcardSaveResult = (typeof CUSTOM_FLASHCARD_SAVE_RESULT)[keyof typeof CUSTOM_FLASHCARD_SAVE_RESULT]

export function getCustomFlashcards() {
  return getLocalStorage<Flashcard[]>(CUSTOM_FLASHCARDS_STORAGE_KEY, [])
}

export function saveCustomFlashcards(cards: Flashcard[]) {
  setLocalStorage(CUSTOM_FLASHCARDS_STORAGE_KEY, cards)
}

export function saveUniqueCustomFlashcard(card: Flashcard): CustomFlashcardSaveResult {
  const cards = getCustomFlashcards()
  const exists = cards.some((item) => item.id === card.id || item.front === card.front)

  if (exists) return CUSTOM_FLASHCARD_SAVE_RESULT.EXISTS

  saveCustomFlashcards([...cards, card])
  return CUSTOM_FLASHCARD_SAVE_RESULT.ADDED
}

export function addCustomFlashcard(card: Flashcard) {
  return saveUniqueCustomFlashcard(card) === CUSTOM_FLASHCARD_SAVE_RESULT.ADDED
}
