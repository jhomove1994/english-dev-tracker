export const PERSISTENT_STORAGE_KEY = {
  USER_PHASE: 'user_phase',
  COMPLETED_MILESTONES: 'completed_milestones',
  STUDY_SESSIONS: 'study_sessions',
  STUDY_DAYS: 'study_days',
  FLASHCARD_STATES: 'flashcard_states',
  CUSTOM_FLASHCARDS: 'custom_flashcards',
  STUDY_PLAN_LESSON_CHECKS: 'study_plan_lesson_checks',
  STUDY_PLAN_WEEK_CHECKPOINTS: 'study_plan_week_checkpoints',
  STUDY_PLAN_DAY_CHECKS: 'study_plan_day_checks',
  STUDY_PLAN_DAY_WRITING: 'study_plan_day_writing',
  STUDY_PLAN_DAY_AI_FEEDBACK: 'study_plan_day_ai_feedback',
  STUDY_PLAN_ERRORS: 'study_plan_errors',
  MOCK_INTERVIEW_SESSIONS: 'mock_interview_sessions',
  DICTATION_HISTORY: 'dictation_history',
} as const

export type PersistentStorageKey = (typeof PERSISTENT_STORAGE_KEY)[keyof typeof PERSISTENT_STORAGE_KEY]

export const PERSISTENT_STORAGE_KEYS = Object.values(PERSISTENT_STORAGE_KEY)
