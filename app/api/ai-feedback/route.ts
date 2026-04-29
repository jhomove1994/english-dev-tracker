import { NextRequest, NextResponse } from 'next/server'
import {
  analyzeText,
  formatRulesOnlyResponse,
  type FeedbackResponse,
  type StructuredAnalysis,
} from '@/lib/ai-feedback'

export const runtime = 'nodejs'

interface RequestBody {
  userText: string
  sentenceFrames: string[]
}

function isValidBody(value: unknown): value is RequestBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).userText === 'string' &&
    Array.isArray((value as Record<string, unknown>).sentenceFrames)
  )
}

// ---------------------------------------------------------------------------
// Layer 2 — Groq enrichment (only runs when GROQ_API_KEY is present)
// ---------------------------------------------------------------------------
async function enrichWithGroq(
  userText: string,
  analysis: StructuredAnalysis
): Promise<Omit<FeedbackResponse, 'source' | 'score'> | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  try {
    const { default: Groq } = await import('groq-sdk')
    const groq = new Groq({ apiKey })

    const systemPrompt =
      'You are a concise English coach for Spanish-speaking developers. ' +
      'You receive a structured analysis of a student writing exercise. ' +
      'Return ONLY a JSON object with: { whatWorked: string[] (max 2 items), ' +
      'errors: Array<{original: string, correction: string, explanation: string}> (max 3 items), ' +
      'improvedVersion: string, nextFocus: string }. ' +
      'Be specific, encouraging, and under 120 words total. No preamble.'

    const userMessage = JSON.stringify({
      studentText: userText,
      analysis,
    })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content ?? ''

    // Strip markdown code fences if present
    const jsonText = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const parsed = JSON.parse(jsonText) as {
      whatWorked?: unknown
      errors?: unknown
      improvedVersion?: unknown
      nextFocus?: unknown
    }

    const whatWorked = Array.isArray(parsed.whatWorked)
      ? (parsed.whatWorked as string[]).slice(0, 2)
      : []
    const errors = Array.isArray(parsed.errors)
      ? (parsed.errors as Array<{ original: string; correction: string; explanation: string }>).slice(0, 3)
      : []
    const improvedVersion = typeof parsed.improvedVersion === 'string' ? parsed.improvedVersion : ''
    const nextFocus = typeof parsed.nextFocus === 'string' ? parsed.nextFocus : ''

    if (!improvedVersion || !nextFocus) return null

    return { whatWorked, errors, improvedVersion, nextFocus }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Missing userText or sentenceFrames.' }, { status: 400 })
  }

  const { userText, sentenceFrames } = body

  // Layer 1 — always runs
  const analysis = analyzeText(userText, sentenceFrames)

  // Layer 2 — attempt Groq enrichment
  const groqResult = await enrichWithGroq(userText, analysis)

  let response: FeedbackResponse
  if (groqResult) {
    response = {
      score: analysis.score,
      whatWorked: groqResult.whatWorked,
      errors: groqResult.errors,
      improvedVersion: groqResult.improvedVersion,
      nextFocus: groqResult.nextFocus,
      source: 'hybrid',
    }
  } else {
    const rulesResult = formatRulesOnlyResponse(analysis)
    response = { ...rulesResult, source: 'rules-only' }
  }

  return NextResponse.json(response)
}
