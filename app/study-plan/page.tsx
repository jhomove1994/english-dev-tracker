'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2, Lock, Target } from 'lucide-react'
import { STUDY_PHASES } from '@/lib/data/study-plan'
import {
  DAY_CHECKS_STORAGE_KEY,
  getPhaseProgress,
  isPhaseUnlocked,
  LESSON_CHECKS_STORAGE_KEY,
  WEEK_CHECKPOINTS_STORAGE_KEY,
} from '@/lib/study-plan'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'

export default function StudyPlanOverviewPage() {
  const [completedLessons] = usePersistentStorage<string[]>(LESSON_CHECKS_STORAGE_KEY, [])
  const [completedCheckpoints] = usePersistentStorage<string[]>(WEEK_CHECKPOINTS_STORAGE_KEY, [])
  const [completedDayChecks] = usePersistentStorage<string[]>(DAY_CHECKS_STORAGE_KEY, [])

  const totalLessons = STUDY_PHASES.reduce((total, phase) => total + phase.weeks.reduce((acc, week) => acc + week.lessons.length, 0), 0)
  const totalCheckpoints = STUDY_PHASES.reduce((total, phase) => total + phase.weeks.reduce((acc, week) => acc + week.checkpoints.length, 0), 0)
  const totalDayClasses = STUDY_PHASES.reduce((total, phase) => total + phase.weeks.length * 5, 0)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
          <BookOpen size={14} />
          Guided study course
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Study by phase, not all at once</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-400">
          Each phase now has its own page. Inside every week you will see complete lessons by skill, lesson evidence,
          visible pass criteria, and the checkpoints required to unlock the next module.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <CheckCircle2 size={16} className="text-green-400" />
            Lesson checks
          </div>
          <div className="text-2xl font-bold text-white">{completedLessons.length}/{totalLessons}</div>
        </div>
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <Target size={16} className="text-blue-400" />
            Weekly checkpoints
          </div>
          <div className="text-2xl font-bold text-white">{completedCheckpoints.length}/{totalCheckpoints}</div>
        </div>
        <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <BookOpen size={16} className="text-purple-400" />
            Daily classes
          </div>
          <div className="text-2xl font-bold text-white">{completedDayChecks.length}/{totalDayClasses}</div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {STUDY_PHASES.map((phase, phaseIndex) => {
          const unlocked = isPhaseUnlocked(phaseIndex, completedLessons, completedCheckpoints, completedDayChecks)
          const progress = getPhaseProgress(phase, completedLessons, completedCheckpoints, completedDayChecks)
          const content = (
            <div className={`rounded-xl border p-6 transition-colors ${unlocked ? 'border-[#1f1f1f] bg-[#111111] hover:border-[#333]' : 'border-[#1f1f1f] bg-[#111111] opacity-60'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-green-400">{phase.period}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{phase.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{phase.levelFrom} → {phase.levelTo}</p>
                </div>
                {unlocked ? <ArrowRight size={18} className="text-gray-500" /> : <Lock size={18} className="text-gray-500" />}
              </div>

              <p className="mt-3 text-sm text-gray-400">{phase.summary}</p>

              <div className="mt-4 rounded-lg border border-[#242424] bg-[#151515] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Unlock rule</p>
                <p className="mt-2 text-sm text-gray-300">{phase.unlockRule}</p>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{progress.completedItems}/{progress.totalItems}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1f1f1f]">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            </div>
          )

          if (!unlocked) return <div key={phase.id}>{content}</div>

          return (
            <Link key={phase.id} href={`/study-plan/${phase.slug}`} className="block">
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
