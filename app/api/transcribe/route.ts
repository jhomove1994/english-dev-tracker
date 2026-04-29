import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const WHISPER_PROMPT =
  'Developer speaking about their role, tech stack, and current project. ' +
  'Technical terms: React, TypeScript, Node.js, API, backend, frontend, fullstack, deploy, repository, pull request'

// Minimum blob size to reject silence/empty recordings.
// A real webm container with no audio payload is around 100–200 bytes; 300 bytes is a safe floor.
const MIN_AUDIO_BLOB_SIZE = 300

// ---------------------------------------------------------------------------
// POST /api/transcribe
// Body: FormData { audio: Blob }
// Response: { transcript: string, duration: number } | { transcript: '', error: string }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GROQ_API_KEY

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ transcript: '', error: 'Invalid form data.' }, { status: 400 })
  }

  const audioField = formData.get('audio')
  if (!(audioField instanceof Blob)) {
    return NextResponse.json({ transcript: '', error: 'No audio field in request.' }, { status: 400 })
  }

  const audioBlob = audioField
  // Rough duration estimate: webm/opus at ~16 kHz 16-bit mono ≈ 32 kB/s; actual bitrate varies.
  const durationSeconds = audioBlob.size / (16000 * 2)

  // Reject obviously empty blobs (< MIN_AUDIO_BLOB_SIZE is just webm container overhead)
  if (audioBlob.size < MIN_AUDIO_BLOB_SIZE) {
    return NextResponse.json({ transcript: '', error: 'No audio detected' }, { status: 422 })
  }

  // If no Groq key, signal the client to fall back
  if (!apiKey) {
    return NextResponse.json({ transcript: '', error: 'GROQ_API_KEY not configured' }, { status: 503 })
  }

  try {
    const { default: Groq, toFile } = await import('groq-sdk')
    const groq = new Groq({ apiKey })

    // groq-sdk needs a File-like object with a name for content-type detection
    const audioFile = await toFile(audioBlob, 'recording.webm', { type: 'audio/webm' })

    const result = await groq.audio.transcriptions.create({
      model: 'whisper-large-v3-turbo',
      file: audioFile,
      language: 'en',
      prompt: WHISPER_PROMPT,
    })

    return NextResponse.json({ transcript: result.text, duration: durationSeconds })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription failed'
    return NextResponse.json({ transcript: '', error: message }, { status: 502 })
  }
}
