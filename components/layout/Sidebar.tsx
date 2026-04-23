'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Timer, CheckSquare, CreditCard, Mic, BarChart3, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timer', label: 'Study Timer', icon: Timer },
  { href: '/milestones', label: 'Milestones', icon: CheckSquare },
  { href: '/flashcards', label: 'Flashcards', icon: CreditCard },
  { href: '/mock-interview', label: 'Mock Interview', icon: MessageSquare },
  { href: '/standup', label: 'Standup', icon: Mic },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-[#1f1f1f]">
        <div className="p-6 border-b border-[#1f1f1f]">
          <h1 className="text-xl font-bold text-green-500">🇬🇧 DevEnglish</h1>
          <p className="text-xs text-gray-500 mt-1">A2 → C1 Journey</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-green-500/10 text-green-500 font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#1f1f1f] flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors',
                isActive ? 'text-green-500' : 'text-gray-500'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
