'use client'

import { usePathname } from 'next/navigation'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/timer': 'Study Timer',
  '/milestones': 'Phase Milestones',
  '/flashcards': 'IT Flashcards',
  '/mock-interview': 'Mock Interview Simulator',
  '/standup': 'Standup Recorder',
  '/stats': 'Statistics',
}

export function Header() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'English Dev Tracker'

  return (
    <header className="h-14 border-b border-[#1f1f1f] bg-[#111111] flex items-center px-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </header>
  )
}
