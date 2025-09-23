'use client'

import React, { useState } from 'react'
import { Subtitle, DisplaySettings } from '@/types'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { WordModal } from './WordModal'

interface SubtitleDisplayProps {
  subtitles: Subtitle[]
  currentSubtitleId: number | null
  displaySettings: DisplaySettings
  onSubtitleClick: (subtitle: Subtitle) => void
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({
  subtitles,
  currentSubtitleId,
  displaySettings,
  onSubtitleClick
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [showWordModal, setShowWordModal] = useState(false)

  const scrollContainerRef = useAutoScroll(currentSubtitleId, {
    enabled: true,
    offset: 100
  })

  const getFontSizeClass = () => {
    switch (displaySettings.fontSize) {
      case 'small': return 'text-sm'
      case 'large': return 'text-xl'
      default: return 'text-base'
    }
  }

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
    if (cleanWord.length > 2) {
      setSelectedWord(cleanWord)
      setShowWordModal(true)
    }
  }

  const renderClickableText = (text: string, isEnglish: boolean = true) => {
    if (!isEnglish) return text

    return text.split(' ').map((word, index) => (
      <span
        key={index}
        className="cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors"
        onClick={(e) => handleWordClick(word, e)}
      >
        {word}
        {index < text.split(' ').length - 1 ? ' ' : ''}
      </span>
    ))
  }

  return (
    <>
      <div className={`${getFontSizeClass()} bg-white rounded-lg shadow-sm border`}>
        <div
          ref={scrollContainerRef}
          className="max-h-96 overflow-y-auto p-4 space-y-3"
        >
          {subtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              data-subtitle-id={subtitle.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentSubtitleId === subtitle.id
                  ? 'subtitle-highlight'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSubtitleClick(subtitle)}
              role="button"
              tabIndex={0}
              aria-label={`Subtitle: ${subtitle.english_text}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSubtitleClick(subtitle)
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xs text-gray-500 font-mono mt-1 flex-shrink-0">
                  {formatTime(subtitle.start_time)}
                </span>
                <div className="flex-1">
                  {displaySettings.showTranslation ? (
                    <div className="bilingual-container">
                      <div className="english-text">
                        {renderClickableText(subtitle.english_text)}
                      </div>
                      {subtitle.chinese_text && (
                        <div className="chinese-text">
                          {subtitle.chinese_text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="subtitle-text">
                      {renderClickableText(subtitle.english_text)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {subtitles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无字幕内容
            </div>
          )}
        </div>
      </div>

      <WordModal
        word={selectedWord}
        isOpen={showWordModal}
        onClose={() => setShowWordModal(false)}
      />
    </>
  )
}

export default SubtitleDisplay