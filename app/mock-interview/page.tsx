'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { INTERVIEW_QUESTIONS, InterviewQuestion } from '@/lib/data/interview-questions'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { ChevronDown, ChevronUp, RotateCcw, CheckCircle, XCircle, MinusCircle, Volume2, Mic, Square, Copy, Check } from 'lucide-react'

type InterviewType = 'behavioral' | 'technical' | 'system_design' | 'mixed'
type Difficulty = 'junior' | 'mid' | 'senior' | 'all'
type QuestionResult = 'nailed' | 'ok' | 'failed' | null

interface SessionQuestion { question: InterviewQuestion; result: QuestionResult; myAnswer: string }

const QUESTION_TIME_SECONDS = 120

// Minimal browser SpeechRecognition types (not in standard TS lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  readonly isFinal: boolean
}
interface SpeechRecognitionAlternative { readonly transcript: string }
interface SpeechRecognitionInstance extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean
  start(): void; stop(): void; abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null
}

export default function MockInterviewPage() {
  const [phase, setPhase] = useState<'setup' | 'session' | 'summary'>('setup')
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed')
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTips, setShowTips] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const { speak, stop: stopTTS, isSpeaking, isSupported: ttsSupported } = useSpeech()

  const speechRecognitionAvailable = typeof window !== 'undefined' && !!getSpeechRecognition()

  const startTimer = useCallback(() => {
    setTimeLeft(QUESTION_TIME_SECONDS)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0 }
        return t - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => () => { stopTimer() }, [stopTimer])

  const startSession = () => {
    let filtered = INTERVIEW_QUESTIONS
    if (interviewType !== 'mixed') filtered = filtered.filter(q => q.type === interviewType)
    if (difficulty !== 'all') filtered = filtered.filter(q => q.difficulty === difficulty || q.difficulty === 'all')
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)
    setSessionQuestions(shuffled.map(q => ({ question: q, result: null, myAnswer: '' })))
    setCurrentIndex(0); setShowTips(false); setTranscript(''); setPhase('session')
    startTimer()
  }

  const rate = (result: 'nailed' | 'ok' | 'failed') => {
    const updated = [...sessionQuestions]
    updated[currentIndex].result = result
    updated[currentIndex].myAnswer = transcript || updated[currentIndex].myAnswer
    setSessionQuestions(updated)
    setShowTips(false); setTranscript('')
    stopListening()
    stopTTS()
    if (currentIndex + 1 >= sessionQuestions.length) { stopTimer(); setPhase('summary') } else {
      setCurrentIndex(i => i + 1)
      startTimer()
    }
  }

  const updateAnswer = (value: string) => {
    const updated = [...sessionQuestions]
    updated[currentIndex].myAnswer = value
    setSessionQuestions(updated)
  }

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
    setIsListening(false)
  }, [])

  const toggleListening = () => {
    if (isListening) { stopListening(); return }
    const SR = getSpeechRecognition()
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' '
      setTranscript(full.trim())
    }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const copyAIPrompt = async (idx: number) => {
    const sq = sessionQuestions[idx]
    const answer = sq.myAnswer || transcript || '(no answer yet)'
    const prompt = `You are an English coach helping a Spanish-speaking developer improve their English for job interviews.\n\nQuestion: "${sq.question.question}"\n\nMy answer: "${answer}"\n\nPlease:\n1. Rate my answer's English (grammar, vocabulary, fluency) out of 10\n2. Point out specific mistakes or awkward phrases\n3. Suggest a more natural, professional version of my answer\n4. Give 2-3 vocabulary tips relevant to this topic`
    await navigator.clipboard.writeText(prompt)
    setCopiedPromptId(sq.question.id)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }

  const current = sessionQuestions[currentIndex]
  const nailed = sessionQuestions.filter(q => q.result === 'nailed').length
  const ok = sessionQuestions.filter(q => q.result === 'ok').length
  const failed = sessionQuestions.filter(q => q.result === 'failed').length

  const timerColor = timeLeft > 60 ? 'text-green-400' : timeLeft > 30 ? 'text-yellow-400' : 'text-red-400'

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
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 space-y-1">
          <p className="font-medium">💡 How this works:</p>
          <p className="text-gray-400">Each question has a 2-minute timer. You can speak your answer aloud (speech-to-text), type it, then copy a prompt to get AI feedback in ChatGPT or Claude.</p>
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
          <div className="text-5xl mb-4">{score >= 70 ? '🎉' : score >= 40 ? '💪' : '📚'}</div>
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
            <div key={i} className="p-3 bg-[#1a1a1a] rounded-lg space-y-2">
              <div className="flex items-start gap-3">
                {sq.result==='nailed'&&<CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0"/>}
                {sq.result==='ok'&&<MinusCircle size={18} className="text-yellow-500 mt-0.5 shrink-0"/>}
                {sq.result==='failed'&&<XCircle size={18} className="text-red-500 mt-0.5 shrink-0"/>}
                <p className="text-sm text-gray-300">{sq.question.question}</p>
              </div>
              {sq.myAnswer && (
                <div className="ml-6 space-y-1">
                  <p className="text-xs text-gray-500 italic">&ldquo;{sq.myAnswer.slice(0, 120)}{sq.myAnswer.length > 120 ? '…' : ''}&rdquo;</p>
                  <button onClick={() => copyAIPrompt(i)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {copiedPromptId === sq.question.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy AI feedback prompt</>}
                  </button>
                </div>
              )}
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
      {/* Progress + timer */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-[#1f1f1f] rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(currentIndex/sessionQuestions.length)*100}%` }}/></div>
        <span className="text-sm text-gray-400">{currentIndex+1}/{sessionQuestions.length}</span>
        <span className={`text-sm font-mono font-bold ${timerColor}`}>⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
      </div>

      <div className="flex gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-[#1f1f1f] text-gray-400 capitalize">{current.question.type.replace('_',' ')}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-[#1f1f1f] text-gray-400 capitalize">{current.question.difficulty}</span>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xl font-semibold text-white leading-relaxed flex-1">{current.question.question}</p>
          {ttsSupported && (
            <button onClick={() => isSpeaking ? stopTTS() : speak(current.question.question)} className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${isSpeaking ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#333]'}`}>
              <Volume2 size={16} />
            </button>
          )}
        </div>

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

      {/* My answer */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">My answer</p>
          <div className="flex items-center gap-2">
            {speechRecognitionAvailable && (
              <button onClick={toggleListening} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isListening ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
                {isListening ? <><Square size={12} /> Stop dictation <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /></> : <><Mic size={12} /> Speak</>}
              </button>
            )}
            <button onClick={() => copyAIPrompt(currentIndex)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${copiedPromptId === current.question.id ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'}`}>
              {copiedPromptId === current.question.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy AI prompt</>}
            </button>
          </div>
        </div>
        <textarea
          value={transcript || current.myAnswer}
          onChange={e => { setTranscript(''); updateAnswer(e.target.value) }}
          placeholder={speechRecognitionAvailable ? 'Type your answer or click "Speak" to dictate…' : 'Type your answer here…'}
          rows={4}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none focus:border-green-500/50"
        />
        {isListening && <p className="text-xs text-red-400 animate-pulse">🎙️ Listening… speak your answer</p>}
        <p className="text-xs text-gray-600">After typing/speaking your answer, copy the AI prompt and paste it into ChatGPT or Claude for detailed feedback.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => rate('nailed')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-green-500/30 hover:bg-green-500/10 text-green-400 font-medium transition-colors"><CheckCircle size={18}/> Nailed it</button>
        <button onClick={() => rate('ok')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400 font-medium transition-colors"><MinusCircle size={18}/> OK</button>
        <button onClick={() => rate('failed')} className="flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 font-medium transition-colors"><XCircle size={18}/> Need Practice</button>
      </div>
    </div>
  )
}
