import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoControls from './components/VideoControls';
import VideoHeader from './components/VideoHeader';
import VideoDescription from './components/VideoDescription';
import CloseReadingSection from './components/CloseReading/CloseReadingSection';
import { sampleVideoData } from './data/sampleData';
import './App.css';

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleControlsRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const subtitleItemsContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranslation, setShowTranslation] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeatCount, setCurrentRepeatCount] = useState(0);
  const [repeatSubtitle, setRepeatSubtitle] = useState<Subtitle | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [readingModeActiveSubtitle, setReadingModeActiveSubtitle] = useState<Subtitle | null>(null);
  const [subtitleListHeight, setSubtitleListHeight] = useState<number>(400);
  const [previousActiveId, setPreviousActiveId] = useState<number | null>(null);
  const [showReadingModeIndicator, setShowReadingModeIndicator] = useState(false);
  const [hasShownReadingModeIndicator, setHasShownReadingModeIndicator] = useState(false);
  const [contentStudyMode, setContentStudyMode] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollCheckRef = useRef<number>(0);

  // 视频信息数据
  const videoInfo = {
    title: "Bookmark Making Tutorial - 英语书签制作教程",
    difficulty: "中级",
    description: "这是一个关于书签制作的英语教程，适合中级英语学习者观看。视频中包含实用的日常英语表达和词汇，帮助提升英语听力和口语能力。"
  };

  // 解析SRT文件
  const parseSRT = (content: string): Subtitle[] => {
    const blocks = content.trim().split('\n\n');
    return blocks.map((block, index) => {
      const lines = block.split('\n');
      const timeMatch = lines[1]?.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

      if (!timeMatch) return null;

      const startTime = parseTimeToSeconds(timeMatch[1]);
      const endTime = parseTimeToSeconds(timeMatch[2]);
      const text = lines[2] || '';
      const translation = lines[3] || '';

      return {
        id: index + 1,
        startTime,
        endTime,
        text,
        translation
      };
    }).filter(Boolean) as Subtitle[];
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
  };

  // 视频播放控制函数
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  // 加载字幕文件
  useEffect(() => {
    fetch('/subtitles/bookmark.srt')
      .then(response => response.text())
      .then(content => {
        const parsedSubtitles = parseSRT(content);
        setSubtitles(parsedSubtitles);
      })
      .catch(error => console.error('加载字幕失败:', error));
  }, []);

  // 时间更新
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);

      // 重复播放模式检查
      if (repeatMode && repeatSubtitle && current >= repeatSubtitle.endTime) {
        if (currentRepeatCount < repeatCount) {
          // 还需要重复播放
          setCurrentRepeatCount(prev => prev + 1);
          video.currentTime = repeatSubtitle.startTime;
          return;
        } else {
          // 重复播放完成
          video.pause();
          setIsPlaying(false);
          setRepeatSubtitle(null);
          setCurrentRepeatCount(0);
          return;
        }
      }

      // 点读模式自动暂停
      if (readingMode && targetEndTime && current >= targetEndTime) {
        video.pause();
        setIsPlaying(false);
        setTargetEndTime(null);
        // 保持当前选中字幕的高亮状态，不清除 readingModeActiveSubtitle
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [readingMode, targetEndTime, repeatMode, repeatSubtitle, currentRepeatCount, repeatCount]);

  // 监听播放状态变化，在正常播放过程中清除点读模式的选中状态
  useEffect(() => {
    if (isPlaying && !targetEndTime && readingModeActiveSubtitle) {
      // 如果在正常播放且不是点读模式的自动播放，清除选中状态
      setReadingModeActiveSubtitle(null);
    }
  }, [isPlaying, targetEndTime, readingModeActiveSubtitle]);

  // 切换点读模式时清除选中状态
  useEffect(() => {
    if (!readingMode) {
      setReadingModeActiveSubtitle(null);
    }
  }, [readingMode]);

  // 切换重复播放模式时清除相关状态
  useEffect(() => {
    if (!repeatMode) {
      setRepeatSubtitle(null);
      setCurrentRepeatCount(0);
    }
  }, [repeatMode]);

  // 获取当前字幕
  const getCurrentSubtitle = (): Subtitle | undefined => {
    return subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);
  };

  // 字幕点击处理
  const handleSubtitleClick = (subtitle: Subtitle) => {
    const video = videoRef.current;
    if (!video) return;

    // 跳转到字幕对应的时间点
    video.currentTime = subtitle.startTime;

    if (repeatMode) {
      // 重复播放模式：设置要重复的字幕并开始播放
      setRepeatSubtitle(subtitle);
      setCurrentRepeatCount(1); // 从第一次播放开始计数
      video.play();
      setIsPlaying(true);
    } else if (readingMode) {
      // 点读模式：播放到字幕结束时间并自动暂停
      setTargetEndTime(subtitle.endTime);
      setReadingModeActiveSubtitle(subtitle); // 设置选中的字幕
      video.play();
      setIsPlaying(true);
    } else {
      // 正常播放模式：跳转到时间点并开始播放
      setReadingModeActiveSubtitle(null); // 清除点读模式的选中状态
      video.play();
      setIsPlaying(true);
    }
  };

  const currentSubtitle = getCurrentSubtitle();

  // 获取实际应该高亮的字幕（考虑点读模式）
  const getActiveSubtitle = (): Subtitle | undefined => {
    if (readingMode && readingModeActiveSubtitle) {
      return readingModeActiveSubtitle;
    }
    return currentSubtitle;
  };

  const activeSubtitle = getActiveSubtitle();

  // 检查当前字幕是否在可视区域中心
  const isSubtitleInCenter = useCallback((subtitleId: number): boolean => {
    const container = subtitleItemsContainerRef.current;
    if (!container) return true;

    const activeElement = container.querySelector(`[data-subtitle-id="${subtitleId}"]`) as HTMLElement;
    if (!activeElement) return true;

    const containerHeight = container.clientHeight;
    const elementTop = activeElement.offsetTop;
    const elementHeight = activeElement.clientHeight;
    const currentScrollTop = container.scrollTop;

    // 计算元素在容器中的可见位置
    const elementRelativeTop = elementTop - currentScrollTop;
    const elementBottom = elementRelativeTop + elementHeight;

    // 检查元素是否完全可见
    const isFullyVisible = elementRelativeTop >= 0 && elementBottom <= containerHeight;

    if (!isFullyVisible) {
      return false; // 如果不完全可见，肯定需要滚动
    }

    // 计算元素中心位置
    const elementCenter = elementRelativeTop + elementHeight / 2;
    const containerCenter = containerHeight / 2;

    // 判断是否在中心区域（容器高度的15%范围内）
    const centerThreshold = containerHeight * 0.15;
    return Math.abs(elementCenter - containerCenter) <= centerThreshold;
  }, []);

  // 自动滚动到当前字幕的函数
  const scrollToActiveSubtitle = useCallback((subtitleId: number) => {
    const container = subtitleItemsContainerRef.current;
    if (!container) return;

    const activeElement = container.querySelector(`[data-subtitle-id="${subtitleId}"]`) as HTMLElement;
    if (!activeElement) return;

    const containerHeight = container.clientHeight;
    const elementHeight = activeElement.clientHeight;
    const elementTop = activeElement.offsetTop;
    const currentScrollTop = container.scrollTop;

    // 计算目标滚动位置（将元素居中）
    let targetScrollTop = elementTop - (containerHeight - elementHeight) / 2;

    // 边界处理：确保不会超出滚动范围
    const maxScrollTop = container.scrollHeight - containerHeight;
    const minScrollTop = 0;

    // 对于顶部边界情况：如果是前几个字幕，允许滚动到顶部
    const subtitleIndex = subtitles.findIndex(sub => sub.id === subtitleId);
    const isNearStart = subtitleIndex < 3;
    const isNearEnd = subtitleIndex >= subtitles.length - 3;

    if (isNearStart) {
      // 对于开头的字幕，平滑滚动到顶部
      targetScrollTop = Math.max(minScrollTop, elementTop - 60); // 留60px的顶部间距
    } else if (isNearEnd) {
      // 对于结尾的字幕，确保不会过度滚动
      targetScrollTop = Math.min(maxScrollTop, elementTop - containerHeight + elementHeight + 60);
    }

    // 最终边界限制
    targetScrollTop = Math.max(minScrollTop, Math.min(targetScrollTop, maxScrollTop));

    // 计算滚动距离，只有距离足够大时才执行滚动
    const scrollDistance = Math.abs(targetScrollTop - currentScrollTop);
    if (scrollDistance > 3) { // 降低阈值以确保更精准的居中
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [subtitles]);

  // 快速滚动函数，专门用于点读跳转
  const fastScrollToSubtitle = useCallback((subtitleId: number) => {
    const container = subtitleItemsContainerRef.current;
    if (!container) return;

    const activeElement = container.querySelector(`[data-subtitle-id="${subtitleId}"]`) as HTMLElement;
    if (!activeElement) return;

    const containerHeight = container.clientHeight;
    const elementHeight = activeElement.clientHeight;
    const elementTop = activeElement.offsetTop;

    // 计算目标滚动位置（将元素居中）
    let targetScrollTop = elementTop - (containerHeight - elementHeight) / 2;

    // 边界处理
    const maxScrollTop = container.scrollHeight - containerHeight;
    const minScrollTop = 0;

    const subtitleIndex = subtitles.findIndex(sub => sub.id === subtitleId);
    const isNearStart = subtitleIndex < 3;
    const isNearEnd = subtitleIndex >= subtitles.length - 3;

    if (isNearStart) {
      targetScrollTop = Math.max(minScrollTop, elementTop - 60);
    } else if (isNearEnd) {
      targetScrollTop = Math.min(maxScrollTop, elementTop - containerHeight + elementHeight + 60);
    }

    targetScrollTop = Math.max(minScrollTop, Math.min(targetScrollTop, maxScrollTop));

    // 使用更快的滚动行为
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'auto' // 立即跳转，无动画
    });
  }, [subtitles]);

  // 监听当前字幕变化并持续跟踪位置
  useEffect(() => {
    if (activeSubtitle) {
      // 字幕变化时立即滚动
      if (activeSubtitle.id !== previousActiveId) {
        setPreviousActiveId(activeSubtitle.id);

        // 清除之前的延时器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // 立即滚动到新字幕
        requestAnimationFrame(() => {
          scrollToActiveSubtitle(activeSubtitle.id);
        });
      }

      // 持续检查当前字幕位置（每200ms检查一次）
      const now = Date.now();
      if (now - lastScrollCheckRef.current > 200) {
        lastScrollCheckRef.current = now;

        // 检查是否需要调整滚动位置
        if (!isSubtitleInCenter(activeSubtitle.id)) {
          scrollTimeoutRef.current = setTimeout(() => {
            requestAnimationFrame(() => {
              scrollToActiveSubtitle(activeSubtitle.id);
            });
          }, 50);
        }
      }
    }

    // 清理函数
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeSubtitle, previousActiveId, scrollToActiveSubtitle, isSubtitleInCenter]);

  // 额外的时间更新监听，确保持续跟踪
  useEffect(() => {
    if (activeSubtitle && isPlaying) {
      const interval = setInterval(() => {
        if (!isSubtitleInCenter(activeSubtitle.id)) {
          scrollToActiveSubtitle(activeSubtitle.id);
        }
      }, 500); // 每500毫秒检查一次

      return () => clearInterval(interval);
    }
  }, [activeSubtitle, isPlaying, isSubtitleInCenter, scrollToActiveSubtitle]);

  // 计算字幕列表动态高度 - 适应新布局
  const calculateSubtitleListHeight = useCallback(() => {
    if (subtitleControlsRef.current) {
      const controlsRect = subtitleControlsRef.current.getBoundingClientRect();
      const controlsBottom = controlsRect.bottom;

      // 计算可用高度：从字幕控制区底部到窗口底部
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - controlsBottom - 40; // 40px为底部边距

      const minHeight = 350; // 最小高度
      const maxHeight = Math.max(400, availableHeight); // 最大高度

      const calculatedHeight = Math.max(minHeight, Math.min(availableHeight, maxHeight));
      setSubtitleListHeight(calculatedHeight);
    }
  }, []);

  // 监听窗口大小变化和视频加载
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(calculateSubtitleListHeight);
    };

    const handleVideoLoad = () => {
      // 视频加载后延迟计算以确保布局稳定
      setTimeout(calculateSubtitleListHeight, 100);
    };

    window.addEventListener('resize', handleResize);
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', handleVideoLoad);
      // 首次计算
      setTimeout(calculateSubtitleListHeight, 100);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (video) {
        video.removeEventListener('loadeddata', handleVideoLoad);
      }
    };
  }, [calculateSubtitleListHeight]);

  // 处理从单词卡片跳转到字幕的功能
  const handleJumpToSubtitle = useCallback((subtitleId: number) => {
    const targetSubtitle = subtitles.find(sub => sub.id === subtitleId);
    if (!targetSubtitle || !videoRef.current) return;

    // 1. 自动启用点读模式
    setReadingMode(true);

    // 2. 显示点读模式指示器（仅在首次点击时显示）
    if (!hasShownReadingModeIndicator) {
      setShowReadingModeIndicator(true);
      setHasShownReadingModeIndicator(true);
      setTimeout(() => setShowReadingModeIndicator(false), 2000);
    }

    // 3. 清理之前的重复播放状态
    setRepeatMode(false);
    setCurrentRepeatCount(0);
    setRepeatSubtitle(null);

    // 4. 设置点读模式的目标字幕
    setReadingModeActiveSubtitle(targetSubtitle);
    setTargetEndTime(targetSubtitle.endTime);

    // 5. 视频跳转到指定时间
    videoRef.current.currentTime = targetSubtitle.startTime;

    // 6. 开始播放（无论之前是否在播放）
    videoRef.current.play();

    // 7. 立即滚动到字幕位置并高亮（减少延迟）
    requestAnimationFrame(() => {
      fastScrollToSubtitle(subtitleId);

      // 8. 立即高亮目标字幕（缩短高亮时间）
      const subtitleElement = document.getElementById(`subtitle-${subtitleId}`);
      if (subtitleElement) {
        subtitleElement.classList.add('highlight-jump');
        setTimeout(() => {
          subtitleElement.classList.remove('highlight-jump');
        }, 1500); // 缩短至1.5秒
      }
    });
  }, [subtitles, fastScrollToSubtitle]);

  return (
    <div className={`app ${contentStudyMode ? 'three-column' : 'two-column'}`}>
      {/* Reading mode indicator */}
      {showReadingModeIndicator && (
        <div className="reading-mode-indicator">
          🎯 已启用点读模式
        </div>
      )}

      <div className="video-section">
        <VideoHeader
          title={videoInfo.title}
          duration={duration}
          difficulty={videoInfo.difficulty}
          currentTime={currentTime}
        />

        <div ref={videoPlayerRef} className="video-player">
          <div className="video-container">
            <video
              ref={videoRef}
              src="/videos/bookmark.mp4"
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="video-controls-overlay">
              <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                playbackRate={playbackRate}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onPlaybackRateChange={handlePlaybackRateChange}
              />
            </div>
          </div>
        </div>

        <VideoDescription
          description={videoInfo.description}
        />
      </div>

      <div className="subtitle-section">
        <div ref={subtitleControlsRef} className="subtitle-controls">
          <button
            className={`toggle-button ${showTranslation ? 'active' : ''}`}
            onClick={() => setShowTranslation(!showTranslation)}
          >
            中英对照
          </button>
          <button
            className={`toggle-button ${readingMode ? 'active' : ''}`}
            onClick={() => setReadingMode(!readingMode)}
          >
            点读模式
          </button>
          <button
            className={`toggle-button ${repeatMode ? 'active' : ''}`}
            onClick={() => setRepeatMode(!repeatMode)}
          >
            重复播放
          </button>
          <button
            className={`toggle-button ${contentStudyMode ? 'active' : ''}`}
            onClick={() => setContentStudyMode(!contentStudyMode)}
          >
            内容精读
          </button>
          {repeatMode && (
            <div className="repeat-controls">
              <label>重复次数:</label>
              <select
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="repeat-count-select"
              >
                <option value={2}>2次</option>
                <option value={3}>3次</option>
                <option value={5}>5次</option>
                <option value={10}>10次</option>
              </select>
              {repeatSubtitle && (
                <span className="repeat-status">
                  第 {currentRepeatCount}/{repeatCount} 次
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="subtitle-display"
          style={{ height: `${subtitleListHeight}px` }}
        >
          <div className="subtitle-list">
            <h3>字幕列表</h3>
            <div ref={subtitleItemsContainerRef} className="subtitle-items-container">
              {subtitles.map(subtitle => {
                // 使用统一的活动字幕判断逻辑
                const isActive = activeSubtitle?.id === subtitle.id;
                return (
                  <div
                    key={subtitle.id}
                    id={`subtitle-${subtitle.id}`}
                    data-subtitle-id={subtitle.id}
                    className={`subtitle-item ${isActive ? 'active' : ''} clickable`}
                    onClick={() => handleSubtitleClick(subtitle)}
                  >
                    <div className="subtitle-time">
                      {Math.floor(subtitle.startTime / 60)}:{String(Math.floor(subtitle.startTime % 60)).padStart(2, '0')}
                    </div>
                    {showTranslation ? (
                      <>
                        <div className="subtitle-text">{subtitle.text}</div>
                        {subtitle.translation && (
                          <div className="subtitle-translation">{subtitle.translation}</div>
                        )}
                      </>
                    ) : (
                      <div className="subtitle-text">{subtitle.text}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Study Section - only show when contentStudyMode is true */}
      {contentStudyMode && sampleVideoData.wordCards && sampleVideoData.wordCards.length > 0 && (
        <div className="content-study-section">
          <CloseReadingSection
            wordCards={sampleVideoData.wordCards}
            onJumpToSubtitle={handleJumpToSubtitle}
          />
        </div>
      )}
    </div>
  );
};

export default App;