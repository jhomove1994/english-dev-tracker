'use client'

import { useState, useRef } from 'react'
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { formatTime, formatDuration } from '@/lib/utils'
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react'

const PROMPTS = [
  "Yesterday I worked on...",
  "Today I'm planning to...",
  "I'm currently blocked by... / There are no blockers",
  "One technical decision I made was... because...",
]

export default function StandupPage() {
  const { isRecording, currentDuration, recordings, startRecording, stopRecording, deleteRecording, updateNotes } = useAudioRecorder()
  const { speak, isSupported: ttsSupported } = useSpeech()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioElsRef = useRef<Record<string, HTMLAudioElement>>({})

  const handleStop = async () => { await stopRecording() }

  const togglePlay = (id: string, blobUrl: string) => {
    if (playingId === id) {
      audioElsRef.current[id]?.pause()
      setPlayingId(null)
    } else {
      if (playingId && audioElsRef.current[playingId]) audioElsRef.current[playingId].pause()
      let audio = audioElsRef.current[id]
      if (!audio) {
        audio = new Audio(blobUrl)
        audioElsRef.current[id] = audio
        audio.onended = () => setPlayingId(null)
      }
      audio.play()
      setPlayingId(id)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Standup Prompts</h3>
        <div className="space-y-3">
          {PROMPTS.map((prompt, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg">
              <span className="text-green-500 font-bold text-sm mt-0.5">{i+1}.</span>
              <p className="text-sm text-gray-300 italic flex-1">&quot;{prompt}&quot;</p>
              {ttsSupported && (
                <button
                  onClick={() => speak(prompt)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-[#333] text-gray-500 hover:text-white hover:border-green-500 transition-colors"
                  title="Hear pronunciation"
                >
                  <Volume2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center">
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-red-400 font-semibold">Recording</span>
          </div>
        )}
        <div className="text-5xl font-mono font-bold text-white mb-6">{formatTime(currentDuration)}</div>
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button onClick={startRecording} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              <Mic size={18}/> Start Recording
            </button>
          ) : (
            <button onClick={handleStop} className="flex items-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              <Square size={18}/> Stop &amp; Save
            </button>
          )}
        </div>
      </div>
      {recordings.length > 0 && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Past Recordings</h3>
          <div className="space-y-4">
            {recordings.map(rec => (
              <div key={rec.id} className="bg-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-white font-medium">{new Date(rec.recordedAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500">{formatDuration(rec.durationSeconds)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePlay(rec.id, rec.blobUrl)} className="w-9 h-9 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#333] rounded-full transition-colors">
                      {playingId===rec.id ? <Pause size={16} className="text-white"/> : <Play size={16} className="text-white"/>}
                    </button>
                    <button onClick={() => deleteRecording(rec.id)} className="w-9 h-9 flex items-center justify-center hover:bg-red-500/10 rounded-full transition-colors">
                      <Trash2 size={16} className="text-gray-500 hover:text-red-400"/>
                    </button>
                  </div>
                </div>
                <textarea value={rec.notes} onChange={e => updateNotes(rec.id, e.target.value)} placeholder="Add notes or self-evaluation..." rows={2}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none focus:border-green-500/50"/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
