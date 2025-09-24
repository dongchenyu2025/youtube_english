import React, { useState, useRef, useEffect } from 'react';

interface VideoDescriptionProps {
  description: string;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({
  description
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * 3; // 3行的高度
      setShowMoreButton(textRef.current.scrollHeight > maxHeight);
    }
  }, [description]);

  return (
    <div className="video-description">
      <div className="description-content">
        <div className="description-section">
          <div className="description-icon">📖</div>
          <div className="description-text">
            <h4>视频简介</h4>
            <p
              ref={textRef}
              className={`description-paragraph ${!isExpanded ? 'collapsed' : ''}`}
            >
              {description}
              {!isExpanded && showMoreButton && (
                <span
                  className="more-indicator"
                  onClick={() => setIsExpanded(true)}
                >
                  ...更多
                </span>
              )}
            </p>
            {isExpanded && showMoreButton && (
              <button
                className="collapse-button"
                onClick={() => setIsExpanded(false)}
              >
                收起
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDescription;