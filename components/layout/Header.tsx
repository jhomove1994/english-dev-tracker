'use client'

import { usePathname } from 'next/navigation'
import { ALL_STUDY_WEEKS, getPhaseBySlug } from '@/lib/data/study-plan'
import { getDayClass } from '@/lib/study-plan'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/study-plan': 'Study Plan',
  '/timer': 'Study Timer',
  '/milestones': 'Phase Milestones',
  '/flashcards': 'IT Flashcards',
  '/mock-interview': 'Mock Interview Simulator',
  '/standup': 'Standup Recorder',
  '/stats': 'Statistics',
}

export function Header() {
  const pathname = usePathname()
  const phaseMatch = pathname.match(/^\/study-plan\/([^/]+)$/)
  const dayMatch = pathname.match(/^\/study-plan\/([^/]+)\/([^/]+)\/([^/]+)$/)
  const phaseTitle = phaseMatch ? getPhaseBySlug(phaseMatch[1])?.title : null
  const dayTitle = dayMatch
    ? (() => {
        const week = ALL_STUDY_WEEKS.find((item) => item.id === dayMatch[2] && item.phaseSlug === dayMatch[1])
        if (!week) return null
        return getDayClass(week, dayMatch[3])?.title ?? null
      })()
    : null
  const title = dayTitle ?? phaseTitle ?? titles[pathname] ?? 'English Dev Tracker'

  return (
    <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center px-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </header>
  )
}
