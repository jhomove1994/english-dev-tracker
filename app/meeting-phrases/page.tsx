'use client'

import { useState } from 'react'
import { MEETING_PHRASES, MEETING_PHRASE_CATEGORIES, type MeetingPhrase } from '@/lib/data/meeting-phrases'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { CUSTOM_FLASHCARD_SAVE_RESULT, saveUniqueCustomFlashcard } from '@/lib/custom-flashcards'
import { Volume2, VolumeX, Plus, Check } from 'lucide-react'

// Approximate ms per character for TTS duration estimation (used to clear speaking state)
const TTS_MS_PER_CHAR = 65
const TTS_MIN_MS = 2000

export default function MeetingPhrasesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [addedIds, setAddedIds] = useState<string[]>([])
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const { speak, stop, isSupported: ttsSupported } = useSpeech()

  const filtered = selectedCategory === 'All'
    ? MEETING_PHRASES
    : MEETING_PHRASES.filter(p => p.category === selectedCategory)

  const handleSpeak = (phrase: MeetingPhrase) => {
    if (speakingId === phrase.id) { stop(); setSpeakingId(null); return }
    setSpeakingId(phrase.id)
    speak(phrase.phrase)
    // Reset speaking indicator when done (approximate via phrase length)
    const ms = Math.max(TTS_MIN_MS, phrase.phrase.length * TTS_MS_PER_CHAR)
    setTimeout(() => setSpeakingId(null), ms)
  }

  const handleAdd = (phrase: MeetingPhrase) => {
    const result = saveUniqueCustomFlashcard({
      id: `mp-${phrase.id}`,
      front: phrase.phrase,
      back: `${phrase.context} — e.g. "${phrase.example}"`,
      category: `Meetings - ${phrase.category}`,
    })
    if (result === CUSTOM_FLASHCARD_SAVE_RESULT.ADDED || result === CUSTOM_FLASHCARD_SAVE_RESULT.EXISTS) {
      setAddedIds(prev => [...prev, phrase.id])
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Meeting Phrases</h2>
        <p className="text-sm text-gray-400 mt-1">Real phrases used in daily developer meetings. Click 🔊 to hear pronunciation, or ➕ to add to flashcards.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...MEETING_PHRASE_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-green-500 text-black' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Phrases list */}
      <div className="space-y-3">
        {filtered.map(phrase => (
          <div key={phrase.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base leading-snug">&ldquo;{phrase.phrase}&rdquo;</p>
                <p className="text-xs text-green-400 mt-1">{phrase.context}</p>
                <p className="text-sm text-gray-400 mt-2 italic">{phrase.example}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ttsSupported && (
                  <button
                    onClick={() => handleSpeak(phrase)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${speakingId === phrase.id ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#333] hover:text-white'}`}
                    title="Hear pronunciation"
                  >
                    {speakingId === phrase.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                )}
                <button
                  onClick={() => handleAdd(phrase)}
                  disabled={addedIds.includes(phrase.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors ${addedIds.includes(phrase.id) ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#333] hover:text-white'}`}
                  title={addedIds.includes(phrase.id) ? 'Added to flashcards' : 'Add to flashcards'}
                >
                  {addedIds.includes(phrase.id) ? <Check size={15} /> : <Plus size={15} />}
                </button>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-500 border border-[#2a2a2a]">{phrase.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No phrases found for this category.</div>
      )}
    </div>
  )
}
