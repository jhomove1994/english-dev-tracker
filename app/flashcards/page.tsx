'use client'

import { useState, useRef } from 'react'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder'
import { ChevronDown, ChevronUp, RotateCcw, Volume2, VolumeX, Mic, Square, Play, Pause, Eye, EyeOff } from 'lucide-react'

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [immersionMode, setImmersionMode] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [playingRecId, setPlayingRecId] = useState<string | null>(null)
  const [browseMode, setBrowseMode] = useState(false)
  const audioElsRef = useRef<Record<string, HTMLAudioElement>>({})

  const { allCards, dueCards, rateCard, masteredCount, totalCards, categories } = useFlashcards(selectedCategory)
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useSpeech()
  const { isRecording, currentDuration, recordings, startRecording, stopRecording, deleteRecording } = useAudioRecorder()

  const cards = browseMode ? allCards : dueCards
  const currentCard = cards[currentIndex]

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return
    rateCard(currentCard.id, rating)
    setIsFlipped(false)
    setShowPronunciation(false)
    stop()
    if (currentIndex + 1 >= cards.length) { setSessionComplete(true) } else { setCurrentIndex(i => i + 1) }
  }

  const restart = () => { setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false); setShowPronunciation(false) }
  const categoryOptions = ['All', ...categories]

  const togglePlay = (id: string, blobUrl: string) => {
    if (playingRecId === id) {
      audioElsRef.current[id]?.pause()
      setPlayingRecId(null)
    } else {
      if (playingRecId && audioElsRef.current[playingRecId]) audioElsRef.current[playingRecId].pause()
      let audio = audioElsRef.current[id]
      if (!audio) {
        audio = new Audio(blobUrl)
        audioElsRef.current[id] = audio
        audio.onended = () => setPlayingRecId(null)
      }
      audio.play()
      setPlayingRecId(id)
    }
  }

  const cardRecordings = recordings.slice(0, 3)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Stats bar */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div><span className="text-2xl font-bold text-green-400">{masteredCount}</span><span className="text-gray-500 text-sm ml-1">mastered</span></div>
          <div><span className="text-2xl font-bold text-white">{totalCards}</span><span className="text-gray-500 text-sm ml-1">total</span></div>
          <div><span className="text-2xl font-bold text-yellow-400">{dueCards.length}</span><span className="text-gray-500 text-sm ml-1">due today</span></div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setBrowseMode(m => !m); setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false) }}
            title={browseMode ? 'Browse mode ON – showing all cards' : 'Switch to Browse All mode'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${browseMode ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}
          >
            Browse {browseMode ? 'ON' : 'All'}
          </button>
          <button
            onClick={() => setImmersionMode(m => !m)}
            title={immersionMode ? 'Immersion mode ON – no Spanish translations' : 'Immersion mode OFF – showing Spanish'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${immersionMode ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-[#2a2a2a] text-gray-500 hover:text-gray-300'}`}
          >
            {immersionMode ? <EyeOff size={12} /> : <Eye size={12} />}
            Immersion
          </button>
          <div className="w-32">
            <div className="bg-[#1f1f1f] rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((masteredCount / totalCards) * 100)}%` }} /></div>
            <p className="text-xs text-gray-500 mt-1 text-right">{Math.round((masteredCount / totalCards) * 100)}% mastered</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categoryOptions.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-green-500 text-black' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}>
            {cat}
          </button>
        ))}
      </div>

      {!browseMode && (sessionComplete || cards.length === 0) ? (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-white mb-2">{cards.length === 0 ? 'No cards due!' : 'Session complete!'}</h3>
          <p className="text-gray-400 mb-6">{cards.length === 0 ? 'Great job! Come back later for your next review.' : `You reviewed ${cards.length} cards. Keep it up!`}</p>
          <button onClick={restart} className="flex items-center gap-2 mx-auto bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-xl">
            <RotateCcw size={16} /> Review Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 text-center">{currentIndex + 1} / {cards.length}{browseMode && <span className="ml-2 text-orange-400 text-xs">(Browse All)</span>}</div>

          {/* Card */}
          <div onClick={() => setIsFlipped(!isFlipped)} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-[#333] transition-colors">
            <div className="text-center w-full">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
                {isFlipped ? (immersionMode ? 'Context (English only)' : 'Spanish / Context') : 'English phrase — tap to reveal'}
              </p>
              <p className="text-xl font-medium text-white leading-relaxed">
                {isFlipped
                  ? (immersionMode
                    ? currentCard.back.split(/[(/]/)[0].trim()
                    : currentCard.back)
                  : currentCard.front}
              </p>
              {!isFlipped && <p className="text-xs text-gray-600 mt-4">{currentCard.category}</p>}
            </div>
            <div className="mt-6 text-gray-600">{isFlipped ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </div>

          {/* TTS + Pronunciation controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {ttsSupported && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); isSpeaking ? stop() : speak(currentCard.front) }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isSpeaking ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-white'}`}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  {isSpeaking ? 'Stop' : '🔊 Hear it'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(currentCard.front, 0.7) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-white transition-colors"
                >
                  🐢 Slow
                </button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowPronunciation(p => !p) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showPronunciation ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-white'}`}
            >
              <Mic size={15} />
              Practice
            </button>
          </div>

          {/* Pronunciation trainer panel */}
          {showPronunciation && (
            <div className="bg-[#111111] border border-purple-500/20 rounded-xl p-4 space-y-3">
              <p className="text-xs text-purple-400 uppercase tracking-wide font-medium">🎙️ Pronunciation Trainer</p>
              <p className="text-sm text-gray-400">Listen first, then record yourself and compare.</p>
              <div className="flex items-center gap-3 flex-wrap">
                {ttsSupported && (
                  <button onClick={() => speak(currentCard.front)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors">
                    <Volume2 size={14} /> Native audio
                  </button>
                )}
                {!isRecording ? (
                  <button onClick={startRecording} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                    <Mic size={14} /> Record me
                  </button>
                ) : (
                  <button onClick={() => stopRecording()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#2a2a2a] text-white border border-[#3a3a3a] transition-colors">
                    <Square size={14} /> Stop ({currentDuration}s)
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </button>
                )}
              </div>
              {cardRecordings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Your recordings (last 3):</p>
                  {cardRecordings.map(rec => (
                    <div key={rec.id} className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2">
                      <button onClick={() => togglePlay(rec.id, rec.blobUrl)} className="w-7 h-7 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#333] rounded-full transition-colors">
                        {playingRecId === rec.id ? <Pause size={12} className="text-white" /> : <Play size={12} className="text-white" />}
                      </button>
                      <span className="text-xs text-gray-400">{rec.durationSeconds}s</span>
                      <button onClick={() => deleteRecording(rec.id)} className="ml-auto text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isFlipped && !browseMode && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { rating: 'again' as const, label: '❌ Again', cls: 'border-red-500/30 hover:bg-red-500/10 text-red-400' },
                { rating: 'hard' as const, label: '😐 Hard', cls: 'border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400' },
                { rating: 'good' as const, label: '✅ Good', cls: 'border-green-500/30 hover:bg-green-500/10 text-green-400' },
                { rating: 'easy' as const, label: '🚀 Easy', cls: 'border-blue-500/30 hover:bg-blue-500/10 text-blue-400' },
              ].map(({ rating, label, cls }) => (
                <button key={rating} onClick={() => handleRate(rating)} className={`border rounded-xl py-3 text-sm font-medium transition-colors ${cls}`}>{label}</button>
              ))}
            </div>
          )}
          {browseMode && (
            <div className="flex gap-3">
              <button
                onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setIsFlipped(false) }}
                disabled={currentIndex === 0}
                className="flex-1 border border-[#2a2a2a] rounded-xl py-3 text-sm font-medium text-gray-400 hover:text-white hover:border-[#3a3a3a] disabled:opacity-30 transition-colors"
              >← Prev</button>
              <button
                onClick={() => { setCurrentIndex(i => Math.min(cards.length - 1, i + 1)); setIsFlipped(false) }}
                disabled={currentIndex >= cards.length - 1}
                className="flex-1 border border-[#2a2a2a] rounded-xl py-3 text-sm font-medium text-gray-400 hover:text-white hover:border-[#3a3a3a] disabled:opacity-30 transition-colors"
              >Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
