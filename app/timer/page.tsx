'use client'

import { useTimer, useStudySessions } from '@/lib/hooks/useTimer'
import { ACTIVITY_TYPES } from '@/lib/data/activities'
import { formatTime, formatDuration } from '@/lib/utils'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

export default function TimerPage() {
  const { isRunning, elapsed, selectedActivity, setSelectedActivity, start, pause, stop, reset } = useTimer()
  const { todaySeconds, sessions, refresh } = useStudySessions()

  const handleStop = () => { stop(); setTimeout(refresh, 100) }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Select Activity</h3>
        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY_TYPES.map(activity => (
            <button key={activity.id} onClick={() => !isRunning && setSelectedActivity(activity.id)} disabled={isRunning}
              className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors ${selectedActivity === activity.id ? 'border-green-500 bg-green-500/10 text-white' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-200'} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <span className="text-xl">{activity.icon}</span>
              <span>{activity.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center">
        <div className="text-7xl font-mono font-bold text-white mb-6">{formatTime(elapsed)}</div>
        {selectedActivity && (
          <p className="text-gray-400 mb-6 text-sm">
            {ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.icon}{' '}
            {ACTIVITY_TYPES.find(a => a.id === selectedActivity)?.label}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <button onClick={start} disabled={!selectedActivity} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-8 py-3 rounded-xl transition-colors">
              <Play size={18} /> Start
            </button>
          ) : (
            <button onClick={pause} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-xl transition-colors">
              <Pause size={18} /> Pause
            </button>
          )}
          <button onClick={handleStop} disabled={elapsed === 0} className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors">
            <Square size={18} /> Stop &amp; Save
          </button>
          <button onClick={reset} className="flex items-center gap-2 text-gray-500 hover:text-white px-4 py-3 rounded-xl transition-colors">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex items-center justify-between">
        <span className="text-gray-400">{"Today's total study time"}</span>
        <span className="text-green-400 font-semibold text-lg">{formatDuration(todaySeconds)}</span>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Recent Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions yet. Start studying!</p>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 10).map(session => {
              const activity = ACTIVITY_TYPES.find(a => a.id === session.activityType)
              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activity?.icon ?? '📝'}</span>
                    <div>
                      <p className="text-sm text-white">{activity?.label ?? session.activityType}</p>
                      <p className="text-xs text-gray-500">{new Date(session.startedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-medium text-sm">{formatDuration(session.durationSeconds)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
