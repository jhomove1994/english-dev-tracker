'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PHASES } from '@/lib/data/milestones'
import { getLocalStorage, setLocalStorage, getDayKey } from '@/lib/utils'
import { useStudyStats } from '@/lib/hooks/useStudyStats'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Timer, CreditCard, CheckSquare, Mic, MessageSquare, BarChart3, Flame, Clock, Target, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [currentPhase, setCurrentPhase] = useState(1)
  const { totalHours, thisWeekHours, currentStreak, weeklyData, sessions } = useStudyStats()
  const { masteredCount, totalCards } = useFlashcards()
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])

  useEffect(() => {
    setCurrentPhase(getLocalStorage('user_phase', 1))
    setCompletedMilestones(getLocalStorage('completed_milestones', []))
  }, [])

  const phase = PHASES.find(p => p.id === currentPhase) ?? PHASES[0]
  const phaseMilestones = phase.milestones
  const completedInPhase = phaseMilestones.filter(m => completedMilestones.includes(m.id)).length
  const phaseProgress = Math.round((completedInPhase / phaseMilestones.length) * 100)

  const todaySessions = sessions.filter(s => s.startedAt.startsWith(getDayKey()))
  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)

  const quickLinks = [
    { href: '/timer', icon: Timer, label: 'Start Timer', color: 'text-blue-400' },
    { href: '/flashcards', icon: CreditCard, label: 'Flashcards', color: 'text-yellow-400' },
    { href: '/milestones', icon: CheckSquare, label: 'Milestones', color: 'text-green-400' },
    { href: '/mock-interview', icon: MessageSquare, label: 'Mock Interview', color: 'text-red-400' },
    { href: '/standup', icon: Mic, label: 'Standup', color: 'text-purple-400' },
    { href: '/stats', icon: BarChart3, label: 'Statistics', color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg">{phase.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{phase.period} · {phase.levelFrom} → {phase.levelTo}</p>
            <p className="text-sm text-gray-500 mt-1">{phase.description}</p>
          </div>
          <div className="text-right">
            <div className="flex gap-2 items-center justify-end mb-2">
              {[1, 2, 3, 4].map(p => (
                <button
                  key={p}
                  onClick={() => { setCurrentPhase(p); setLocalStorage('user_phase', p) }}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                    p === currentPhase
                      ? 'bg-green-500 text-black'
                      : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Current Phase</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#1f1f1f] rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${phaseProgress}%` }}
            />
          </div>
          <span className="text-sm text-green-400 font-medium">{phaseProgress}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{completedInPhase}/{phaseMilestones.length} milestones completed</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-xs text-gray-400">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-gray-500">days in a row</div>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <div className="text-2xl font-bold text-white">{todayMinutes}m</div>
          <div className="text-xs text-gray-500">studied today</div>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-xs text-gray-400">This Week</span>
          </div>
          <div className="text-2xl font-bold text-white">{thisWeekHours}h</div>
          <div className="text-xs text-gray-500">this week</div>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-purple-400" />
            <span className="text-xs text-gray-400">Flashcards</span>
          </div>
          <div className="text-2xl font-bold text-white">{masteredCount}</div>
          <div className="text-xs text-gray-500">mastered / {totalCards}</div>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Weekly Study Minutes</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} barSize={28}>
            <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#22c55e' }}
            />
            <Bar dataKey="minutes" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p className="text-green-400 text-sm font-medium">💡 {phase.motivationalMessage}</p>
      </div>

      <div>
        <h3 className="font-semibold text-white mb-3">Quick Access</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickLinks.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#333] transition-colors"
              >
                <Icon size={22} className={item.color} />
                <span className="text-xs text-gray-400">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
