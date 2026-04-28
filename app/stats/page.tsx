'use client'

import { useStudyStats } from '@/lib/hooks/useStudyStats'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { ACTIVITY_TYPES } from '@/lib/data/activities'
import { PHASES } from '@/lib/data/milestones'
import { getCustomFlashcards } from '@/lib/custom-flashcards'
import { getStudyErrors, summarizeStudyErrors, type StudyErrorRecord } from '@/lib/study-errors'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flame, Clock, Trophy, TrendingUp, BookOpen, CheckSquare, BrainCircuit, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'
import { PERSISTENT_STORAGE_KEY } from '@/lib/persistence'

export default function StatsPage() {
  const { totalHours, thisWeekHours, currentStreak, bestStreak, activityMap, weeklyData } = useStudyStats()
  const { masteredCount, totalCards } = useFlashcards()
  const [completedMilestones] = usePersistentStorage<string[]>(PERSISTENT_STORAGE_KEY.COMPLETED_MILESTONES, [])
  const [studyErrors] = usePersistentStorage<StudyErrorRecord[]>(PERSISTENT_STORAGE_KEY.STUDY_PLAN_ERRORS, getStudyErrors())
  const [customFlashcards] = usePersistentStorage(PERSISTENT_STORAGE_KEY.CUSTOM_FLASHCARDS, getCustomFlashcards())
  const errorSummary = useMemo(() => summarizeStudyErrors(studyErrors), [studyErrors])
  const personalCorrectionCards = useMemo(
    () => customFlashcards.filter((card) => card.category === 'Personal corrections').length,
    [customFlashcards]
  )

  const pieData = Object.entries(activityMap).map(([type, seconds]) => {
    const activity = ACTIVITY_TYPES.find(a => a.id === type)
    return { name: activity?.label ?? type, value: Math.round(seconds / 60), color: activity?.color ?? '#888' }
  }).filter(d => d.value > 0)

  const allMilestonesCount = PHASES.reduce((acc, p) => acc + p.milestones.length, 0)
  const maxWeakPointCount = useMemo(() => Math.max(...errorSummary.weakPoints.map((item) => item.count), 1), [errorSummary.weakPoints])
  const statCards = [
    { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: 'text-blue-400' },
    { label: 'This Week', value: `${thisWeekHours}h`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Current Streak', value: `${currentStreak}d`, icon: Flame, color: 'text-orange-400' },
    { label: 'Best Streak', value: `${bestStreak}d`, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Cards Mastered', value: `${masteredCount}/${totalCards}`, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Milestones Done', value: `${completedMilestones.length}/${allMilestonesCount}`, icon: CheckSquare, color: 'text-cyan-400' },
    { label: 'Tracked Errors', value: `${errorSummary.totalErrors}`, icon: BrainCircuit, color: 'text-rose-400' },
    { label: 'Correction Cards', value: `${personalCorrectionCards}`, icon: RefreshCcw, color: 'text-emerald-400' },
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Current Weak Points</h3>
          {errorSummary.weakPoints.length === 0 ? (
            <p className="text-sm text-gray-500">
              No structured mistakes yet. Extract errors from the AI feedback inside each daily class to build your personal weak-point map.
            </p>
          ) : (
            <div className="space-y-4">
              {errorSummary.weakPoints.slice(0, 5).map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-gray-300">{item.label}</span>
                    <span className="text-sm text-rose-300">{item.count}</span>
                  </div>
                  <div className="bg-[#1f1f1f] rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.round((item.count / maxWeakPointCount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Writing vs Speaking Corrections</h3>
          {errorSummary.byTrack.length === 0 ? (
            <p className="text-sm text-gray-500">
              Once you log mistakes from writing and speaking, this section will show where your corrections are accumulating.
            </p>
          ) : (
            <div className="space-y-4">
              {errorSummary.byTrack.map((item) => {
                const totalTracked = Math.max(errorSummary.totalErrors, 1)
                const width = Math.round((item.count / totalTracked) * 100)

                return (
                  <div key={item.track}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-gray-300">{item.label}</span>
                      <span className="text-sm text-cyan-300">{item.count}</span>
                    </div>
                    <div className="bg-[#1f1f1f] rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Recent Correction Log</h3>
        {errorSummary.recentErrors.length === 0 ? (
          <p className="text-sm text-gray-500">
            Your latest structured corrections will appear here once you start extracting mistakes from classes.
          </p>
        ) : (
          <div className="space-y-3">
            {errorSummary.recentErrors.map((error) => (
              <div key={error.id} className="rounded-xl border border-[#242424] bg-[#151515] p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{error.dayTitle}</span>
                  <span>·</span>
                  <span>{error.track}</span>
                  <span>·</span>
                  <span>{error.category.replace('_', ' ')}</span>
                </div>
                <p className="mt-3 text-sm text-gray-400">Original</p>
                <p className="mt-1 text-sm text-white">{error.original || 'No original sentence saved yet.'}</p>
                <p className="mt-3 text-sm text-gray-400">Better version</p>
                <p className="mt-1 text-sm text-green-300">{error.corrected || 'No corrected sentence saved yet.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
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
