import React, { useState, useEffect } from 'react';
import { WordCard, CloseReadingData } from '../../types';
import WordCardsPanel from './WordCardsPanel';

interface CloseReadingSectionProps {
  wordCards: WordCard[];
  onJumpToSubtitle?: (subtitleId: number) => void;
}

const CloseReadingSection: React.FC<CloseReadingSectionProps> = ({
  wordCards,
  onJumpToSubtitle
}) => {
  const [closeReadingData, setCloseReadingData] = useState<CloseReadingData>({
    activeTab: 'words',
    wordFilter: 'all',
    showChinese: true,
    userWordMarks: {}
  });

  // Load user marks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wordMarks');
    if (saved) {
      try {
        const userMarks = JSON.parse(saved);
        setCloseReadingData(prev => ({ ...prev, userWordMarks: userMarks }));
      } catch (error) {
        console.error('Failed to load word marks:', error);
      }
    }
  }, []);

  // Save user marks to localStorage
  useEffect(() => {
    localStorage.setItem('wordMarks', JSON.stringify(closeReadingData.userWordMarks));
  }, [closeReadingData.userWordMarks]);

  const handleTabChange = (tab: 'words' | 'phrases' | 'expressions') => {
    setCloseReadingData(prev => ({ ...prev, activeTab: tab }));
  };

  const handleFilterChange = (filter: 'all' | 'unmarked' | 'known' | 'unknown') => {
    setCloseReadingData(prev => ({ ...prev, wordFilter: filter }));
  };

  const handleChineseToggle = () => {
    setCloseReadingData(prev => ({ ...prev, showChinese: !prev.showChinese }));
  };

  const handleWordMark = (wordId: string, status: 'known' | 'unknown') => {
    setCloseReadingData(prev => {
      const currentStatus = prev.userWordMarks[wordId];

      // Toggle functionality: if clicking the same status, remove the mark
      if (currentStatus === status) {
        const { [wordId]: removed, ...remainingMarks } = prev.userWordMarks;
        return {
          ...prev,
          userWordMarks: remainingMarks
        };
      } else {
        // Set new status
        return {
          ...prev,
          userWordMarks: { ...prev.userWordMarks, [wordId]: status }
        };
      }
    });
  };

  // Filter words based on current filter
  const filteredWords = wordCards.filter(word => {
    const userStatus = closeReadingData.userWordMarks[word.id];
    switch (closeReadingData.wordFilter) {
      case 'unmarked':
        return !userStatus;
      case 'known':
        return userStatus === 'known';
      case 'unknown':
        return userStatus === 'unknown';
      default:
        return true;
    }
  });

  const getWordCount = (filter: 'all' | 'unmarked' | 'known' | 'unknown') => {
    return wordCards.filter(word => {
      const userStatus = closeReadingData.userWordMarks[word.id];
      switch (filter) {
        case 'unmarked':
          return !userStatus;
        case 'known':
          return userStatus === 'known';
        case 'unknown':
          return userStatus === 'unknown';
        default:
          return true;
      }
    }).length;
  };

  return (
    <section className="close-reading-section">
      <div className="close-reading-header">
        <h2 className="close-reading-title">📖 内容精读</h2>

        <div className="tab-navigation">
          <button
            className={`tab-button ${closeReadingData.activeTab === 'words' ? 'active' : ''}`}
            onClick={() => handleTabChange('words')}
          >
            单词 ({wordCards.length})
          </button>
          <button
            className={`tab-button ${closeReadingData.activeTab === 'phrases' ? 'active' : ''}`}
            onClick={() => handleTabChange('phrases')}
            disabled
          >
            短语 (0)
          </button>
          <button
            className={`tab-button ${closeReadingData.activeTab === 'expressions' ? 'active' : ''}`}
            onClick={() => handleTabChange('expressions')}
            disabled
          >
            地道表达 (0)
          </button>
        </div>

        {closeReadingData.activeTab === 'words' && (
          <div className="filter-controls">
            <div className="filter-tags">
              <button
                className={`filter-tag ${closeReadingData.wordFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                全部 ({getWordCount('all')})
              </button>
              <button
                className={`filter-tag ${closeReadingData.wordFilter === 'unmarked' ? 'active' : ''}`}
                onClick={() => handleFilterChange('unmarked')}
              >
                未标记 ({getWordCount('unmarked')})
              </button>
              <button
                className={`filter-tag ${closeReadingData.wordFilter === 'known' ? 'active' : ''}`}
                onClick={() => handleFilterChange('known')}
              >
                认识 ({getWordCount('known')})
              </button>
              <button
                className={`filter-tag ${closeReadingData.wordFilter === 'unknown' ? 'active' : ''}`}
                onClick={() => handleFilterChange('unknown')}
              >
                不认识 ({getWordCount('unknown')})
              </button>
            </div>

            <div className="global-controls">
              <button
                className={`chinese-toggle ${!closeReadingData.showChinese ? 'hidden' : ''}`}
                onClick={handleChineseToggle}
                title={closeReadingData.showChinese ? '隐藏中文' : '显示中文'}
              >
                👁️ {closeReadingData.showChinese ? '隐藏中文' : '显示中文'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="close-reading-content">
        {closeReadingData.activeTab === 'words' && (
          <WordCardsPanel
            words={filteredWords}
            showChinese={closeReadingData.showChinese}
            userMarks={closeReadingData.userWordMarks}
            onWordMark={handleWordMark}
            onJumpToSubtitle={onJumpToSubtitle}
          />
        )}

        {closeReadingData.activeTab === 'phrases' && (
          <div className="coming-soon">
            <p>短语模块即将推出...</p>
          </div>
        )}

        {closeReadingData.activeTab === 'expressions' && (
          <div className="coming-soon">
            <p>地道表达模块即将推出...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CloseReadingSection;