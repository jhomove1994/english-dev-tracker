'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { PHASES } from '@/lib/data/milestones'
import { getDayKey } from '@/lib/utils'
import { usePersistentStorage } from '@/lib/hooks/usePersistentStorage'
import { PERSISTENT_STORAGE_KEY } from '@/lib/persistence'
import { useStudyStats } from '@/lib/hooks/useStudyStats'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Timer, CreditCard, CheckSquare, Mic, MessageSquare, BarChart3, Flame, Clock, Target, TrendingUp, BookOpen, Volume2, Users, FileText, Headphones } from 'lucide-react'

// English level progression
const LEVELS = [
  { id: 'A2', label: 'A2', color: 'text-gray-400', bg: 'bg-gray-500/10', minMastered: 0, minStreak: 0 },
  { id: 'B1', label: 'B1', color: 'text-blue-400', bg: 'bg-blue-500/10', minMastered: 30, minStreak: 7 },
  { id: 'B2', label: 'B2', color: 'text-purple-400', bg: 'bg-purple-500/10', minMastered: 80, minStreak: 21 },
  { id: 'C1', label: 'C1', color: 'text-yellow-400', bg: 'bg-yellow-500/10', minMastered: 150, minStreak: 60 },
] as const

const WORD_OF_DAY_PHRASES = [
  { phrase: "spin up a service", context: "Start or launch a service/container", example: "We need to spin up a new instance for load testing." },
  { phrase: "circle back", context: "Return to a topic later", example: "Let's circle back on this after the standup." },
  { phrase: "take ownership", context: "Be fully responsible for something", example: "I'll take ownership of the authentication module." },
  { phrase: "ship it", context: "Deploy / release to production", example: "The feature is ready — let's ship it!" },
  { phrase: "flag up a risk", context: "Proactively raise a concern", example: "I want to flag up a risk with the current DB schema." },
  { phrase: "drill down", context: "Investigate or analyze in detail", example: "We need to drill down into the performance metrics." },
  { phrase: "time-box this", context: "Set a fixed time limit for a task/discussion", example: "Let's time-box this discussion to 10 minutes." },
  { phrase: "get on the same page", context: "Ensure shared understanding", example: "Before the demo, let's get on the same page on requirements." },
  { phrase: "push back on that", context: "Disagree or question a suggestion", example: "I'm going to push back on that timeline — it's too aggressive." },
  { phrase: "hand off", context: "Transfer a task to someone else", example: "I'll hand off this ticket to you once the tests pass." },
  { phrase: "LGTM — looks good to me", context: "Approve a PR in code review", example: "No major issues. LGTM — looks good to me!" },
  { phrase: "over-engineer", context: "Build something more complex than needed", example: "Let's not over-engineer this — a simple solution works fine." },
  { phrase: "keep someone in the loop", context: "Keep someone informed", example: "Keep the PM in the loop while we investigate this." },
  { phrase: "move the needle", context: "Make meaningful progress or impact", example: "This optimization will really move the needle on page load time." },
] as const

export default function DashboardPage() {
  const [currentPhase, setCurrentPhase] = usePersistentStorage<number>(PERSISTENT_STORAGE_KEY.USER_PHASE, 1)
  const { thisWeekHours, currentStreak, weeklyData, sessions } = useStudyStats()
  const { masteredCount, totalCards } = useFlashcards()
  const [completedMilestones] = usePersistentStorage<string[]>(PERSISTENT_STORAGE_KEY.COMPLETED_MILESTONES, [])
  const [dailyChallenge, setDailyChallenge] = usePersistentStorage<Record<string, string>>('daily_challenge_answers', {})
  const { speak, isSupported: ttsSupported } = useSpeech()

  const phase = PHASES.find(p => p.id === currentPhase) ?? PHASES[0]
  const phaseMilestones = phase.milestones
  const completedInPhase = phaseMilestones.filter(m => completedMilestones.includes(m.id)).length
  const phaseProgress = Math.round((completedInPhase / phaseMilestones.length) * 100)

  const todaySessions = sessions.filter(s => s.startedAt.startsWith(getDayKey()))
  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)

  // Word of the day — deterministic by date
  const todayKey = getDayKey()
  const wordOfDay = useMemo(() => {
    const seed = todayKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return WORD_OF_DAY_PHRASES[seed % WORD_OF_DAY_PHRASES.length]
  }, [todayKey])

  // Gamified level based on mastered cards and streak
  const currentLevel = useMemo(() => {
    return [...LEVELS].reverse().find(l => masteredCount >= l.minMastered && currentStreak >= l.minStreak) ?? LEVELS[0]
  }, [masteredCount, currentStreak])

  const nextLevel = useMemo(() => {
    const idx = LEVELS.findIndex(l => l.id === currentLevel.id)
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
  }, [currentLevel])

  const levelProgressPct = useMemo(() => {
    if (!nextLevel) return 100
    const masteredProgress = Math.min(1, (masteredCount - currentLevel.minMastered) / Math.max(1, nextLevel.minMastered - currentLevel.minMastered))
    const streakProgress = Math.min(1, (currentStreak - currentLevel.minStreak) / Math.max(1, nextLevel.minStreak - currentLevel.minStreak))
    return Math.round(Math.min(masteredProgress, streakProgress) * 100)
  }, [currentLevel, nextLevel, masteredCount, currentStreak])

  const quickLinks = [
    { href: '/study-plan', icon: BookOpen, label: 'Study Plan', color: 'text-emerald-400' },
    { href: '/timer', icon: Timer, label: 'Start Timer', color: 'text-blue-400' },
    { href: '/flashcards', icon: CreditCard, label: 'Flashcards', color: 'text-yellow-400' },
    { href: '/milestones', icon: CheckSquare, label: 'Milestones', color: 'text-green-400' },
    { href: '/mock-interview', icon: MessageSquare, label: 'Mock Interview', color: 'text-red-400' },
    { href: '/standup', icon: Mic, label: 'Standup', color: 'text-purple-400' },
    { href: '/meeting-phrases', icon: Users, label: 'Meetings', color: 'text-orange-400' },
    { href: '/dictation', icon: Headphones, label: 'Dictation', color: 'text-pink-400' },
    { href: '/templates', icon: FileText, label: 'Templates', color: 'text-cyan-400' },
    { href: '/stats', icon: BarChart3, label: 'Statistics', color: 'text-teal-400' },
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
                  onClick={() => setCurrentPhase(p)}
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

      {/* Level badge */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Your English Level</h3>
          <span className={`text-2xl font-bold px-4 py-1 rounded-full border ${currentLevel.color} ${currentLevel.bg} border-current`}>{currentLevel.label}</span>
        </div>
        {nextLevel ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-[#1f1f1f] rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${levelProgressPct}%` }} />
              </div>
              <span className="text-xs text-gray-500">{levelProgressPct}% → {nextLevel.label}</span>
            </div>
            <p className="text-xs text-gray-500">
              Next level at {nextLevel.minMastered} mastered cards + {nextLevel.minStreak}-day streak.
              You have {masteredCount} mastered and a {currentStreak}-day streak.
            </p>
          </>
        ) : (
          <p className="text-sm text-yellow-400">🏆 You&apos;ve reached the highest level — C1!</p>
        )}
      </div>

      {/* Word of the Day */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Word / Phrase of the Day</h3>
          <span className="text-xs text-gray-500">{todayKey}</span>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-green-400 flex-1">&ldquo;{wordOfDay.phrase}&rdquo;</p>
            {ttsSupported && (
              <button onClick={() => speak(wordOfDay.phrase)} className="w-8 h-8 flex items-center justify-center rounded-full border border-[#333] text-gray-400 hover:text-white hover:border-green-500 transition-colors">
                <Volume2 size={14} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400">{wordOfDay.context}</p>
          <p className="text-sm text-gray-300 italic">&ldquo;{wordOfDay.example}&rdquo;</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Daily challenge: Use this phrase in a sentence</label>
          <textarea
            value={dailyChallenge[todayKey] ?? ''}
            onChange={e => setDailyChallenge({ ...dailyChallenge, [todayKey]: e.target.value })}
            placeholder={`Write a sentence using "${wordOfDay.phrase}"…`}
            rows={2}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none focus:border-green-500/50"
          />
          {dailyChallenge[todayKey] && <p className="text-xs text-green-400">✅ Challenge completed for today!</p>}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-white mb-3">Quick Access</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {quickLinks.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#333] transition-colors"
              >
                <Icon size={22} className={item.color} />
                <span className="text-xs text-gray-400 text-center">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
