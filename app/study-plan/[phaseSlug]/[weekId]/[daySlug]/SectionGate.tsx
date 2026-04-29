'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { StudyGrammarGateQuestion } from '@/lib/study-plan'
import { cn } from '@/lib/utils'

type GateStatus = 'idle' | 'wrong' | 'passed'

interface SectionGateProps {
  questions: StudyGrammarGateQuestion[]
  isAlreadyPassed: boolean
  onPass: () => void
}

export function SectionGate({ questions, isAlreadyPassed, onPass }: SectionGateProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({})
  const [status, setStatus] = useState<GateStatus>('idle')

  // If there are no questions (insufficient grammar rules), behave as already passed
  if (questions.length === 0 || isAlreadyPassed) {
    return (
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0 text-teal-400" />
          <p className="text-xs text-teal-300">Grammar check passed</p>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    let correctCount = 0
    for (const question of questions) {
      if (selectedAnswers[question.id] === question.correctIndex) {
        correctCount++
      }
    }
    if (correctCount >= 1) {
      setStatus('passed')
      onPass()
    } else {
      setStatus('wrong')
    }
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setStatus('idle')
  }

  const allAnswered = questions.every(
    (q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null
  )

  if (status === 'passed') {
    return (
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-teal-400" />
          <p className="font-medium text-teal-300">Good — continue</p>
        </div>
        <p className="mt-1 text-xs text-teal-200/60">
          Grammar check passed. The next section is ready below.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#242424] bg-[#111111] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">Grammar check</p>
        <button
          type="button"
          onClick={() => onPass()}
          className="text-xs text-gray-500 transition-colors underline-offset-2 hover:text-gray-300 hover:underline"
        >
          Skip check
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Answer both questions. Get at least 1 right to continue.
      </p>

      <div className="mt-4 space-y-5">
        {questions.map((question) => (
          <div key={question.id}>
            <p className="text-sm text-gray-200">{question.question}</p>
            <div className="mt-2 space-y-2">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[question.id] === optionIndex
                const isCorrect = optionIndex === question.correctIndex
                const showFeedback = status === 'wrong'

                return (
                  <button
                    key={`${question.id}-opt-${optionIndex}`}
                    type="button"
                    disabled={status === 'wrong'}
                    onClick={() =>
                      setSelectedAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                    }
                    className={cn(
                      'flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                      showFeedback && isSelected && isCorrect &&
                        'border-teal-500/40 bg-teal-500/10 text-teal-200',
                      showFeedback && isSelected && !isCorrect &&
                        'border-amber-500/40 bg-amber-500/10 text-amber-200',
                      showFeedback && !isSelected && isCorrect &&
                        'border-teal-500/20 bg-teal-500/5 text-teal-300',
                      !showFeedback && isSelected &&
                        'border-[#3a3a3a] bg-[#1a1a1a] text-white',
                      !showFeedback && !isSelected &&
                        'border-[#2a2a2a] bg-[#151515] text-gray-300 hover:border-[#3a3a3a]'
                    )}
                  >
                    <span className="mt-0.5 shrink-0 font-medium text-gray-500">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <span>{option}</span>
                  </button>
                )
              })}
            </div>
            {status === 'wrong' && (
              <p className="mt-2 text-xs text-amber-300/80">{question.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {status === 'idle' && (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={handleSubmit}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm text-teal-100 transition-colors hover:bg-teal-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Check answers
        </button>
      )}

      {status === 'wrong' && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <XCircle size={14} className="shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">
              Not enough correct answers — review the explanations above and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 text-xs text-gray-400 transition-colors underline-offset-2 hover:text-white hover:underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
