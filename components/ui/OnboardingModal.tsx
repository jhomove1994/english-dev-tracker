'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CreditCard, Mic, MessageSquare, BarChart3, X, ChevronRight } from 'lucide-react'

const ONBOARDING_KEY = 'onboarding_done_v1'

const STEPS = [
  {
    icon: BookOpen,
    iconColor: 'text-emerald-400',
    title: 'Welcome to DevEnglish! 🇬🇧',
    description: 'Your personal English trainer built for developers. Track your progress from A2 all the way to C1 — at your own pace.',
  },
  {
    icon: BookOpen,
    iconColor: 'text-emerald-400',
    title: 'Study Plan',
    description: 'Follow a structured plan with daily classes. Each class has vocabulary, grammar, writing exercises, and AI feedback prompts.',
  },
  {
    icon: CreditCard,
    iconColor: 'text-yellow-400',
    title: 'Flashcards (SRS)',
    description: 'Study vocabulary with spaced repetition. Rate each card (Again / Hard / Good / Easy) and the system schedules your reviews automatically.',
  },
  {
    icon: Mic,
    iconColor: 'text-purple-400',
    title: 'Standup & Mock Interview',
    description: 'Practice speaking English in real dev scenarios. Record your standup updates and simulate job interviews with 2-minute timers.',
  },
  {
    icon: MessageSquare,
    iconColor: 'text-blue-400',
    title: 'Meeting Phrases & Templates',
    description: 'Learn real phrases used in developer meetings. Copy professional email/Slack templates with explanations for each section.',
  },
  {
    icon: BarChart3,
    iconColor: 'text-teal-400',
    title: 'Track Everything',
    description: 'Your progress is saved locally — streaks, mastered cards, study hours, error patterns, and more. Use Settings to back up your data anytime.',
  },
]

export function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const done = window.localStorage.getItem(ONBOARDING_KEY)
      if (!done) setVisible(true)
    } catch {
      // ignore
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      dismiss()
    }
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-7 max-w-md w-full shadow-2xl">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button onClick={dismiss} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <Icon size={28} className={current.iconColor} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-7">
          <h2 className="text-xl font-bold text-white">{current.title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{current.description}</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === step ? 'w-4 h-1.5 bg-green-500' : 'w-1.5 h-1.5 bg-[#2a2a2a]'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={dismiss}
            className="flex-1 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-gray-400 hover:text-white hover:border-[#3a3a3a] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold text-sm transition-colors"
          >
            {step < STEPS.length - 1 ? (
              <>Next <ChevronRight size={16} /></>
            ) : (
              "Let's start! 🚀"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
