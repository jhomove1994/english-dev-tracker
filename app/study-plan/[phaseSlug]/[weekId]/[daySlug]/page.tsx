'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  FileText,
  Headphones,
  Languages,
  Lock,
  MessageSquare,
  Mic,
  PenLine,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Video,
  Volume2,
} from 'lucide-react'
import { ALL_STUDY_WEEKS, getPhaseBySlug, type StudyResource } from '@/lib/data/study-plan'
import {
  DAY_AI_FEEDBACK_STORAGE_KEY,
  buildWeekDayClasses,
  DAY_CHECKS_STORAGE_KEY,
  DAY_WRITING_STORAGE_KEY,
  isDayUnlocked,
  isPhaseUnlocked,
  isWeekUnlocked,
  LESSON_CHECKS_STORAGE_KEY,
  WEEK_CHECKPOINTS_STORAGE_KEY,
} from '@/lib/study-plan'
import { cn } from '@/lib/utils'
import {
  CUSTOM_FLASHCARD_SAVE_RESULT,
  addCustomFlashcard,
  saveUniqueCustomFlashcard,
} from '@/lib/custom-flashcards'
import {
  buildStudyErrorFlashcard,
  createStudyErrorRecord,
  getStudyErrors,
  STUDY_ERROR_CATEGORY,
  STUDY_ERROR_CATEGORY_LABEL,
  STUDY_ERROR_STORAGE_KEY,
  STUDY_ERROR_TRACK,
  STUDY_ERROR_TRACK_LABEL,
  type StudyErrorCategory,
  type StudyErrorRecord,
} from '@/lib/study-errors'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { useSupportMode } from '@/lib/contexts/SupportModeContext'

function getResourceEmbedUrl(url: string, channel: string): string | null {
  if (channel === 'TED' && url.includes('ted.com/talks/')) {
    const slug = url.split('ted.com/talks/')[1]?.split('?')[0]
    return slug ? `https://embed.ted.com/talks/${slug}` : null
  }
  if (url.includes('youtube.com/watch')) {
    const queryString = url.split('?')[1]
    const videoId = queryString ? new URLSearchParams(queryString).get('v') : null
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }
  return null
}

const STUDY_SUPPORT_VIEW = {
  ORIGINAL: 'original',
  SIMPLE: 'simple',
  GRAMMAR: 'grammar',
} as const

type StudySupportView = (typeof STUDY_SUPPORT_VIEW)[keyof typeof STUDY_SUPPORT_VIEW]

function ResourceCard({
  resource,
  reference,
}: {
  resource: StudyResource
  reference: { whyToday: string } | undefined
}) {
  const embedUrl = getResourceEmbedUrl(resource.url, resource.channel)
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Headphones size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-400">{resource.channel} · Listening resource</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{resource.title}</h3>
            {reference && <p className="mt-1 text-sm text-gray-400">{reference.whyToday}</p>}
            <p className="mt-1 text-sm text-gray-500">{resource.studyObjective}</p>
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 transition-colors hover:bg-amber-500/20"
        >
          <ExternalLink size={14} />
          Open resource
        </a>
      </div>

      {embedUrl && (
        <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl border border-[#242424]">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allowFullScreen
            title={resource.title}
          />
        </div>
      )}

      {resource.keyPhrases.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Key phrases to listen for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {resource.keyPhrases.map((phrase) => (
              <span key={phrase} className="rounded-full border border-[#2a2a2a] bg-[#151515] px-3 py-1 text-xs text-gray-300">
                &ldquo;{phrase}&rdquo;
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StudyDayClassPage() {
  const params = useParams<{ phaseSlug: string; weekId: string; daySlug: string }>()
  const phase = getPhaseBySlug(params.phaseSlug)
  const week = ALL_STUDY_WEEKS.find((item) => item.id === params.weekId && item.phaseSlug === params.phaseSlug)

  const [completedLessons] = usePersistentStorage<string[]>(LESSON_CHECKS_STORAGE_KEY, [])
  const [completedCheckpoints] = usePersistentStorage<string[]>(WEEK_CHECKPOINTS_STORAGE_KEY, [])
  const [completedDayChecks, setCompletedDayChecks] = usePersistentStorage<string[]>(DAY_CHECKS_STORAGE_KEY, [])
  const [writtenWork, setWrittenWork] = usePersistentStorage<Record<string, string>>(DAY_WRITING_STORAGE_KEY, {})
  const [aiFeedback, setAiFeedback] = usePersistentStorage<Record<string, string>>(DAY_AI_FEEDBACK_STORAGE_KEY, {})
  const [studyErrors, setStudyErrors] = usePersistentStorage<StudyErrorRecord[]>(STUDY_ERROR_STORAGE_KEY, getStudyErrors())
  const [coldAttemptTexts, setColdAttemptTexts] = usePersistentStorage<Record<string, string>>('day_cold_attempt_v1', {})
  const [coldAttemptDone, setColdAttemptDone] = usePersistentStorage<string[]>('day_cold_attempt_done_v1', [])
  const [sectionCompletions, setSectionCompletions] = usePersistentStorage<Record<string, boolean>>('day_section_completions_v1', {})
  const guidedModelSentinelRef = useRef<HTMLDivElement | null>(null)
  const [addedGlossaryIds, setAddedGlossaryIds] = useState<string[]>([])
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [errorFlashcardStatus, setErrorFlashcardStatus] = useState<Record<string, string>>({})
  const { supportModeEnabled, setSupportModeEnabled } = useSupportMode()
  const [sectionSupportView, setSectionSupportView] = useState<Record<string, StudySupportView>>({})
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [checkedQuizItems, setCheckedQuizItems] = useState<string[]>([])
  const [expandedVocabItems, setExpandedVocabItems] = useState<string[]>([])
  const { speak, isSupported: ttsSupported } = useSpeech()

  const phaseUnlocked = phase ? isPhaseUnlocked(phase.id - 1, completedLessons, completedCheckpoints, completedDayChecks) : false
  const weekUnlocked = week
    ? isWeekUnlocked(
        ALL_STUDY_WEEKS.findIndex((item) => item.id === week.id),
        completedLessons,
        completedCheckpoints,
        completedDayChecks
      )
    : false

  const dayClasses = useMemo(() => (week ? buildWeekDayClasses(week) : []), [week])
  const currentDayIndex = dayClasses.findIndex((dayClass) => dayClass.slug === params.daySlug)
  const currentDay = currentDayIndex >= 0 ? dayClasses[currentDayIndex] : null
  const dayUnlocked = week && currentDay ? isDayUnlocked(week, currentDayIndex, completedDayChecks) : false
  const prevDay = currentDayIndex > 0 ? dayClasses[currentDayIndex - 1] : null
  const nextDay = currentDayIndex >= 0 ? dayClasses[currentDayIndex + 1] : null
  const currentDayErrors = useMemo(
    () => studyErrors.filter((error) => error.dayId === (currentDay?.id ?? '')),
    [studyErrors, currentDay?.id]
  )

  useEffect(() => {
    if (!currentDay) return
    if (supportModeEnabled) {
      const views: Record<string, StudySupportView> = {}
      currentDay.sections.forEach((section) => {
        views[section.id] = STUDY_SUPPORT_VIEW.SIMPLE
      })
      setSectionSupportView(views)
    } else {
      setSectionSupportView({})
    }
  }, [supportModeEnabled, currentDay])

  useEffect(() => {
    if (!currentDay) return
    const coldAttemptComplete =
      coldAttemptDone.includes(currentDay.id) || !!coldAttemptTexts[currentDay.id]
    if (!coldAttemptComplete) return
    const el = guidedModelSentinelRef.current
    if (!el) return
    const guidedSection = currentDay.sections.find((s) => s.title.startsWith('Guided model'))
    if (!guidedSection) return
    const key = `${currentDay.id}:${guidedSection.id}`
    if (sectionCompletions[key]) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSectionCompletions((prev) => ({ ...prev, [key]: true }))
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, coldAttemptDone, coldAttemptTexts, sectionCompletions])

  if (!phase || !week || !currentDay) {
    return (
      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 text-sm text-gray-300">
        Day class not found.
      </div>
    )
  }

  if (!phaseUnlocked || !weekUnlocked) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href={`/study-plan/${phase.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          Back to phase
        </Link>
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h2 className="text-xl font-semibold text-white">{phase.title}</h2>
          <p className="mt-2 text-sm text-gray-400">
            This class is still locked because the phase or the week is not available yet.
          </p>
        </div>
      </div>
    )
  }

  if (!dayUnlocked) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href={`/study-plan/${phase.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          Back to phase
        </Link>
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h2 className="text-xl font-semibold text-white">{currentDay.title}</h2>
          <p className="mt-2 text-sm text-gray-400">
            Complete the previous day first so the class sequence stays guided and cumulative.
          </p>
        </div>
      </div>
    )
  }

  const isDone = completedDayChecks.includes(currentDay.id)
  const isColdAttemptComplete = coldAttemptDone.includes(currentDay.id) || !!coldAttemptTexts[currentDay.id]

  const MIN_WRITTEN_ACTIVITY_CHARS = 30
  const TRACKED_WRITTEN_ACTIVITY_COUNT = 2
  const TOTAL_TRACKED_SECTIONS = 5

  const getSectionKey = (sectionId: string) => `${currentDay.id}:${sectionId}`
  const isSectionComplete = (sectionId: string) => !!sectionCompletions[getSectionKey(sectionId)]
  const markSectionComplete = (sectionId: string) =>
    setSectionCompletions((prev) => ({ ...prev, [getSectionKey(sectionId)]: true }))

  const grammarLessonSection = currentDay.sections.find((s) => s.title.startsWith('Grammar lesson'))
  const guidedModelSection = currentDay.sections.find((s) => s.title.startsWith('Guided model'))
  const writtenActivity1 = currentDay.writtenActivities[0] ?? null
  const writtenActivity2 = currentDay.writtenActivities[1] ?? null
  const isWritten1Complete = writtenActivity1 ? (writtenWork[writtenActivity1.id] ?? '').length >= MIN_WRITTEN_ACTIVITY_CHARS : false
  const isWritten2Complete = writtenActivity2 ? (writtenWork[writtenActivity2.id] ?? '').length >= MIN_WRITTEN_ACTIVITY_CHARS : false

  const completedSectionCount = [
    isColdAttemptComplete,
    grammarLessonSection ? isSectionComplete(grammarLessonSection.id) : false,
    guidedModelSection ? isSectionComplete(guidedModelSection.id) : false,
    isWritten1Complete,
    isWritten2Complete,
  ].filter(Boolean).length
  const progressPercent = Math.round((completedSectionCount / TOTAL_TRACKED_SECTIONS) * 100)

  const updateWriting = (activityId: string, value: string) => {
    const updated = { ...writtenWork, [activityId]: value }
    setWrittenWork(updated)
  }

  const updateAiFeedback = (fieldId: string, value: string) => {
    const updated = { ...aiFeedback, [fieldId]: value }
    setAiFeedback(updated)
  }

  const toggleDayDone = () => {
    const updated = isDone
      ? completedDayChecks.filter((id) => id !== currentDay.id)
      : [...completedDayChecks, currentDay.id]

    setCompletedDayChecks(updated)
  }

  const handleAddGlossaryCard = (termId: string, term: string, back: string) => {
    const added = addCustomFlashcard({
      id: `glossary-${termId}`,
      front: term,
      back,
      category: 'Class glossary',
    })

    if (added) {
      setAddedGlossaryIds((current) => [...current, termId])
    }
  }

  const persistStudyErrors = (updated: StudyErrorRecord[]) => {
    setStudyErrors(updated)
  }

  const handleAddStudyError = (track: typeof STUDY_ERROR_TRACK.WRITING | typeof STUDY_ERROR_TRACK.SPEAKING) => {
    if (!currentDay) return

    const updated = studyErrors.concat(
      createStudyErrorRecord({
        dayId: currentDay.id,
        dayTitle: currentDay.title,
        phaseSlug: phase.slug,
        weekId: week.id,
        track,
      })
    )

    persistStudyErrors(updated)
  }

  const updateStudyError = <K extends keyof StudyErrorRecord>(errorId: string, field: K, value: StudyErrorRecord[K]) => {
    const updated = studyErrors.map((error) =>
      error.id === errorId
        ? {
            ...error,
            [field]: value,
            updatedAt: new Date().toISOString(),
          }
        : error
    )

    persistStudyErrors(updated)
  }

  const handleRemoveStudyError = (errorId: string) => {
    persistStudyErrors(studyErrors.filter((error) => error.id !== errorId))
  }

  const handleAddStudyErrorFlashcard = (error: StudyErrorRecord) => {
    if (!error.original.trim() || !error.corrected.trim()) {
      return
    }

    const result = saveUniqueCustomFlashcard(buildStudyErrorFlashcard(error))

    setErrorFlashcardStatus((current) => ({
      ...current,
      [error.id]: result,
    }))

    if (!error.flashcardAdded) {
      updateStudyError(error.id, 'flashcardAdded', true)
    }
  }

  const handleCopyPrompt = (promptId: string, prompt: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyError('Clipboard is not available in this browser. Copy the prompt manually from the box.')
      setCopiedPromptId(null)
      return
    }

    void navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopiedPromptId(promptId)
        setCopyError(null)
      })
      .catch((error: unknown) => {
        setCopiedPromptId(null)
        setCopyError(
          error instanceof Error
            ? `Clipboard failed: ${error.message}`
            : 'Clipboard failed. Copy the prompt manually from the box.'
        )
      })
  }

  const errorCategoryOptions = Object.values(STUDY_ERROR_CATEGORY)
  const guidedSectionId = activeSectionId ?? currentDay.sections[0]?.id ?? null
  const guidedSectionIndex = currentDay.sections.findIndex((section) => section.id === guidedSectionId)

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/study-plan/${phase.slug}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          Back to {phase.title}
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111111] px-3 py-1 text-xs text-gray-300">
          Week {week.week} · Day {currentDay.day}
        </div>
      </div>

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-400">{phase.title}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{currentDay.title}</h2>
            <p className="mt-2 text-sm text-gray-400">{currentDay.objective}</p>
            <p className="mt-2 text-sm text-gray-500">Focus: {currentDay.focus}</p>
          </div>
          <div className="rounded-xl border border-[#242424] bg-[#151515] px-4 py-3 text-sm text-gray-300">
            Suggested class time: {currentDay.minutes}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-300">{completedSectionCount} of 5 sections completed</p>
          <p className="text-sm font-medium text-teal-400">{progressPercent}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#242424]">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PenLine size={18} className="text-orange-300" />
            <h3 className="text-lg font-semibold text-white">Cold attempt — before you read anything</h3>
          </div>
          {isColdAttemptComplete
            ? <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
            : <Circle size={16} className="shrink-0 text-gray-600" />
          }
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Before reading anything — write or say how you would introduce yourself as a developer right now. No help yet.
        </p>
        <textarea
          value={coldAttemptTexts[currentDay.id] ?? ''}
          onChange={(event) => setColdAttemptTexts((current) => ({ ...current, [currentDay.id]: event.target.value }))}
          placeholder="Write your attempt here..."
          rows={6}
          className="mt-4 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-orange-500/40 focus:outline-none"
        />
        {isColdAttemptComplete ? (
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
            <Save size={14} />
            Attempt saved — lesson content is unlocked below
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => setColdAttemptDone((current) => [...current, currentDay.id])}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm text-orange-100 transition-colors hover:bg-orange-400/20"
            >
              <CheckCircle2 size={16} />
              I wrote my attempt
            </button>
            <button
              type="button"
              onClick={() => setColdAttemptDone((current) => [...current, currentDay.id])}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline-offset-2 hover:underline"
            >
              Skip cold attempt
            </button>
          </div>
        )}
      </div>

      {isColdAttemptComplete && (
        <>
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Languages size={18} className="text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">Support mode for low grammar / vocabulary</h3>
            </div>
            <p className="mt-2 text-sm text-cyan-100">{currentDay.supportModeIntro}</p>
          </div>
          <button
            type="button"
            onClick={() => setSupportModeEnabled((current) => !current)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
              supportModeEnabled
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                : 'border-[#2a2a2a] bg-[#111111] text-white hover:border-[#3a3a3a]'
            )}
          >
            <Sparkles size={16} />
            {supportModeEnabled ? 'Support mode enabled' : 'Enable support mode'}
          </button>
        </div>

        {supportModeEnabled && (
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300">Prerequisite vocabulary</p>
              <div className="mt-3 space-y-3">
                {currentDay.prerequisites.vocabulary.map((item) => (
                  <div key={item.term} className="rounded-lg border border-[#2a2a2a] bg-[#151515] p-3">
                    <p className="font-medium text-white">{item.term}</p>
                    <p className="mt-1 text-sm text-gray-300">{item.meaning}</p>
                    <p className="mt-2 text-xs text-gray-500">{item.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300">Grammar before you start</p>
              <div className="mt-3 space-y-3">
                {currentDay.prerequisites.grammar.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#2a2a2a] bg-[#151515] p-3">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-cyan-100">{item.pattern}</p>
                    <p className="mt-2 text-sm text-gray-300">{item.whenToUse}</p>
                    <p className="mt-2 text-xs text-gray-500">Example: {item.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#111111] p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-300">Warm-up sequence</p>
              <div className="mt-3 space-y-3">
                {currentDay.prerequisites.warmUp.map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-gray-300">
                    <span className="mt-1 text-cyan-300">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#151515] p-3 text-sm text-gray-300">
                If the class still feels hard, stay with one sentence first. You do not need to finish a big paragraph to make real progress.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-red-400" />
            <h3 className="text-lg font-semibold text-white">Recommended YouTube practice</h3>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            {currentDay.youtubeVideo.whyThisVideo}
          </p>
          <div className="mt-4 rounded-xl border border-[#242424] bg-[#151515] p-4">
            <p className="text-xs uppercase tracking-wide text-red-400">{currentDay.youtubeVideo.channel}</p>
            <h4 className="mt-1 font-medium text-white">{currentDay.youtubeVideo.title}</h4>
            <a
              href={currentDay.youtubeVideo.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-white hover:border-[#3a3a3a]"
            >
              Open YouTube recommendation
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h3 className="text-lg font-semibold text-white">Class glossary</h3>
          <p className="mt-2 text-sm text-gray-400">
            If something is unclear, hover a term to open a deeper teaching card: meaning, class use, contrast, and mini practice. You can also send it directly to Flashcards.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {currentDay.glossary.map((item) => {
              const alreadyAdded = addedGlossaryIds.includes(item.id)

              return (
                <div key={item.id} className="group relative">
                  <div
                    tabIndex={0}
                    className="rounded-full border border-[#2a2a2a] bg-[#151515] px-3 py-2 text-sm text-white outline-none transition-colors group-hover:border-green-500/40 group-focus-within:border-green-500/40"
                  >
                    {item.term}
                  </div>
                  <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-[28rem] rounded-xl border border-[#2a2a2a] bg-[#101010] p-4 text-sm text-gray-300 shadow-2xl group-hover:block group-focus-within:block">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white flex-1">{item.term}</p>
                      {ttsSupported && (
                        <button type="button" onClick={() => speak(item.term)} className="pointer-events-auto w-7 h-7 flex items-center justify-center rounded-full border border-[#333] text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-colors" title="Hear pronunciation">
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Plain meaning</p>
                        <p className="mt-1">{item.definition}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">In this class</p>
                        <p className="mt-1">{item.classMeaning}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Use it when</p>
                        <p className="mt-1">{item.useItWhen}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Do not confuse it with</p>
                        <p className="mt-1">{item.contrast}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Example</p>
                        <p className="mt-1 text-gray-400">{item.example}</p>
                      </div>
                      <div className="rounded-lg border border-[#2a2a2a] bg-[#151515] p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Mini practice</p>
                        <p className="mt-1">{item.miniPractice}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddGlossaryCard(item.id, item.term, item.flashcardBack)}
                      className={cn(
                        'pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                        alreadyAdded
                          ? 'border-green-500/30 bg-green-500/10 text-green-300'
                          : 'border-[#2a2a2a] bg-[#151515] text-white hover:border-[#3a3a3a]'
                      )}
                    >
                      {alreadyAdded ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                      {alreadyAdded ? 'Sent to Flashcards' : 'Send to Flashcards'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {week.resources[0] && (
        <ResourceCard resource={week.resources[0]} reference={currentDay.references[0]} />
      )}

      <div className="space-y-4">
        {supportModeEnabled && currentDay.sections.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
            <div className="text-sm text-gray-300">
              Guided reading section {guidedSectionIndex + 1 > 0 ? guidedSectionIndex + 1 : 1} of {currentDay.sections.length}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={guidedSectionIndex <= 0}
                onClick={() => setActiveSectionId(currentDay.sections[Math.max(0, guidedSectionIndex - 1)]?.id ?? guidedSectionId)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:text-gray-600"
              >
                <ArrowLeft size={16} />
                Previous section
              </button>
              <button
                type="button"
                disabled={guidedSectionIndex < 0 || guidedSectionIndex >= currentDay.sections.length - 1}
                onClick={() => setActiveSectionId(currentDay.sections[Math.min(currentDay.sections.length - 1, guidedSectionIndex + 1)]?.id ?? guidedSectionId)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:text-gray-600"
              >
                Next section
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
        {currentDay.sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              'rounded-xl border bg-[#111111] p-6',
              supportModeEnabled && section.id === guidedSectionId ? 'border-cyan-500/30' : 'border-[#1f1f1f]'
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {(section.id === grammarLessonSection?.id || section.id === guidedModelSection?.id) && (
                  isSectionComplete(section.id)
                    ? <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
                    : <Circle size={16} className="shrink-0 text-gray-600" />
                )}
                {supportModeEnabled && (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: STUDY_SUPPORT_VIEW.ORIGINAL, label: 'Original' },
                      { id: STUDY_SUPPORT_VIEW.SIMPLE, label: 'Simple English' },
                      { id: STUDY_SUPPORT_VIEW.GRAMMAR, label: 'Grammar coach' },
                  ].map((viewOption) => (
                    <button
                      key={viewOption.id}
                      type="button"
                      onClick={() =>
                        setSectionSupportView((current) => ({
                          ...current,
                          [section.id]: viewOption.id,
                        }))
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition-colors',
                        (sectionSupportView[section.id] ?? STUDY_SUPPORT_VIEW.ORIGINAL) === viewOption.id
                          ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                          : 'border-[#2a2a2a] bg-[#151515] text-gray-300 hover:border-[#3a3a3a]'
                      )}
                    >
                      {viewOption.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

            {(sectionSupportView[section.id] ?? STUDY_SUPPORT_VIEW.ORIGINAL) === STUDY_SUPPORT_VIEW.SIMPLE ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-cyan-300">Simple explanation</p>
                  <div className="mt-3 space-y-2">
                    {section.support.simpleExplanation.map((item) => (
                      <p key={item} className="text-sm text-gray-200">{item}</p>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-cyan-100">{section.support.spanishHint}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Key words for this section</p>
                    <div className="mt-3 space-y-3">
                      {section.support.keyVocabulary.map((item) => (
                        <div key={item.term}>
                          <p className="font-medium text-white">{item.term}</p>
                          <p className="mt-1 text-sm text-gray-300">{item.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Check yourself</p>
                    <p className="mt-3 text-sm text-gray-200">{section.support.checkQuestion}</p>
                  </div>
                </div>
              </div>
            ) : (sectionSupportView[section.id] ?? STUDY_SUPPORT_VIEW.ORIGINAL) === STUDY_SUPPORT_VIEW.GRAMMAR ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {section.support.grammarCoach.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-cyan-100">{item.pattern}</p>
                    <p className="mt-3 text-sm text-gray-300">{item.whenToUse}</p>
                    <p className="mt-2 text-sm text-gray-400">Example: {item.example}</p>
                    <p className="mt-2 text-xs text-gray-500">Common error: {item.commonError}</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {section.title.startsWith('Listening classroom') && week.resources[0] && (
                  <a
                    href={week.resources[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 transition-colors hover:bg-amber-500/10"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Headphones size={15} className="shrink-0 text-amber-300" />
                      <span>
                        <span className="text-xs uppercase tracking-wide text-amber-400">{week.resources[0].channel} · </span>
                        <span className="text-amber-100">{week.resources[0].title}</span>
                      </span>
                    </div>
                    <ExternalLink size={13} className="shrink-0 text-amber-400" />
                  </a>
                )}
                <div className="mt-4 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <div key={paragraph} className="flex items-start gap-2 group">
                      <p className="text-sm leading-7 text-gray-300 flex-1">{paragraph}</p>
                      {ttsSupported && (
                        <button onClick={() => speak(paragraph)} className="opacity-0 group-hover:opacity-100 shrink-0 mt-1 w-6 h-6 flex items-center justify-center rounded-full border border-[#2a2a2a] text-gray-500 hover:text-green-400 hover:border-green-500/40 transition-all" title="Read aloud">
                          <Volume2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {section.bullets && section.bullets.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {section.bullets.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-gray-300 group">
                        <span className="mt-1 text-green-400 shrink-0">•</span>
                        <span className="flex-1">{item}</span>
                        {ttsSupported && (
                          <button onClick={() => speak(item)} className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-full border border-[#2a2a2a] text-gray-500 hover:text-green-400 hover:border-green-500/40 transition-all" title="Read aloud">
                            <Volume2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {section.id === grammarLessonSection?.id && !isSectionComplete(section.id) && (
              <div className="mt-4 flex flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={() => markSectionComplete(section.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm text-teal-100 transition-colors hover:bg-teal-400/20"
                >
                  <CheckCircle2 size={16} />
                  Mark grammar section complete
                </button>
                <button
                  type="button"
                  onClick={() => markSectionComplete(section.id)}
                  className="text-xs text-gray-500 transition-colors underline-offset-2 hover:text-gray-300 hover:underline"
                >
                  Skip
                </button>
              </div>
            )}

            {section.id === guidedModelSection?.id && (
              <div ref={guidedModelSentinelRef} className="h-px" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <h3 className="text-lg font-semibold text-white">Written work inside the class</h3>
        <p className="mt-2 text-sm text-gray-400">
          These activities are dynamic: write directly here and your answers stay saved inside the app.
        </p>
        <div className="mt-4 space-y-5">
          {currentDay.writtenActivities.map((activity, activityIndex) => (
            <div key={activity.id} className="rounded-xl border border-[#242424] bg-[#151515] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-medium text-white">{activity.title}</h4>
                {activityIndex < TRACKED_WRITTEN_ACTIVITY_COUNT && (
                  (activityIndex === 0 ? isWritten1Complete : isWritten2Complete)
                    ? <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
                    : <Circle size={16} className="shrink-0 text-gray-600" />
                )}
              </div>
              <p className="mt-2 text-sm text-gray-400">{activity.instructions}</p>
              {supportModeEnabled && (
                <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-cyan-300">Scaffolded steps</p>
                    <div className="mt-3 space-y-2">
                      {activity.support.steps.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-200">
                          <span className="mt-1 text-cyan-300">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#242424] bg-[#101010] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Sentence starters</p>
                    <div className="mt-3 space-y-2">
                      {activity.support.sentenceStarters.map((item) => (
                        <p key={item} className="text-sm text-gray-300">{item}</p>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-cyan-100">{activity.support.canDoCheck}</p>
                  </div>
                </div>
              )}
              <textarea
                value={writtenWork[activity.id] ?? ''}
                onChange={(event) => updateWriting(activity.id, event.target.value)}
                placeholder={activity.placeholder}
                rows={8}
                className="mt-4 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
              />
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
                <Save size={14} />
                Saved automatically in this browser
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentDay.day === 3 && week.resources[0]?.quiz && (
        <div className="rounded-xl border border-amber-500/20 bg-[#111111] p-6">
          <div className="flex items-center gap-2">
            <Headphones size={18} className="text-amber-300" />
            <h3 className="text-lg font-semibold text-white">Resource comprehension quiz</h3>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Complete these exercises after working through the resource. They turn passive consumption into active learning.
          </p>

          <div className="mt-6 space-y-6">
            {week.resources[0].quiz.comprehension.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-400">Comprehension checks</p>
                <p className="mt-1 text-xs text-gray-500">Check each question only after you can answer it without looking at the resource.</p>
                <div className="mt-3 space-y-3">
                  {week.resources[0].quiz.comprehension.map((question, index) => {
                    const itemId = `quiz-comprehension-${week.resources[0].id}-${index}`
                    const isChecked = checkedQuizItems.includes(itemId)
                    return (
                      <button
                        key={itemId}
                        type="button"
                        onClick={() =>
                          setCheckedQuizItems((current) =>
                            isChecked ? current.filter((id) => id !== itemId) : [...current, itemId]
                          )
                        }
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-colors',
                          isChecked
                            ? 'border-green-500/30 bg-green-500/5 text-green-200'
                            : 'border-[#242424] bg-[#151515] text-gray-300 hover:border-[#3a3a3a]'
                        )}
                      >
                        {isChecked ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-400" /> : <Circle size={16} className="mt-0.5 shrink-0 text-gray-600" />}
                        {question}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {week.resources[0].quiz.speaking.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-400">Speaking prompts</p>
                <p className="mt-1 text-xs text-gray-500">Answer each prompt aloud for 30–60 seconds. Use the speaker button to hear the question first.</p>
                <div className="mt-3 space-y-3">
                  {week.resources[0].quiz.speaking.map((prompt, index) => (
                    <div key={`quiz-speaking-${index}`} className="flex items-start gap-3 rounded-xl border border-[#242424] bg-[#151515] p-4">
                      <MessageSquare size={15} className="mt-0.5 shrink-0 text-amber-400" />
                      <p className="flex-1 text-sm text-gray-300">{prompt}</p>
                      {ttsSupported && (
                        <button
                          type="button"
                          onClick={() => speak(prompt)}
                          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2a2a] text-gray-400 transition-colors hover:border-amber-500/40 hover:text-amber-400"
                          title="Hear prompt"
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {week.resources[0].quiz.vocabulary.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-400">Vocabulary in context</p>
                <p className="mt-1 text-xs text-gray-500">Expand each phrase to see a practice challenge. Say the answer aloud before revealing it.</p>
                <div className="mt-3 space-y-2">
                  {week.resources[0].quiz.vocabulary.map((item, index) => {
                    const itemId = `quiz-vocab-${week.resources[0].id}-${index}`
                    const isExpanded = expandedVocabItems.includes(itemId)
                    return (
                      <div key={itemId} className="rounded-xl border border-[#242424] bg-[#151515] overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedVocabItems((current) =>
                              isExpanded ? current.filter((id) => id !== itemId) : [...current, itemId]
                            )
                          }
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-white hover:bg-[#1a1a1a] transition-colors"
                        >
                          <span className="font-medium">&ldquo;{item.phrase}&rdquo;</span>
                          <span className="shrink-0 text-xs text-gray-500">{isExpanded ? '▲ hide' : '▼ practice'}</span>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[#242424] px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Practice challenge</p>
                            <p className="mt-1 text-sm text-gray-300">{item.practice}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Validate this class with free AI</h3>
        </div>
        <p className="mt-3 text-sm text-gray-400">{currentDay.aiValidation.intro}</p>
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-100">
          {currentDay.aiValidation.honestyNote}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {[currentDay.aiValidation.writing, currentDay.aiValidation.speaking].map((track) => {
            const TrackIcon = track.mode === 'writing' ? FileText : Mic

            return (
              <div key={track.mode} className="rounded-xl border border-[#242424] bg-[#151515] p-5">
                <div className="flex items-center gap-2">
                  <TrackIcon size={18} className="text-green-400" />
                  <h4 className="font-semibold text-white">{track.title}</h4>
                </div>
                <p className="mt-2 text-sm text-gray-400">{track.objective}</p>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Recommended free tools</p>
                  <div className="mt-3 space-y-3">
                    {track.toolRecommendations.map((tool) => (
                      <div key={tool.id} className="rounded-xl border border-[#2a2a2a] bg-[#101010] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{tool.name}</p>
                            <p className="mt-1 text-sm text-gray-400">{tool.bestFor}</p>
                          </div>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-3 py-2 text-sm text-white hover:border-[#3a3a3a]"
                          >
                            Open
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">{tool.whyItHelps}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Suggested workflow</p>
                  <div className="mt-3 space-y-2">
                    {track.workflow.map((step) => (
                      <div key={step} className="flex gap-2 text-sm text-gray-300">
                        <span className="mt-1 text-green-400">•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">What the AI should evaluate</p>
                  <div className="mt-3 space-y-2">
                    {track.rubric.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-gray-300">
                        <Target size={15} className="mt-0.5 shrink-0 text-green-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#2a2a2a] bg-[#101010] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{track.prompt.label}</p>
                      <p className="mt-1 text-sm text-gray-400">{track.prompt.intro}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(track.prompt.id, track.prompt.template)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                        copiedPromptId === track.prompt.id
                          ? 'border-green-500/30 bg-green-500/10 text-green-300'
                          : 'border-[#2a2a2a] bg-[#151515] text-white hover:border-[#3a3a3a]'
                      )}
                    >
                      {copiedPromptId === track.prompt.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copiedPromptId === track.prompt.id ? 'Prompt copied' : 'Copy prompt'}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {track.prompt.instructions.map((instruction) => (
                      <div key={instruction} className="flex gap-2 text-sm text-gray-400">
                        <span className="mt-1 text-cyan-400">•</span>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                  {copyError && (
                    <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                      {copyError}
                    </div>
                  )}
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4 text-xs leading-6 text-gray-300">
                    {track.prompt.template}
                  </pre>
                </div>

                <div className="mt-5 space-y-4">
                  {track.savedFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-white" htmlFor={field.id}>
                        {field.label}
                      </label>
                      <p className="mt-1 text-xs text-gray-500">{field.helper}</p>
                      <textarea
                        id={field.id}
                        value={aiFeedback[field.id] ?? ''}
                        onChange={(event) => updateAiFeedback(field.id, event.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
                  <Save size={14} />
                  Validation notes are saved automatically in this browser
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Error extraction lab</h3>
            <p className="mt-2 text-sm text-gray-400">
              Convert the most important feedback into structured mistakes: what you said, what is better, why it matters, and what to practice next.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleAddStudyError(STUDY_ERROR_TRACK.WRITING)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
            >
              <Plus size={16} />
              Add writing mistake
            </button>
            <button
              type="button"
              onClick={() => handleAddStudyError(STUDY_ERROR_TRACK.SPEAKING)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
            >
              <Plus size={16} />
              Add speaking mistake
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#242424] bg-[#151515] p-4 text-sm text-gray-300">
          Best workflow: save your AI feedback above, then extract only the mistakes that repeat or that clearly block your communication. Those are the ones worth practicing with flashcards and revision.
        </div>

        {currentDayErrors.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-[#2a2a2a] bg-[#151515] p-6 text-sm text-gray-500">
            No extracted mistakes yet for this class. Add at least one mistake from writing or speaking feedback so the academy can start building your personal weak-point history.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {currentDayErrors.map((error) => {
              const flashcardStatus = errorFlashcardStatus[error.id]
              const flashcardLinked = error.flashcardAdded || flashcardStatus === CUSTOM_FLASHCARD_SAVE_RESULT.EXISTS

              return (
                <div key={error.id} className="rounded-xl border border-[#242424] bg-[#151515] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#101010] px-3 py-1 text-xs text-gray-300">
                      <span>{STUDY_ERROR_TRACK_LABEL[error.track]}</span>
                      <span className="text-gray-600">·</span>
                      <span>{STUDY_ERROR_CATEGORY_LABEL[error.category]}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudyError(error.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-gray-300 hover:border-[#3a3a3a] hover:text-white"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>

                  {flashcardLinked ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                        <p className="text-sm font-medium text-green-300">Saved to Flashcards</p>
                        <p className="mt-2 text-sm text-gray-300">
                          This correction was saved in <span className="text-white">Flashcards → Personal corrections</span>.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Original</p>
                            <p className="mt-2 text-sm text-white">{error.original}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Better version</p>
                            <p className="mt-2 text-sm text-green-300">{error.corrected}</p>
                          </div>
                        </div>
                        {(error.explanation || error.nextAction) && (
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            {error.explanation && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Why it matters</p>
                                <p className="mt-2 text-sm text-gray-300">{error.explanation}</p>
                              </div>
                            )}
                            {error.nextAction && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Next repetition target</p>
                                <p className="mt-2 text-sm text-gray-300">{error.nextAction}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href="/flashcards"
                            className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
                          >
                            Open Flashcards
                            <ArrowRight size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => updateStudyError(error.id, 'flashcardAdded', false)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-4 py-2 text-sm text-gray-300 hover:border-[#3a3a3a] hover:text-white"
                          >
                            Edit saved note
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                        <div>
                          <label className="block text-sm font-medium text-white" htmlFor={`${error.id}-category`}>
                            Weak point type
                          </label>
                          <select
                            id={`${error.id}-category`}
                            value={error.category}
                            onChange={(event) =>
                              updateStudyError(error.id, 'category', event.target.value as StudyErrorCategory)
                            }
                            className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 focus:border-green-500/40 focus:outline-none"
                          >
                            {errorCategoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {STUDY_ERROR_CATEGORY_LABEL[category]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-white" htmlFor={`${error.id}-original`}>
                              Original sentence or idea
                            </label>
                            <textarea
                              id={`${error.id}-original`}
                              value={error.original}
                              onChange={(event) => updateStudyError(error.id, 'original', event.target.value)}
                              placeholder="Example: I have 5 years working in backend..."
                              rows={4}
                              className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white" htmlFor={`${error.id}-corrected`}>
                              Better version
                            </label>
                            <textarea
                              id={`${error.id}-corrected`}
                              value={error.corrected}
                              onChange={(event) => updateStudyError(error.id, 'corrected', event.target.value)}
                              placeholder="Example: I have been working in backend for 5 years..."
                              rows={4}
                              className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-white" htmlFor={`${error.id}-explanation`}>
                            Why this matters
                          </label>
                          <textarea
                            id={`${error.id}-explanation`}
                            value={error.explanation}
                            onChange={(event) => updateStudyError(error.id, 'explanation', event.target.value)}
                            placeholder="Explain the pattern: grammar, clarity, or why the original sounded unnatural..."
                            rows={4}
                            className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white" htmlFor={`${error.id}-next-action`}>
                            Next repetition target
                          </label>
                          <textarea
                            id={`${error.id}-next-action`}
                            value={error.nextAction}
                            onChange={(event) => updateStudyError(error.id, 'nextAction', event.target.value)}
                            placeholder="Example: repeat this structure aloud 5 times in project-based examples..."
                            rows={4}
                            className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                          <Save size={14} />
                          Error note saved automatically in this browser
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStudyErrorFlashcard(error)}
                          disabled={!error.original.trim() || !error.corrected.trim()}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                            'border-[#2a2a2a] bg-[#101010] text-white hover:border-[#3a3a3a] disabled:cursor-not-allowed disabled:text-gray-600'
                          )}
                        >
                          <Plus size={16} />
                          Send mistake to Flashcards
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h3 className="text-lg font-semibold text-white">Daily checks before you mark this class done</h3>
          <div className="mt-4 space-y-3">
            {currentDay.checks.map((check) => (
              <div key={check} className="flex gap-3 rounded-xl border border-[#242424] bg-[#151515] p-4 text-sm text-gray-300">
                <Target size={16} className="mt-0.5 shrink-0 text-green-400" />
                <span>{check}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleDayDone}
            className={cn(
              'mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
              isDone
                ? 'border-green-500/30 bg-green-500/10 text-green-300'
                : 'border-[#2a2a2a] bg-[#151515] text-gray-200 hover:border-[#3a3a3a]'
            )}
          >
            {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {isDone ? 'Day marked as complete' : 'Mark day as complete'}
          </button>
        </div>

        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h3 className="text-lg font-semibold text-white">Referenced material for this class</h3>
          <div className="mt-4 space-y-4">
            {currentDay.references.map((reference) => (
              <div key={reference.id} className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                <p className="text-xs uppercase tracking-wide text-blue-400">{reference.channel}</p>
                <h4 className="mt-1 font-medium text-white">{reference.title}</h4>
                <p className="mt-2 text-sm text-gray-400">{reference.whyToday}</p>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-white hover:border-[#3a3a3a]"
                >
                  Open reference
                </a>
              </div>
            ))}

            <div className="rounded-xl border border-[#242424] bg-[#151515] p-4 text-sm text-gray-300">
              After this class, return to the week page to mark lesson evidence and weekly checkpoints when you can perform them honestly.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
        <div className="text-sm text-gray-400">
          {prevDay ? `Previous: ${prevDay.title}` : 'This is the first class of the week.'}
        </div>
        <div className="flex flex-wrap gap-3">
          {prevDay && (
            <Link
              href={`/study-plan/${phase.slug}/${week.id}/${prevDay.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
            >
              <ArrowLeft size={16} />
              Previous day
            </Link>
          )}
          {nextDay ? (
            completedDayChecks.includes(currentDay.id) ? (
              <Link
                href={`/study-plan/${phase.slug}/${week.id}/${nextDay.slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
              >
                Next day
                <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-gray-500">
                <Lock size={16} />
                Mark this class complete to unlock the next day
              </div>
            )
          ) : (
            <Link
              href={`/study-plan/${phase.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#151515] px-4 py-2 text-sm text-white hover:border-[#3a3a3a]"
            >
              Return to week dashboard
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

        </>
      )}

      {supportModeEnabled && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 shadow-lg backdrop-blur-sm pointer-events-none select-none"
        >
          🛟 Support ON
        </div>
      )}
    </div>
  )
}
