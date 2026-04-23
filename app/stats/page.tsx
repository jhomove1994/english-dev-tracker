'use client'

import { useStudyStats } from '@/lib/hooks/useStudyStats'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { ACTIVITY_TYPES } from '@/lib/data/activities'
import { getLocalStorage } from '@/lib/utils'
import { PHASES } from '@/lib/data/milestones'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flame, Clock, Trophy, TrendingUp, BookOpen, CheckSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function StatsPage() {
  const { totalHours, thisWeekHours, currentStreak, bestStreak, activityMap, weeklyData } = useStudyStats()
  const { masteredCount, totalCards } = useFlashcards()
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])

  useEffect(() => { setCompletedMilestones(getLocalStorage('completed_milestones', [])) }, [])

  const pieData = Object.entries(activityMap).map(([type, seconds]) => {
    const activity = ACTIVITY_TYPES.find(a => a.id === type)
    return { name: activity?.label ?? type, value: Math.round(seconds / 60), color: activity?.color ?? '#888' }
  }).filter(d => d.value > 0)

  const allMilestonesCount = PHASES.reduce((acc, p) => acc + p.milestones.length, 0)
  const statCards = [
    { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: 'text-blue-400' },
    { label: 'This Week', value: `${thisWeekHours}h`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Current Streak', value: `${currentStreak}d`, icon: Flame, color: 'text-orange-400' },
    { label: 'Best Streak', value: `${bestStreak}d`, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Cards Mastered', value: `${masteredCount}/${totalCards}`, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Milestones Done', value: `${completedMilestones.length}/${allMilestonesCount}`, icon: CheckSquare, color: 'text-cyan-400' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><Icon size={16} className={color}/><span className="text-xs text-gray-400">{label}</span></div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Weekly Study Minutes</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} barSize={30}>
            <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#22c55e' }}/>
            <Bar dataKey="minutes" fill="#22c55e" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {pieData.length > 0 && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Activity Breakdown (minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                {pieData.map((entry, index) => <Cell key={index} fill={entry.color}/>)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} formatter={(value) => [`${value} min`, '']}/>
              <Legend formatter={(value) => <span style={{ color: '#888', fontSize: 12 }}>{value}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Milestones by Phase</h3>
        <div className="space-y-4">
          {PHASES.map(phase => {
            const done = phase.milestones.filter(m => completedMilestones.includes(m.id)).length
            const pct = Math.round((done / phase.milestones.length) * 100)
            return (
              <div key={phase.id}>
                <div className="flex justify-between mb-1.5"><span className="text-sm text-gray-300">{phase.title}</span><span className="text-sm text-green-400">{done}/{phase.milestones.length}</span></div>
                <div className="bg-[#1f1f1f] rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }}/></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
