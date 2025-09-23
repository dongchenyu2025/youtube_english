import React, { useState, useRef, useCallback } from 'react';
import VideoPlayer, { VideoPlayerRef } from './components/VideoPlayer';
import VideoControls from './components/VideoControls';
import SubtitleDisplay from './components/SubtitleDisplay';
import SubtitleControls from './components/SubtitleControls';
import FileUploader from './components/FileUploader';
import { useSubtitleManager } from './hooks/useSubtitleManager';
import { useReadingMode } from './hooks/useReadingMode';
import { sampleVideoData } from './data/sampleData';
import { PlayerState, DisplaySettings, Subtitle, VideoData } from './types';
import './App.css';

const App: React.FC = () => {
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const [videoData, setVideoData] = useState<VideoData>(sampleVideoData);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [hasUploadedVideo, setHasUploadedVideo] = useState<boolean>(false);
  const [hasUploadedSubtitles, setHasUploadedSubtitles] = useState<boolean>(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    currentSubtitleId: null
  });

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showTranslation: false,
    readingMode: false,
    fontSize: 'medium'
  });

  const { currentSubtitle, getCurrentSubtitleId } = useSubtitleManager(
    videoData.subtitles,
    playerState.currentTime
  );

  const showMessage = useCallback((msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  }, []);

  const handleVideoLoad = useCallback((videoUrl: string, title: string) => {
    setVideoData(prev => ({
      ...prev,
      url: videoUrl,
      title: title
    }));
    setHasUploadedVideo(true);
    showMessage('视频加载成功！', 'success');
  }, [showMessage]);

  const handleSubtitleLoad = useCallback((subtitles: Subtitle[]) => {
    setVideoData(prev => ({
      ...prev,
      subtitles
    }));
    setHasUploadedSubtitles(true);
    showMessage(`字幕加载成功！共 ${subtitles.length} 条字幕`, 'success');
  }, [showMessage]);

  const handleError = useCallback((errorMessage: string) => {
    showMessage(errorMessage, 'error');
  }, [showMessage]);

  const handleLoadDemo = useCallback(() => {
    setVideoData(sampleVideoData);
    showMessage('已加载演示视频和字幕', 'success');
  }, [showMessage]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime,
      currentSubtitleId: getCurrentSubtitleId()
    }));
  }, [getCurrentSubtitleId]);

  const handleDurationChange = useCallback((duration: number) => {
    setPlayerState(prev => ({ ...prev, duration }));
  }, []);

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    console.log('Video metadata loaded');
  }, []);

  const handlePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      videoPlayerRef.current?.pause();
    } else {
      videoPlayerRef.current?.play();
    }
  }, [playerState.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    videoPlayerRef.current?.seekTo(time);
  }, []);

  const handleSubtitleClick = useCallback((subtitle: Subtitle) => {
    videoPlayerRef.current?.seekTo(subtitle.startTime);

    // 如果是点读模式，先暂停再播放当前片段
    if (displaySettings.readingMode) {
      videoPlayerRef.current?.pause();
      // 更新当前字幕状态，确保 useReadingMode 能正确跟踪
      setTimeout(() => {
        videoPlayerRef.current?.play();
      }, 50); // 短暂延迟确保跳转完成
    }
  }, [displaySettings.readingMode]);

  const handleToggleTranslation = useCallback(() => {
    setDisplaySettings(prev => ({
      ...prev,
      showTranslation: !prev.showTranslation
    }));
  }, []);

  const handleToggleReadingMode = useCallback(() => {
    setDisplaySettings(prev => ({
      ...prev,
      readingMode: !prev.readingMode
    }));
  }, []);

  const handleFontSizeChange = useCallback((fontSize: 'small' | 'medium' | 'large') => {
    setDisplaySettings(prev => ({ ...prev, fontSize }));
  }, []);

  const handleSubtitleEnd = useCallback(() => {
    videoPlayerRef.current?.pause();
  }, []);

  useReadingMode({
    enabled: displaySettings.readingMode,
    currentSubtitle,
    currentTime: playerState.currentTime,
    onSubtitleEnd: handleSubtitleEnd,
    videoPlayerRef
  });

  const showUploadSection = !hasUploadedVideo || !hasUploadedSubtitles;

  return (
    <div className="app">
      <div className="video-section">
        {showUploadSection && (
          <FileUploader
            onVideoLoad={handleVideoLoad}
            onSubtitleLoad={handleSubtitleLoad}
            onError={handleError}
            hasUploadedVideo={hasUploadedVideo}
            hasUploadedSubtitles={hasUploadedSubtitles}
          />
        )}

        {message && (
          <div className={`${messageType}-message`}>
            {message}
          </div>
        )}

        {(hasUploadedVideo || videoData.url) && (
          <>
            <VideoPlayer
              ref={videoPlayerRef}
              src={videoData.url}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlay={handlePlay}
              onPause={handlePause}
              onLoadedMetadata={handleLoadedMetadata}
              onVideoClick={handlePlayPause}
            />

            <VideoControls
              isPlaying={playerState.isPlaying}
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
            />
          </>
        )}

        {!hasUploadedVideo && !hasUploadedSubtitles && (
          <div className="demo-section">
            <button className="demo-button" onClick={handleLoadDemo}>
              🎬 载入演示视频
            </button>
          </div>
        )}
      </div>

      <div className="subtitle-section">
        <SubtitleControls
          displaySettings={displaySettings}
          onToggleTranslation={handleToggleTranslation}
          onToggleReadingMode={handleToggleReadingMode}
          onFontSizeChange={handleFontSizeChange}
        />

        <SubtitleDisplay
          subtitles={videoData.subtitles}
          currentSubtitleId={playerState.currentSubtitleId}
          displaySettings={displaySettings}
          onSubtitleClick={handleSubtitleClick}
        />
      </div>
    </div>
  );
};

export default App;