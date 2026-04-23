'use client'

import { useState } from 'react'
import { useFlashcards } from '@/lib/hooks/useFlashcards'
import { FLASHCARD_CATEGORIES } from '@/lib/data/flashcards'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const { dueCards, rateCard, masteredCount, totalCards } = useFlashcards(selectedCategory)
  const cards = dueCards
  const currentCard = cards[currentIndex]

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return
    rateCard(currentCard.id, rating)
    setIsFlipped(false)
    if (currentIndex + 1 >= cards.length) { setSessionComplete(true) } else { setCurrentIndex(i => i + 1) }
  }

  const restart = () => { setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false) }
  const categories = ['All', ...FLASHCARD_CATEGORIES]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div><span className="text-2xl font-bold text-green-400">{masteredCount}</span><span className="text-gray-500 text-sm ml-1">mastered</span></div>
          <div><span className="text-2xl font-bold text-white">{totalCards}</span><span className="text-gray-500 text-sm ml-1">total</span></div>
          <div><span className="text-2xl font-bold text-yellow-400">{dueCards.length}</span><span className="text-gray-500 text-sm ml-1">due today</span></div>
        </div>
        <div className="w-32">
          <div className="bg-[#1f1f1f] rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((masteredCount / totalCards) * 100)}%` }} /></div>
          <p className="text-xs text-gray-500 mt-1 text-right">{Math.round((masteredCount / totalCards) * 100)}% mastered</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-green-500 text-black' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}>
            {cat}
          </button>
        ))}
      </div>
      {sessionComplete || cards.length === 0 ? (
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
          <div className="text-sm text-gray-500 text-center">{currentIndex + 1} / {cards.length}</div>
          <div onClick={() => setIsFlipped(!isFlipped)} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-[#333] transition-colors">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">{isFlipped ? 'Spanish / Context' : 'English phrase — tap to reveal'}</p>
              <p className="text-xl font-medium text-white leading-relaxed">{isFlipped ? currentCard.back : currentCard.front}</p>
              {!isFlipped && <p className="text-xs text-gray-600 mt-4">{currentCard.category}</p>}
            </div>
            <div className="mt-6 text-gray-600">{isFlipped ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </div>
          {isFlipped && (
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
        </div>
      )}
    </div>
  )
}
