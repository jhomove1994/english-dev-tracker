'use client'

import { useState, useEffect } from 'react'
import { PHASES } from '@/lib/data/milestones'
import { getLocalStorage, setLocalStorage } from '@/lib/utils'
import { CheckCircle2, Circle, Lock } from 'lucide-react'

export default function MilestonesPage() {
  const [completed, setCompleted] = useState<string[]>([])
  const [currentPhase, setCurrentPhase] = useState(1)

  useEffect(() => {
    setCompleted(getLocalStorage('completed_milestones', []))
    setCurrentPhase(getLocalStorage('user_phase', 1))
  }, [])

  const toggle = (id: string) => {
    const updated = completed.includes(id) ? completed.filter(c => c !== id) : [...completed, id]
    setCompleted(updated)
    setLocalStorage('completed_milestones', updated)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {PHASES.map(phase => {
        const completedCount = phase.milestones.filter(m => completed.includes(m.id)).length
        const progress = Math.round((completedCount / phase.milestones.length) * 100)
        const isLocked = phase.id > currentPhase + 1
        return (
          <div key={phase.id} className={`bg-[#111111] border rounded-xl p-6 ${phase.id === currentPhase ? 'border-green-500/30' : isLocked ? 'border-[#1f1f1f] opacity-60' : 'border-[#1f1f1f]'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {isLocked && <Lock size={14} className="text-gray-500" />}
                  <h3 className={`font-semibold ${phase.id === currentPhase ? 'text-green-400' : 'text-white'}`}>{phase.title}</h3>
                  {phase.id === currentPhase && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Current</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{phase.period} · {phase.levelFrom} → {phase.levelTo}</p>
              </div>
              <span className="text-sm font-semibold text-green-400">{progress}%</span>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 bg-[#1f1f1f] rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500">{completedCount}/{phase.milestones.length}</span>
            </div>
            <div className="space-y-3">
              {phase.milestones.map(milestone => {
                const isDone = completed.includes(milestone.id)
                return (
                  <button key={milestone.id} onClick={() => !isLocked && toggle(milestone.id)} disabled={isLocked}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left">
                    {isDone ? <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={20} className="text-gray-600 mt-0.5 shrink-0" />}
                    <span className={`text-sm ${isDone ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{milestone.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
