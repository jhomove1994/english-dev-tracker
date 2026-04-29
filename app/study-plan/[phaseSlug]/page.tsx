'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Headphones,
  Laptop2,
  Lock,
  MessageSquare,
  Mic,
  Target,
} from 'lucide-react'
import { ALL_STUDY_WEEKS, getPhaseBySlug, STUDY_SKILL_LABELS, type StudySkill } from '@/lib/data/study-plan'
import {
  buildWeekDayClasses,
  buildWeekDailyPlan,
  DAY_CHECKS_STORAGE_KEY,
  getPhaseProgress,
  isDayUnlocked,
  isPhaseUnlocked,
  isWeekComplete,
  isWeekUnlocked,
  LESSON_CHECKS_STORAGE_KEY,
  LESSON_CRITERIA_STORAGE_KEY,
  LESSON_REFLECTION_STORAGE_KEY,
  WEEK_CHECKPOINTS_STORAGE_KEY,
} from '@/lib/study-plan'
import { cn } from '@/lib/utils'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'

const skillMeta: Record<StudySkill, { icon: typeof Mic; color: string; bg: string }> = {
  speaking: { icon: Mic, color: 'text-green-400', bg: 'bg-green-500/10' },
  listening: { icon: Headphones, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  interview: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  it_communication: { icon: Laptop2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

export default function StudyPhasePage() {
  const params = useParams<{ phaseSlug: string }>()
  const phase = getPhaseBySlug(params.phaseSlug)
  const phaseIndex = phase ? phase.id - 1 : -1

  const [completedLessons, setCompletedLessons] = usePersistentStorage<string[]>(LESSON_CHECKS_STORAGE_KEY, [])
  const [completedCheckpoints, setCompletedCheckpoints] = usePersistentStorage<string[]>(WEEK_CHECKPOINTS_STORAGE_KEY, [])
  const [completedDayChecks] = usePersistentStorage<string[]>(DAY_CHECKS_STORAGE_KEY, [])
  // lessonCriteria: { [lessonId-criterionIndex]: true }
  const [lessonCriteria, setLessonCriteria] = usePersistentStorage<Record<string, boolean>>(LESSON_CRITERIA_STORAGE_KEY, {})
  // lessonReflections: { [lessonId]: text }
  const [lessonReflections, setLessonReflections] = usePersistentStorage<Record<string, string>>(LESSON_REFLECTION_STORAGE_KEY, {})

  const phaseUnlocked = phase ? isPhaseUnlocked(phaseIndex, completedLessons, completedCheckpoints, completedDayChecks) : false

  const firstUnlockedWeekId = useMemo(() => {
    if (!phase) return ''
        return (
          phase.weeks.find((week) => {
            const weekIndex = ALL_STUDY_WEEKS.findIndex((item) => item.id === week.id)
        return isWeekUnlocked(weekIndex, completedLessons, completedCheckpoints, completedDayChecks)
          })?.id ?? phase.weeks[0]?.id ?? ''
    )
  }, [phase, completedLessons, completedCheckpoints, completedDayChecks])

  const [selectedWeekId, setSelectedWeekId] = useState(firstUnlockedWeekId)

  if (!phase) {
    return (
      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 text-sm text-gray-300">
        Phase not found.
      </div>
    )
  }

  if (!phaseUnlocked) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/study-plan" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} />
          Back to phases
        </Link>
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
          <h2 className="text-xl font-semibold text-white">{phase.title}</h2>
          <p className="mt-2 text-sm text-gray-400">
            This phase is still locked. Complete the previous phase first so the course stays guided instead of overwhelming.
          </p>
        </div>
      </div>
    )
  }

  const safeSelectedWeekId = phase.weeks.some((week) => week.id === selectedWeekId) ? selectedWeekId : firstUnlockedWeekId
  const currentWeek = phase.weeks.find((week) => week.id === safeSelectedWeekId) ?? phase.weeks[0]
  const currentWeekGlobalIndex = ALL_STUDY_WEEKS.findIndex((week) => week.id === currentWeek.id)
  const currentWeekUnlocked = isWeekUnlocked(currentWeekGlobalIndex, completedLessons, completedCheckpoints, completedDayChecks)
  const dailyPlan = buildWeekDailyPlan(currentWeek)
  const dayClasses = buildWeekDayClasses(currentWeek)
  const progress = getPhaseProgress(phase, completedLessons, completedCheckpoints, completedDayChecks)
  const completedLessonCount = currentWeek.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length
  const completedCheckpointCount = currentWeek.checkpoints.filter((checkpoint) =>
    completedCheckpoints.includes(checkpoint.id)
  ).length
  const completedDayCount = dayClasses.filter((dayClass) => completedDayChecks.includes(dayClass.id)).length
  const weekDone = isWeekComplete(currentWeek, completedLessons, completedCheckpoints, completedDayChecks)
  const nextWeek = phase.weeks[phase.weeks.findIndex((week) => week.id === currentWeek.id) + 1]

  const toggleLesson = (lessonId: string) => {
    const updated = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId]

    setCompletedLessons(updated)
  }

  const getLessonCriteriaKey = (lessonId: string, index: number) => `${lessonId}__criteria__${index}`

  const toggleLessonCriterion = (lessonId: string, index: number) => {
    const key = getLessonCriteriaKey(lessonId, index)
    setLessonCriteria((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const isAllCriteriaChecked = (lessonId: string, count: number) => {
    for (let i = 0; i < count; i++) {
      if (!lessonCriteria[getLessonCriteriaKey(lessonId, i)]) return false
    }
    return count > 0
  }

  const toggleCheckpoint = (checkpointId: string) => {
    const updated = completedCheckpoints.includes(checkpointId)
      ? completedCheckpoints.filter((id) => id !== checkpointId)
      : [...completedCheckpoints, checkpointId]

    setCompletedCheckpoints(updated)
  }

  return (
    <div className="max-w-7xl space-y-6">
      <Link href="/study-plan" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} />
        Back to phases
      </Link>

      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-400">{phase.period}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{phase.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{phase.levelFrom} → {phase.levelTo}</p>
            <p className="mt-3 max-w-3xl text-sm text-gray-400">{phase.summary}</p>
          </div>
          <div className="rounded-xl border border-[#242424] bg-[#151515] px-4 py-3 text-sm text-gray-300">
            Unlock rule: {phase.unlockRule}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Phase progress</span>
            <span>{progress.completedItems}/{progress.totalItems}</span>
          </div>
          <div className="h-2 rounded-full bg-[#1f1f1f]">
            <div className="h-2 rounded-full bg-green-500" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
            <h3 className="text-sm font-semibold text-white">Weeks in this phase</h3>
            <div className="mt-4 space-y-3">
              {phase.weeks.map((week) => {
                const weekIndex = ALL_STUDY_WEEKS.findIndex((item) => item.id === week.id)
                const unlocked = isWeekUnlocked(weekIndex, completedLessons, completedCheckpoints, completedDayChecks)
                const completed = isWeekComplete(week, completedLessons, completedCheckpoints, completedDayChecks)
                const selected = week.id === currentWeek.id

                return (
                  <button
                    key={week.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setSelectedWeekId(week.id)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-colors',
                      selected ? 'border-green-500/40 bg-green-500/5' : 'border-[#242424] bg-[#151515]',
                      !unlocked && 'cursor-not-allowed opacity-55'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Week {week.week}</p>
                        <p className="mt-1 font-medium text-white">{week.title}</p>
                        <p className="mt-1 text-xs text-gray-500">{week.level}</p>
                      </div>
                      {!unlocked ? (
                        <Lock size={16} className="text-gray-500" />
                      ) : completed ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <Circle size={16} className="text-gray-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
            <h3 className="text-sm font-semibold text-white">How this week is checked</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <p>1. Complete the 5 daily classes in order.</p>
              <p>2. Complete the evidence for each of the 4 lessons.</p>
              <p>3. Mark the weekly checkpoints only when you can do them without reading a script.</p>
              <p>4. The next week unlocks only when daily classes, lesson checks, and checkpoints are complete.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-green-400">Week {currentWeek.week}</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">{currentWeek.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{currentWeek.goal}</p>
              </div>
              <div className="rounded-xl border border-[#242424] bg-[#151515] px-4 py-3 text-sm text-gray-300">
                Lessons: {completedLessonCount}/{currentWeek.lessons.length}
                <br />
                Day classes: {completedDayCount}/{dayClasses.length}
                <br />
                Checkpoints: {completedCheckpointCount}/{currentWeek.checkpoints.length}
              </div>
            </div>

            {!currentWeekUnlocked && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                This week is still locked. Complete the previous week first.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
            <h4 className="text-lg font-semibold text-white">Daily classes</h4>
            <p className="mt-2 text-sm text-gray-400">
              Each day now has its own class page with full teaching text, written work, checks, and references.
            </p>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {dailyPlan.map((dayPlan, index) => {
                const dayClass = dayClasses[index]
                const unlocked = isDayUnlocked(currentWeek, index, completedDayChecks)
                const done = dayClass ? completedDayChecks.includes(dayClass.id) : false

                return (
                <div key={dayPlan.day} className={`rounded-xl border bg-[#151515] p-4 ${done ? 'border-green-500/30' : 'border-[#242424]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-blue-400">Day {dayPlan.day}</p>
                      <h5 className="mt-1 font-semibold text-white">{dayPlan.title}</h5>
                      <p className="mt-1 text-sm text-gray-400">{dayPlan.focus}</p>
                    </div>
                    <span className="rounded-full bg-[#101010] px-3 py-1 text-xs text-gray-300">{dayPlan.minutes}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Agenda</p>
                    <div className="mt-2 space-y-2">
                      {dayPlan.agenda.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-green-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-[#2a2a2a] bg-[#101010] p-3 text-sm text-gray-300">
                    <p><span className="font-medium text-white">Deliverable:</span> {dayPlan.deliverable}</p>
                    <p className="mt-2"><span className="font-medium text-white">Daily check:</span> {dayPlan.successCheck}</p>
                  </div>
                  <div className="mt-4">
                    {dayClass && unlocked ? (
                      <Link
                        href={`/study-plan/${phase.slug}/${currentWeek.id}/${dayClass.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-white hover:border-[#3a3a3a]"
                      >
                        {done ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-gray-400" />}
                        Open day class
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-gray-500">
                        <Lock size={16} />
                        Locked until previous day is complete
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>

          {currentWeek.lessons.map((lesson) => {
            const meta = skillMeta[lesson.skill]
            const Icon = meta.icon
            const done = completedLessons.includes(lesson.id)
            const allCriteriaMet = isAllCriteriaChecked(lesson.id, lesson.check.passCriteria.length)
            const canMarkDone = currentWeekUnlocked && (allCriteriaMet || done)

            return (
              <div key={lesson.id} className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-3">
                    <div className={cn('rounded-lg p-2', meta.bg)}>
                      <Icon size={18} className={meta.color} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{STUDY_SKILL_LABELS[lesson.skill]}</p>
                      <h4 className="mt-1 text-xl font-semibold text-white">{lesson.title}</h4>
                      <p className="mt-2 text-sm text-gray-400">{lesson.objective}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canMarkDone}
                    onClick={() => toggleLesson(lesson.id)}
                    title={!currentWeekUnlocked ? 'Complete the previous week first' : !allCriteriaMet && !done ? 'Check all pass criteria below before marking done' : undefined}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                      done
                        ? 'border-green-500/30 bg-green-500/10 text-green-300'
                        : canMarkDone
                          ? 'border-[#2a2a2a] bg-[#151515] text-gray-300 hover:border-[#3a3a3a]'
                          : 'border-[#2a2a2a] bg-[#151515] text-gray-600 cursor-not-allowed opacity-60'
                    )}
                  >
                    {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    {done ? 'Lesson checked' : 'Mark lesson as done'}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4 lg:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Mini class explanation</p>
                    <div className="mt-3 space-y-2">
                      {lesson.miniLesson.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-cyan-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">What this lesson teaches</p>
                    <div className="mt-3 space-y-2">
                      {lesson.teachingPoints.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-green-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Sentence frames and language tools</p>
                    <div className="mt-3 space-y-2">
                      {lesson.sentenceFrames.map((item) => (
                        <div key={item} className="rounded-lg bg-[#101010] p-3 text-sm text-gray-200">{item}</div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Guided example</p>
                    <p className="mt-2 text-sm text-gray-400">{lesson.guidedExample.scenario}</p>
                    <div className="mt-3 space-y-2">
                      {lesson.guidedExample.model.map((item) => (
                        <div key={item} className="rounded-lg bg-[#101010] p-3 text-sm text-gray-200">{item}</div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-400">{lesson.guidedExample.whyItWorks}</p>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Common mistakes to avoid</p>
                    <div className="mt-3 space-y-2">
                      {lesson.commonMistakes.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-red-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Step-by-step class flow</p>
                    <div className="mt-3 space-y-2">
                      {lesson.classFlow.map((item, index) => (
                        <div key={item} className="flex gap-3 text-sm text-gray-300">
                          <span className="font-medium text-blue-400">{index + 1}.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Support tools</p>
                    <div className="mt-3 space-y-2">
                      {lesson.supportTools.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-purple-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Activities</p>
                    <div className="mt-3 space-y-2">
                      {lesson.activities.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-amber-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg border border-green-500/15 bg-green-500/5 px-3 py-2 text-sm text-green-200">
                      <span className="font-medium text-green-400">Output:</span> {lesson.output}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Micro-drills before the final task</p>
                    <div className="mt-3 space-y-2">
                      {lesson.microDrills.map((item) => (
                        <div key={item} className="flex gap-2 text-sm text-gray-300">
                          <span className="mt-1 text-amber-400">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cn(
                    'rounded-xl border p-4 lg:col-span-2',
                    allCriteriaMet ? 'border-green-500/30 bg-green-500/5' : 'border-[#242424] bg-[#151515]'
                  )}>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Lesson check — complete before marking done</p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-white">Evidence to produce</p>
                        <p className="mt-1 text-sm text-gray-300">{lesson.check.evidence}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Pass criteria</p>
                        <p className="mt-1 text-xs text-gray-500">Check each item only when you can honestly confirm it.</p>
                        <div className="mt-3 space-y-2">
                          {lesson.check.passCriteria.map((item, criterionIndex) => {
                            const criterionKey = getLessonCriteriaKey(lesson.id, criterionIndex)
                            const checked = !!lessonCriteria[criterionKey]
                            return (
                              <button
                                key={criterionKey}
                                type="button"
                                disabled={!currentWeekUnlocked}
                                onClick={() => toggleLessonCriterion(lesson.id, criterionIndex)}
                                className={cn(
                                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors',
                                  checked
                                    ? 'border-green-500/30 bg-green-500/5 text-green-200'
                                    : 'border-[#2a2a2a] bg-[#101010] text-gray-300 hover:border-[#3a3a3a]',
                                  !currentWeekUnlocked && 'cursor-not-allowed opacity-60'
                                )}
                              >
                                {checked
                                  ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-400" />
                                  : <Circle size={15} className="mt-0.5 shrink-0 text-gray-600" />
                                }
                                <span>{item}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Reflection</p>
                        <p className="mt-1 text-sm text-gray-400">{lesson.check.reflectionPrompt}</p>
                        <textarea
                          value={lessonReflections[lesson.id] ?? ''}
                          onChange={(e) => setLessonReflections((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                          disabled={!currentWeekUnlocked}
                          placeholder="Write your answer here before marking the lesson done…"
                          rows={3}
                          className="mt-3 w-full rounded-xl border border-[#2a2a2a] bg-[#101010] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-green-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      {currentWeekUnlocked && !done && !allCriteriaMet && (
                        <p className="text-xs text-amber-300">
                          Check all {lesson.check.passCriteria.length} criteria above to unlock the &ldquo;Mark lesson as done&rdquo; button.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
            <h4 className="text-lg font-semibold text-white">Weekly resource and guided quiz</h4>
            <div className="mt-4 space-y-4">
              {currentWeek.resources.map((resource) => (
                <div key={resource.id} className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-blue-400">{resource.channel}</p>
                      <h5 className="mt-1 text-lg font-semibold text-white">{resource.title}</h5>
                      <p className="mt-2 text-sm text-gray-300">{resource.studyObjective}</p>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-gray-200 hover:border-[#3a3a3a] hover:text-white"
                    >
                      Open resource
                    </a>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg bg-[#101010] p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Why it helps</p>
                      <p className="mt-2 text-sm text-gray-300">{resource.whyItHelps}</p>
                    </div>
                    <div className="rounded-lg bg-[#101010] p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">What to practice</p>
                      <div className="mt-2 space-y-2">
                        {resource.practiceWhileUsing.map((item) => (
                          <div key={item} className="flex gap-2 text-sm text-gray-300">
                            <span className="mt-1 text-green-400">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Key phrases</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resource.keyPhrases.map((phrase) => (
                        <span key={phrase} className="rounded-full bg-[#101010] px-3 py-1 text-sm text-green-300">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-lg bg-[#101010] p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Comprehension</p>
                      <div className="mt-2 space-y-2">
                        {resource.quiz.comprehension.map((item) => (
                          <div key={item} className="text-sm text-gray-300">{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#101010] p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Speaking prompts</p>
                      <div className="mt-2 space-y-2">
                        {resource.quiz.speaking.map((item) => (
                          <div key={item} className="text-sm text-gray-300">{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#101010] p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Vocabulary in context</p>
                      <div className="mt-2 space-y-3">
                        {resource.quiz.vocabulary.map((item) => (
                          <div key={item.phrase}>
                            <p className="text-sm font-medium text-white">{item.phrase}</p>
                            <p className="mt-1 text-sm text-gray-400">{item.practice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
            <h4 className="text-lg font-semibold text-white">Weekly checkpoints</h4>
            <p className="mt-2 text-sm text-gray-400">
              These are the final proofs for the week. They work together with the lesson checks above.
            </p>
            <div className="mt-4 space-y-3">
              {currentWeek.checkpoints.map((checkpoint) => {
                const done = completedCheckpoints.includes(checkpoint.id)

                return (
                  <button
                    key={checkpoint.id}
                    type="button"
                    disabled={!currentWeekUnlocked}
                    onClick={() => toggleCheckpoint(checkpoint.id)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-colors',
                      done
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-[#242424] bg-[#151515] hover:border-[#333]',
                      !currentWeekUnlocked && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div className="flex gap-3">
                      {done ? (
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-400" />
                      ) : (
                        <Target size={18} className="mt-0.5 shrink-0 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium text-white">{checkpoint.title}</p>
                        <p className="mt-1 text-sm text-gray-400">{checkpoint.requirement}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 rounded-xl border border-[#242424] bg-[#151515] p-4 text-sm">
              {weekDone ? (
                <p className="text-green-300">
                  Week complete. {nextWeek ? `Week ${nextWeek.week} is now unlocked.` : 'You completed the last week of this phase.'}
                </p>
              ) : (
                <p className="text-amber-100">
                  To unlock the next module, finish {currentWeek.lessons.length - completedLessonCount} lesson check
                  {currentWeek.lessons.length - completedLessonCount === 1 ? '' : 's'} and {currentWeek.checkpoints.length - completedCheckpointCount} checkpoint
                  {currentWeek.checkpoints.length - completedCheckpointCount === 1 ? '' : 's'}, plus {dayClasses.length - completedDayCount} daily class
                  {dayClasses.length - completedDayCount === 1 ? '' : 'es'}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
