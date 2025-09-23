import React from 'react';

interface VideoHeaderProps {
  title: string;
  duration: number;
  difficulty: string;
  currentTime: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoHeader: React.FC<VideoHeaderProps> = ({
  title,
  duration,
  difficulty,
  currentTime
}) => {
  const progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  return (
    <div className="video-header">
      <div className="video-header-content">
        <div className="video-title-section">
          <h2 className="video-title">{title}</h2>
          <div className="video-meta">
            <span className="video-duration">
              时长: {formatTime(duration)}
            </span>
            <span className="video-difficulty">
              难度: {difficulty}
            </span>
            <span className="video-progress">
              进度: {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHeader;