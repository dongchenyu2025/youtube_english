import React, { useState } from 'react';
import { WordCard } from '../../types';

interface WordCardProps {
  word: WordCard;
  showChinese: boolean;
  userStatus?: 'known' | 'unknown';
  onWordMark: (wordId: string, status: 'known' | 'unknown') => void;
  onJumpToSubtitle?: (subtitleId: number) => void;
}

const WordCardComponent: React.FC<WordCardProps> = ({
  word,
  showChinese,
  userStatus,
  onWordMark,
  onJumpToSubtitle
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cardShowChinese, setCardShowChinese] = useState(showChinese);

  // Update local state when global showChinese changes
  React.useEffect(() => {
    setCardShowChinese(showChinese);
  }, [showChinese]);

  const handlePronunciation = () => {
    try {
      // Primary: Use Youdao API for pronunciation
      const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word.word)}&type=2`;
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // Fallback: Use browser's built-in TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word.word);
          utterance.lang = 'en-US';
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }
      });
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
    }
  };

  const handleJumpToSubtitle = () => {
    if (onJumpToSubtitle) {
      onJumpToSubtitle(word.subtitleId);
    }
  };

  const toggleCardChinese = () => {
    setCardShowChinese(!cardShowChinese);
  };

  const getCardStatusClass = () => {
    if (userStatus === 'known') return 'known';
    if (userStatus === 'unknown') return 'unknown';
    return '';
  };

  return (
    <div
      className={`word-card ${getCardStatusClass()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with word and phonetic */}
      <div className="word-card-header">
        <div className="word-main">
          <h3 className="word-title">{word.word}</h3>
          <div className="phonetic-section">
            <span className="phonetic">{word.phonetic}</span>
            <button
              className="pronunciation-button"
              onClick={handlePronunciation}
              title="播放发音"
            >
              🔊
            </button>
          </div>
        </div>

        {/* Hover marking buttons */}
        {isHovered && (
          <div className="marking-buttons">
            <button
              className={`mark-button known ${userStatus === 'known' ? 'active' : ''}`}
              onClick={() => onWordMark(word.id, 'known')}
            >
              认识
            </button>
            <button
              className={`mark-button unknown ${userStatus === 'unknown' ? 'active' : ''}`}
              onClick={() => onWordMark(word.id, 'unknown')}
            >
              不认识
            </button>
          </div>
        )}
      </div>

      {/* Chinese definition */}
      {cardShowChinese && (
        <div className="chinese-definition">
          <p>{word.chineseDefinition}</p>
        </div>
      )}

      {/* English definition */}
      <div className="english-definition">
        <p>{word.englishDefinition}</p>
      </div>

      {/* Example section */}
      <div className="example-section">
        <div className="example-text">
          <p className="example-sentence">"{word.exampleFromVideo}"</p>
          {cardShowChinese && (
            <p className="example-translation">"{word.exampleTranslation}"</p>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="word-card-footer">
        <button
          className="jump-button"
          onClick={handleJumpToSubtitle}
          title="跳转到字幕并启用点读模式"
        >
          🎯 点读跳转
        </button>
        <button
          className={`eye-toggle ${!cardShowChinese ? 'closed' : ''}`}
          onClick={toggleCardChinese}
          title={cardShowChinese ? '隐藏中文' : '显示中文'}
        >
          {cardShowChinese ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    </div>
  );
};

export default WordCardComponent;