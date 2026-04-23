export interface ActivityType {
  id: string
  label: string
  icon: string
  color: string
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'listening', label: 'Listening (podcast/video)', icon: '🎧', color: '#3b82f6' },
  { id: 'speaking', label: 'Solo Speaking', icon: '🗣️', color: '#22c55e' },
  { id: 'vocabulary', label: 'Vocabulary / Flashcards', icon: '📚', color: '#f59e0b' },
  { id: 'shadowing', label: 'Shadowing', icon: '🎭', color: '#8b5cf6' },
  { id: 'conversation', label: 'italki / Conversation', icon: '💬', color: '#06b6d4' },
  { id: 'mock_interview', label: 'Mock Interview', icon: '🎤', color: '#ef4444' },
  { id: 'reading', label: 'Reading (tech content)', icon: '📖', color: '#ec4899' },
]
