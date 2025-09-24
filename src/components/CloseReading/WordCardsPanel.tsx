import React from 'react';
import { WordCard } from '../../types';
import WordCardComponent from './WordCard';

interface WordCardsPanelProps {
  words: WordCard[];
  showChinese: boolean;
  userMarks: Record<string, 'known' | 'unknown'>;
  onWordMark: (wordId: string, status: 'known' | 'unknown') => void;
  onJumpToSubtitle?: (subtitleId: number) => void;
}

const WordCardsPanel: React.FC<WordCardsPanelProps> = ({
  words,
  showChinese,
  userMarks,
  onWordMark,
  onJumpToSubtitle
}) => {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <p>没有找到符合条件的单词</p>
      </div>
    );
  }

  return (
    <div className="word-cards-grid">
      {words.map(word => (
        <WordCardComponent
          key={word.id}
          word={word}
          showChinese={showChinese}
          userStatus={userMarks[word.id]}
          onWordMark={onWordMark}
          onJumpToSubtitle={onJumpToSubtitle}
        />
      ))}
    </div>
  );
};

export default WordCardsPanel;