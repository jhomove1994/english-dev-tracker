// Shared types and pure analysis logic for the AI feedback system.
// Layer 1 (rule-based) lives here so it can be imported by both the API
// route (server) and the frontend without pulling in any server-only code.

export interface StructuredAnalysis {
  framesUsed: string[]
  missingFrames: string[]
  hasUnfilledBlanks: boolean
  wordCount: number
  tooShort: boolean
  spanishErrors: string[]
  /** Integer 1–5 */
  score: number
}

export interface FeedbackError {
  original: string
  correction: string
  explanation: string
}

export interface FeedbackResponse {
  score: number
  whatWorked: string[]
  errors: FeedbackError[]
  improvedVersion: string
  nextFocus: string
  source: 'hybrid' | 'rules-only'
}

// ---------------------------------------------------------------------------
// Common English stop-words used when extracting anchor words from frames
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'have', 'from', 'they',
  'what', 'when', 'where', 'will', 'more', 'also', 'your', 'their', 'into',
  'than', 'then', 'there', 'can', 'not', 'but', 'are', 'was', 'were', 'had',
  'been', 'has', 'its', 'any', 'all', 'out', 'one', 'two', 'how', 'her',
  'his', 'our', 'you', 'use', 'now', 'very',
])

function extractAnchorWords(frame: string): string[] {
  return frame
    .replace(/___/g, ' ')
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
}

// ---------------------------------------------------------------------------
// Pure Layer-1 analyzer
// ---------------------------------------------------------------------------
export function analyzeText(userText: string, sentenceFrames: string[]): StructuredAnalysis {
  const lower = userText.toLowerCase()
  const words = userText.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const tooShort = wordCount < 20
  const hasUnfilledBlanks = userText.includes('___')

  // Frame detection
  const framesUsed: string[] = []
  const missingFrames: string[] = []
  for (const frame of sentenceFrames) {
    const anchors = extractAnchorWords(frame)
    const matchCount = anchors.filter((w) => lower.includes(w)).length
    const threshold = Math.max(1, Math.floor(anchors.length * 0.4))
    if (matchCount >= threshold) {
      framesUsed.push(frame)
    } else {
      missingFrames.push(frame)
    }
  }

  // Spanish-speaker error patterns
  const spanishErrors: string[] = []

  // "I developer / I programmer / I engineer" etc. — missing "am"
  const missingAmPattern = /\bI\s+(?:developer|programmer|engineer|designer|architect|analyst|lead|manager|consultant|specialist|expert|instructor|teacher|student)\b/gi
  const missingAmMatches = userText.match(missingAmPattern)
  if (missingAmMatches) {
    for (const match of missingAmMatches) {
      spanishErrors.push(`"${match}" (missing verb — say "I am a …")`)
    }
  }

  // "I is" / "I are" subject-verb mismatch
  if (/\bI is\b/i.test(userText)) spanishErrors.push('"I is" → should be "I am"')
  if (/\bI are\b/i.test(userText)) spanishErrors.push('"I are" → should be "I am"')

  // Lowercase letter after sentence-ending punctuation
  const afterPunc = /[.!?]\s+([a-z])/g
  let m: RegExpExecArray | null
  while ((m = afterPunc.exec(userText)) !== null) {
    spanishErrors.push(`Sentence starts with lowercase "${m[1]}" — capitalise after .!?`)
    if (spanishErrors.length >= 4) break
  }

  // Missing terminal punctuation
  const trimmed = userText.trim()
  if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
    spanishErrors.push('Missing punctuation at the end of the response.')
  }

  // Score 1–5
  let raw = 0
  if (framesUsed.length >= 1) raw += 1
  if (framesUsed.length >= 2) raw += 1
  if (!hasUnfilledBlanks) raw += 0.5
  if (!tooShort) raw += 0.5
  if (spanishErrors.length === 0) raw += 1
  // Score 1–5: each raw point maps directly; round half-up to avoid flooring 0.5-point additions
  const score = Math.max(1, Math.min(5, Math.round(raw + 0.5)))

  return { framesUsed, missingFrames, hasUnfilledBlanks, wordCount, tooShort, spanishErrors, score }
}

// ---------------------------------------------------------------------------
// Rules-only formatter — used when Groq is unavailable
// ---------------------------------------------------------------------------
export function formatRulesOnlyResponse(analysis: StructuredAnalysis): Omit<FeedbackResponse, 'source'> {
  const whatWorked: string[] = []
  if (analysis.framesUsed.length > 0) {
    whatWorked.push(
      `You used ${analysis.framesUsed.length === 1 ? '1 sentence frame' : `${analysis.framesUsed.length} sentence frames`} from today's lesson.`
    )
  }
  if (!analysis.tooShort) {
    whatWorked.push(`Good response length — ${analysis.wordCount} words is enough to practise the full structure.`)
  }
  if (analysis.spanishErrors.length === 0 && !analysis.hasUnfilledBlanks) {
    whatWorked.push('No obvious grammar or format issues detected.')
  }
  if (whatWorked.length === 0) {
    whatWorked.push('You attempted the task — that is the first step.')
  }

  const errors: FeedbackError[] = []
  if (analysis.hasUnfilledBlanks) {
    errors.push({
      original: 'Response contains unfilled blanks (___)',
      correction: 'Replace every ___ with words from your own developer profile.',
      explanation: 'Blanks mean the sentence is incomplete — the exercise requires real words, not placeholders.',
    })
  }
  if (analysis.tooShort) {
    errors.push({
      original: `Response is only ${analysis.wordCount} word${analysis.wordCount === 1 ? '' : 's'}.`,
      correction: 'Expand to at least 20 words by adding one more sentence frame or a personal example.',
      explanation: 'Short responses do not give enough practice with the grammar structures of today\'s lesson.',
    })
  }
  for (const err of analysis.spanishErrors.slice(0, 2)) {
    errors.push({
      original: err,
      correction: 'Review the relevant grammar rule and rewrite that sentence.',
      explanation: 'This is one of the most common patterns where Spanish grammar carries over into English writing.',
    })
  }

  const improvedVersion =
    analysis.missingFrames.length > 0
      ? `Try adding this frame to your next draft: "${analysis.missingFrames[0]}"`
      : 'Your answer uses the key frames. Add one specific technical detail or example to make it stronger.'

  const nextFocus =
    analysis.spanishErrors.length > 0
      ? `Grammar check: fix the following pattern — ${analysis.spanishErrors[0]}`
      : analysis.missingFrames.length > 0
        ? `Practice using the missing frame: "${analysis.missingFrames[0]}"`
        : 'Add one concrete technical example (tool name, project, or result) to every sentence.'

  return { score: analysis.score, whatWorked, errors, improvedVersion, nextFocus }
}
