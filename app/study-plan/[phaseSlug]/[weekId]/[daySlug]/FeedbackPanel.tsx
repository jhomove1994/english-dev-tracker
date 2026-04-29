'use client'

import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import type { FeedbackResponse } from '@/lib/ai-feedback'

interface FeedbackPanelProps {
  feedback: FeedbackResponse
  loading: boolean
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Score ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < score
              ? 'h-2 w-2 rounded-full bg-teal-400'
              : 'h-2 w-2 rounded-full bg-[#2a2a2a]'
          }
        />
      ))}
      <span className="ml-1.5 text-xs text-gray-500">{score}/5</span>
    </div>
  )
}

export function FeedbackPanel({ feedback, loading }: FeedbackPanelProps) {
  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-[#242424] bg-[#111111] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          <p className="text-xs text-gray-500">Checking your writing…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-[#242424] bg-[#111111] p-4 space-y-4">
      {/* Header row: score + source badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ScoreDots score={feedback.score} />
        <span
          aria-label={feedback.source === 'hybrid' ? 'AI enhanced feedback' : 'Basic rules-only check'}
          className="inline-flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#151515] px-2.5 py-0.5 text-xs text-gray-400"
        >
          {feedback.source === 'hybrid' ? (
            <>
              <Sparkles size={10} className="text-teal-400" />
              AI enhanced
            </>
          ) : (
            'Basic check'
          )}
        </span>
      </div>

      {/* What worked */}
      {feedback.whatWorked.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-teal-400">What worked</p>
          <div className="mt-2 space-y-1.5">
            {feedback.whatWorked.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-teal-400" />
                <p className="text-xs leading-5 text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {feedback.errors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-400">To improve</p>
          <div className="mt-2 space-y-3">
            {feedback.errors.map((err, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5"
              >
                <p className="text-xs text-amber-200 line-through opacity-70">{err.original}</p>
                <p className="mt-1 text-xs font-medium text-amber-100">{err.correction}</p>
                <p className="mt-1 text-xs text-gray-400">{err.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improved version */}
      {feedback.improvedVersion && (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#151515] px-3 py-2.5">
          <p className="text-xs uppercase tracking-wide text-gray-500">Try this</p>
          <p className="mt-1.5 text-xs leading-5 text-gray-200">{feedback.improvedVersion}</p>
        </div>
      )}

      {/* Next focus */}
      {feedback.nextFocus && (
        <div className="flex items-start gap-2">
          <ChevronRight size={13} className="mt-0.5 shrink-0 text-gray-500" />
          <p className="text-xs leading-5 text-gray-400">
            <span className="text-gray-500">Next focus: </span>
            {feedback.nextFocus}
          </p>
        </div>
      )}
    </div>
  )
}
