'use client'

import { useState, useCallback } from 'react'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { Volume2, RefreshCw, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

interface DictationExercise {
  id: string
  text: string
  hint: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const EXERCISES: DictationExercise[] = [
  // Standup
  { id: 'd1', text: "Yesterday I finished the login feature and opened a pull request.", hint: "Standup update about yesterday's work", category: 'Standup', difficulty: 'easy' },
  { id: 'd2', text: "Today I'm planning to fix the failing tests and review two open PRs.", hint: "Standup plan for today", category: 'Standup', difficulty: 'easy' },
  { id: 'd3', text: "I'm blocked by a missing API endpoint from the backend team.", hint: "Reporting a blocker", category: 'Standup', difficulty: 'easy' },
  // Meetings
  { id: 'd4', text: "Just to make sure we're aligned, the deadline is next Friday, correct?", hint: "Confirming understanding in a meeting", category: 'Meetings', difficulty: 'medium' },
  { id: 'd5', text: "Let's time-box this discussion to five minutes and move forward.", hint: "Keeping a meeting on track", category: 'Meetings', difficulty: 'medium' },
  { id: 'd6', text: "I'd like to flag a potential risk before we commit to this approach.", hint: "Raising a concern professionally", category: 'Meetings', difficulty: 'medium' },
  // Code review
  { id: 'd7', text: "This looks good to me, but there is a potential edge case when the list is empty.", hint: "Code review comment", category: 'Code Review', difficulty: 'medium' },
  { id: 'd8', text: "Could we extract this logic into a helper function to keep it clean and reusable?", hint: "Suggesting a refactor in code review", category: 'Code Review', difficulty: 'hard' },
  // Technical
  { id: 'd9', text: "We decided to go with a microservices architecture because it gives us better scalability.", hint: "Explaining an architectural decision", category: 'Technical', difficulty: 'hard' },
  { id: 'd10', text: "The root cause was a race condition between the database writes and the cache invalidation.", hint: "Explaining a bug", category: 'Technical', difficulty: 'hard' },
  // Interviews
  { id: 'd11', text: "I have three years of experience working with React and Node.js on production applications.", hint: "Job interview intro", category: 'Interview', difficulty: 'easy' },
  { id: 'd12', text: "The main challenge was optimizing the query performance while keeping the code maintainable.", hint: "Describing a technical challenge in an interview", category: 'Interview', difficulty: 'hard' },
  { id: 'd13', text: "I collaborated closely with the design team to ensure the user experience was intuitive.", hint: "Describing collaboration in an interview", category: 'Interview', difficulty: 'medium' },
  // Client
  { id: 'd14', text: "We ran into an unexpected issue, but we have a plan and it should not affect the timeline.", hint: "Communicating a delay to a client", category: 'Client', difficulty: 'medium' },
  { id: 'd15', text: "I would like to schedule a follow-up call to go over the technical requirements in more detail.", hint: "Proposing a follow-up with a client", category: 'Client', difficulty: 'hard' },
]

const DIFF_COLORS = {
  easy: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  hard: 'text-red-400 bg-red-500/10 border-red-500/30',
} as const

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function scoreAnswer(expected: string, given: string): { correct: number; total: number; missed: string[] } {
  const expWords = normalise(expected).split(' ')
  const givenWords = new Set(normalise(given).split(' '))
  const correct = expWords.filter(w => givenWords.has(w)).length
  const missed = expWords.filter(w => !givenWords.has(w))
  return { correct, total: expWords.length, missed }
}

export default function DictationPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [speed, setSpeed] = useState<1 | 0.7>(1)
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const { speak, isSupported: ttsSupported } = useSpeech()

  const categories = ['All', ...Array.from(new Set(EXERCISES.map(e => e.category)))]

  const filtered = EXERCISES.filter(e => {
    const catMatch = selectedCategory === 'All' || e.category === selectedCategory
    const diffMatch = selectedDifficulty === 'all' || e.difficulty === selectedDifficulty
    return catMatch && diffMatch
  })

  const exercise = filtered[currentIdx % Math.max(1, filtered.length)]

  const handleSpeak = useCallback(() => {
    if (exercise) speak(exercise.text, speed)
  }, [exercise, speak, speed])

  const handleCheck = () => setShowResult(true)

  const handleNext = () => {
    setCurrentIdx(i => (i + 1) % filtered.length)
    setUserInput('')
    setShowResult(false)
    setShowAnswer(false)
  }

  const result = showResult && exercise ? scoreAnswer(exercise.text, userInput) : null
  const percentage = result ? Math.round((result.correct / result.total) * 100) : 0

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Listening Comprehension</h2>
        <p className="text-sm text-gray-400 mt-1">Listen to the phrase, then type what you heard. A great way to train your ear for real work conversations.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentIdx(0); setUserInput(''); setShowResult(false); setShowAnswer(false) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-green-500 text-black' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}>
            {cat}
          </button>
        ))}
        <div className="flex gap-1 ml-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button key={d} onClick={() => { setSelectedDifficulty(d); setCurrentIdx(0); setUserInput(''); setShowResult(false); setShowAnswer(false) }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors capitalize ${selectedDifficulty === d ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {d === 'all' ? 'All levels' : d}
            </button>
          ))}
        </div>
      </div>

      {!exercise ? (
        <div className="text-center py-12 text-gray-500">No exercises match the selected filters.</div>
      ) : (
        <>
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFF_COLORS[exercise.difficulty]}`}>{exercise.difficulty}</span>
                <span className="text-xs text-gray-500">{exercise.category}</span>
              </div>
              <span className="text-xs text-gray-500">{(currentIdx % filtered.length) + 1} / {filtered.length}</span>
            </div>

            <p className="text-sm text-gray-400 italic">{exercise.hint}</p>

            {/* Audio controls */}
            {ttsSupported && (
              <div className="flex items-center gap-3">
                <button onClick={handleSpeak} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  <Volume2 size={16} /> Play
                </button>
                <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a]">
                  <button onClick={() => setSpeed(1)} className={`px-3 py-2 text-xs font-medium transition-colors ${speed === 1 ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300'}`}>Normal</button>
                  <button onClick={() => setSpeed(0.7)} className={`px-3 py-2 text-xs font-medium transition-colors ${speed === 0.7 ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-gray-300'}`}>🐢 Slow</button>
                </div>
                <p className="text-xs text-gray-500">Click Play as many times as needed</p>
              </div>
            )}
            {!ttsSupported && (
              <div className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">Speech synthesis is not supported in your browser. Try Chrome or Edge.</div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Type what you heard:</label>
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Type the phrase here…"
                rows={3}
                disabled={showResult}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none focus:border-green-500/50 disabled:opacity-60"
              />
            </div>

            {!showResult ? (
              <button onClick={handleCheck} disabled={!userInput.trim()} className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-black font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Check my answer
              </button>
            ) : (
              <div className="space-y-4">
                {/* Score */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${percentage >= 80 ? 'bg-green-500/10 border-green-500/30' : percentage >= 50 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  {percentage >= 80 ? <Check size={20} className="text-green-400" /> : <X size={20} className="text-red-400" />}
                  <div>
                    <p className={`font-semibold ${percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{percentage}% correct ({result!.correct}/{result!.total} words)</p>
                    {result!.missed.length > 0 && <p className="text-xs text-gray-400 mt-0.5">Missed: {result!.missed.join(', ')}</p>}
                  </div>
                </div>

                {/* Show answer toggle */}
                <button onClick={() => setShowAnswer(s => !s)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  {showAnswer ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {showAnswer ? 'Hide' : 'Show'} correct answer
                </button>
                {showAnswer && (
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Correct:</p>
                    <p className="text-sm text-white">{exercise.text}</p>
                  </div>
                )}

                <button onClick={handleNext} className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
                  <RefreshCw size={14} /> Next exercise
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
