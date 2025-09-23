import React from 'react';

interface VideoDescriptionProps {
  description: string;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({
  description
}) => {
  return (
    <div className="video-description">
      <div className="description-content">
        <div className="description-section">
          <div className="description-icon">📖</div>
          <div className="description-text">
            <h4>视频简介</h4>
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDescription;