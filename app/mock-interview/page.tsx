'use client'

import { useState } from 'react'
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '@/lib/data/interview-questions'
import { ChevronDown, ChevronUp, RotateCcw, CheckCircle, XCircle, MinusCircle } from 'lucide-react'

type InterviewType = 'behavioral' | 'technical' | 'system_design' | 'mixed'
type Difficulty = 'junior' | 'mid' | 'senior' | 'all'
type QuestionResult = 'nailed' | 'ok' | 'failed' | null

interface SessionQuestion { question: InterviewQuestion; result: QuestionResult }

export default function MockInterviewPage() {
  const [phase, setPhase] = useState<'setup' | 'session' | 'summary'>('setup')
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed')
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTips, setShowTips] = useState(false)

  const startSession = () => {
    let filtered = INTERVIEW_QUESTIONS
    if (interviewType !== 'mixed') filtered = filtered.filter(q => q.type === interviewType)
    if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty || q.difficulty === 'all')
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
    setSessionQuestions(shuffled.map(q => ({ question: q, result: null })))
    setCurrentIndex(0); setShowTips(false); setPhase('session')
  }

  const rate = (result: 'nailed' | 'ok' | 'failed') => {
    const updated = [...sessionQuestions]
    updated[currentIndex].result = result
    setSessionQuestions(updated)
    setShowTips(false)
    if (currentIndex + 1 >= sessionQuestions.length) { setPhase('summary') } else { setCurrentIndex(i => i + 1) }
  }

  const current = sessionQuestions[currentIndex]
  const nailed = sessionQuestions.filter(q => q.result === 'nailed').length
  const ok = sessionQuestions.filter(q => q.result === 'ok').length
  const failed = sessionQuestions.filter(q => q.result === 'failed').length

  if (phase === 'setup') {
    return (
      <div className="max-w-xl space-y-6">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Interview Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {([{value:'behavioral',label:'🧠 Behavioral'},{value:'technical',label:'💻 Technical'},{value:'system_design',label:'🏗️ System Design'},{value:'mixed',label:'🎲 Mixed'}] as const).map(({value,label}) => (
              <button key={value} onClick={() => setInterviewType(value)} className={`p-3 rounded-xl border text-sm font-medium transition-colors ${interviewType===value?'border-green-500 bg-green-500/10 text-green-400':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Difficulty</h3>
          <div className="grid grid-cols-4 gap-3">
            {(['all','junior','mid','senior'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`p-3 rounded-xl border text-sm font-medium transition-colors capitalize ${difficulty===d?'border-green-500 bg-green-500/10 text-green-400':'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>{d==='all'?'All Levels':d}</button>
            ))}
          </div>
        </div>
        <button onClick={startSession} className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl text-lg transition-colors">Start Interview Session</button>
      </div>
    )
  }

  if (phase === 'summary') {
    const score = Math.round((nailed / sessionQuestions.length) * 100)
    return (
      <div className="max-w-xl space-y-6">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">{score >= 70 ? '🎉' : score >= 40 ? '💪' : '��'}</div>
          <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
          <p className="text-gray-400">Score: <span className="text-green-400 font-bold">{score}%</span></p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-green-500/10 rounded-xl p-4"><div className="text-2xl font-bold text-green-400">{nailed}</div><div className="text-xs text-gray-400 mt-1">✅ Nailed it</div></div>
            <div className="bg-yellow-500/10 rounded-xl p-4"><div className="text-2xl font-bold text-yellow-400">{ok}</div><div className="text-xs text-gray-400 mt-1">😐 OK</div></div>
            <div className="bg-red-500/10 rounded-xl p-4"><div className="text-2xl font-bold text-red-400">{failed}</div><div className="text-xs text-gray-400 mt-1">❌ Need practice</div></div>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 space-y-3">
          <h4 className="text-white font-semibold">Question Review</h4>
          {sessionQuestions.map((sq, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg">
              {sq.result==='nailed'&&<CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0"/>}
              {sq.result==='ok'&&<MinusCircle size={18} className="text-yellow-500 mt-0.5 shrink-0"/>}
              {sq.result==='failed'&&<XCircle size={18} className="text-red-500 mt-0.5 shrink-0"/>}
              <p className="text-sm text-gray-300">{sq.question.question}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('setup')} className="w-full flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white py-4 rounded-xl transition-colors">
          <RotateCcw size={16} /> New Session
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-[#1f1f1f] rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(currentIndex/sessionQuestions.length)*100}%` }}/></div>
        <span className="text-sm text-gray-400">{currentIndex+1}/{sessionQuestions.length}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-[#1f1f1f] text-gray-400 capitalize">{current.question.type.replace('_',' ')}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-[#1f1f1f] text-gray-400 capitalize">{current.question.difficulty}</span>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8">
        <p className="text-xl font-semibold text-white leading-relaxed">{current.question.question}</p>
        <button onClick={() => setShowTips(!showTips)} className="mt-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          {showTips ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} {showTips ? 'Hide' : 'Show'} Answer Tips
        </button>
        {showTips && (
          <div className="mt-4 p-4 bg-[#1a1a1a] rounded-xl space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Key points to mention:</p>
            {current.question.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2"><span className="text-green-500 text-xs mt-1">•</span><p className="text-sm text-gray-300">{tip}</p></div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => rate('nailed')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-green-500/30 hover:bg-green-500/10 text-green-400 font-medium transition-colors"><CheckCircle size={18}/> Nailed it</button>
        <button onClick={() => rate('ok')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400 font-medium transition-colors"><MinusCircle size={18}/> OK</button>
        <button onClick={() => rate('failed')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 font-medium transition-colors"><XCircle size={18}/> Need Practice</button>
      </div>
    </div>
  )
}
