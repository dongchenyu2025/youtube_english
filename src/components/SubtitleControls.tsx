import React from 'react';
import { DisplaySettings } from '../types';

interface SubtitleControlsProps {
  displaySettings: DisplaySettings;
  onToggleTranslation: () => void;
  onToggleReadingMode: () => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

const SubtitleControls: React.FC<SubtitleControlsProps> = ({
  displaySettings,
  onToggleTranslation,
  onToggleReadingMode,
  onFontSizeChange
}) => {
  return (
    <div className="subtitle-controls">
      <button
        className={`toggle-button ${displaySettings.showTranslation ? 'active' : ''}`}
        onClick={onToggleTranslation}
        aria-label="Toggle Chinese translation"
      >
        中英对照
      </button>

      <button
        className={`toggle-button ${displaySettings.readingMode ? 'active' : ''}`}
        onClick={onToggleReadingMode}
        aria-label="Toggle reading mode"
      >
        点读模式
      </button>

      <div className="font-size-controls">
        <span style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>
          字号:
        </span>
        {(['small', 'medium', 'large'] as const).map((size) => (
          <button
            key={size}
            className={`toggle-button ${displaySettings.fontSize === size ? 'active' : ''}`}
            onClick={() => onFontSizeChange(size)}
            aria-label={`Set font size to ${size}`}
          >
            {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubtitleControls;