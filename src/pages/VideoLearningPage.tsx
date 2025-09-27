import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import VideoControls from '../components/VideoControls';
import VideoHeader from '../components/VideoHeader';
import VideoDescription from '../components/VideoDescription';
import CloseReadingSection from '../components/CloseReading/CloseReadingSection';
import VideoPlayer, { VideoPlayerRef } from '../components/VideoPlayer';
import { supabase, VideoRow, SubtitleRow } from '../lib/supabaseClient';
import { useUserProgress } from '../hooks/useUserProgress';
import { sampleVideoData } from '../data/sampleData';
import '../App.css';

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
}

// VideoLearningPage: 集成数据库的视频学习页面
// 保留原有的v3.0内容精读功能，完全不变，同时集成数据库和进度跟踪

interface VideoLearningPageProps {}

const VideoLearningPage: React.FC<VideoLearningPageProps> = () => {
  const { id: videoId } = useParams<{ id: string }>()
  const { progress, saveProgress } = useUserProgress({ videoId: videoId || '' })
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const subtitleControlsRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
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

  // 数据库集成状态
  const [videoData, setVideoData] = useState<VideoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressSaveTimeout, setProgressSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // 如果没有videoId，重定向到首页
  if (!videoId) {
    return <Navigate to="/" replace />
  }

  // 加载视频数据和字幕
  const loadVideoData = async () => {
    try {
      setLoading(true)

      // 加载视频信息
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('status', 'published')
        .single()

      if (videoError) {
        throw new Error('视频不存在或未发布')
      }

      setVideoData(video)

      // 加载字幕数据
      const { data: subtitleData, error: subtitleError } = await supabase
        .from('subtitles')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true })

      if (subtitleError) {
        console.error('字幕加载失败:', subtitleError)
        // 字幕加载失败不影响视频播放，使用空数组
      }

      // 转换字幕格式
      const convertedSubtitles: Subtitle[] = subtitleData?.map((sub: SubtitleRow) => ({
        id: sub.id,
        startTime: sub.start_time,
        endTime: sub.end_time,
        text: sub.english_text,
        translation: sub.chinese_text || undefined
      })) || []

      console.log(`📝 从数据库加载字幕: ${convertedSubtitles.length} 条`)

      // 如果数据库没有字幕，使用演示字幕确保功能正常
      if (convertedSubtitles.length === 0) {
        console.log('⚠️ 数据库无字幕数据，使用演示字幕')
        const demoSubtitles: Subtitle[] = [
          {
            id: 1,
            startTime: 0,
            endTime: 5,
            text: "right now I'm reading this didion and babits it's great",
            translation: "现在我在读迪迪翁和巴比茨的作品，很棒"
          },
          {
            id: 2,
            startTime: 5,
            endTime: 8,
            text: "it's a really good read",
            translation: "这是一本很好的读物"
          },
          {
            id: 3,
            startTime: 8,
            endTime: 11,
            text: "this is my favorite thing ever it's a bookmark",
            translation: "这是我最喜欢的东西，这是一个书签"
          },
          {
            id: 4,
            startTime: 11,
            endTime: 14,
            text: "it's a thong bookmark",
            translation: "这是一个绳子书签"
          },
          {
            id: 5,
            startTime: 14,
            endTime: 17,
            text: "and a dancer actually made this for me",
            translation: "一个舞者为我做了这个"
          },
          {
            id: 6,
            startTime: 17,
            endTime: 20,
            text: "and I remember when she gave it to me",
            translation: "我记得她给我的时候"
          },
          {
            id: 7,
            startTime: 20,
            endTime: 23,
            text: "I was like thank you",
            translation: "我说谢谢你"
          }
        ]
        setSubtitles(demoSubtitles)
        console.log('✅ 演示字幕设置完成:', demoSubtitles.length + ' 条')
        console.log('🔍 演示字幕内容预览:', demoSubtitles.map(s => `${s.id}: ${s.text} (${s.startTime}s-${s.endTime}s)`))
      } else {
        setSubtitles(convertedSubtitles)
        console.log('✅ 数据库字幕设置完成:', convertedSubtitles.length + ' 条')
        console.log('🔍 数据库字幕内容预览:', convertedSubtitles.slice(0, 3).map(s => `${s.id}: ${s.text} (${s.startTime}s-${s.endTime}s)`))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '加载视频失败')
    } finally {
      setLoading(false)
    }
  }

  // 延时保存进度（防抖）
  const debounceSaveProgress = useCallback((currentTime: number) => {
    if (progressSaveTimeout) {
      clearTimeout(progressSaveTimeout)
    }

    const timeout = setTimeout(() => {
      saveProgress(currentTime)
    }, 2000) // 2秒后保存

    setProgressSaveTimeout(timeout)
  }, [progressSaveTimeout, saveProgress])

  // 初始化加载
  useEffect(() => {
    loadVideoData()
  }, [videoId])

  // 恢复播放进度 - 适用于 Cloudflare Stream
  useEffect(() => {
    if (progress && videoPlayerRef.current && !loading && videoData?.cloudflare_stream_id) {
      const currentVideoTime = videoPlayerRef.current.getCurrentTime()
      if (progress.lastPosition > 0 && Math.abs(currentVideoTime - progress.lastPosition) > 5) {
        videoPlayerRef.current.seekTo(progress.lastPosition)
      }
    }
  }, [progress, loading, videoData?.cloudflare_stream_id])

  // 视频信息（使用数据库数据或后备数据）
  const videoInfo = {
    title: videoData?.title || "加载中...",
    difficulty: videoData?.difficulty === 'beginner' ? '初级' :
                videoData?.difficulty === 'advanced' ? '高级' : '中级',
    description: videoData?.description || "正在加载视频描述..."
  }

  // 获取视频源 - 优先使用 Cloudflare Stream
  const getVideoSource = () => {
    if (videoData?.cloudflare_stream_id) {
      // 检查是否是真实的 Stream ID（32位十六进制字符串）
      const isRealStreamId = /^[a-f0-9]{32}$/.test(videoData.cloudflare_stream_id);

      if (isRealStreamId) {
        console.log(`🌐 使用真实 Cloudflare Stream: ${videoData.cloudflare_stream_id}`);
        return { cloudflareStreamId: videoData.cloudflare_stream_id };
      } else {
        console.log(`🎥 检测到演示Stream ID: ${videoData.cloudflare_stream_id}, 使用测试视频`);
        // 只有真正的demo-*才使用测试视频
        return { src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" };
      }
    } else {
      console.log(`🎥 无Stream ID，使用测试视频`);
      return { src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" };
    }
  }

  const videoSource = getVideoSource();

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
    if (!videoPlayerRef.current) return;

    if (videoPlayerRef.current.isPlaying()) {
      videoPlayerRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ 播放器控制: 暂停播放');
    } else {
      videoPlayerRef.current.play();
      setIsPlaying(true);
      console.log('▶️ 播放器控制: 开始播放');
    }
  };

  const handleSeek = (time: number) => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.seekTo(time);
    setCurrentTime(time);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoPlayerRef.current) return;
    videoPlayerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  // 移除原有的字幕文件加载（已由数据库加载替代）
  // useEffect(() => {
  //   fetch('/subtitles/bookmark.srt')...
  // }, []);

  // 时间更新处理 - 适配VideoPlayer组件
  const handleTimeUpdate = (current: number) => {
    setCurrentTime(current);

    // 增强调试：实时显示时间更新
    if (Math.floor(current * 2) % 2 === 0 && current > 0) {
      console.log(`⏱️ 时间更新: ${current.toFixed(2)}s, 播放状态: ${isPlaying}, 持续时间: ${duration.toFixed(2) || '未知'}s`);
    }

    // 保存播放进度（防抖）
    debounceSaveProgress(current);

    // 重复播放模式检查
    if (repeatMode && repeatSubtitle && current >= repeatSubtitle.endTime) {
      if (currentRepeatCount < repeatCount) {
        // 还需要重复播放
        setCurrentRepeatCount(prev => prev + 1);
        videoPlayerRef.current?.seekTo(repeatSubtitle.startTime);
        return;
      } else {
        // 重复播放完成
        videoPlayerRef.current?.pause();
        setIsPlaying(false);
        setRepeatSubtitle(null);
        setCurrentRepeatCount(0);
        return;
      }
    }

    // 点读模式自动暂停（修复高亮停留问题）
    if (readingMode && targetEndTime && current >= targetEndTime) {
      console.log(`🎯 点读模式: 到达目标结束时间 ${targetEndTime.toFixed(2)}s，准备暂停`);

      // 精确停在目标结束时间
      videoPlayerRef.current?.seekTo(targetEndTime);
      videoPlayerRef.current?.pause();
      setIsPlaying(false);

      // 清除目标结束时间，但保持readingModeActiveSubtitle不变
      // 这样getActiveSubtitle会继续显示用户选择的字幕高亮
      setTargetEndTime(null);

      console.log(`🎯 点读模式: 播放完毕，暂停在 ${targetEndTime.toFixed(2)}s，高亮保持在用户选择的字幕上`);
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    console.log(`📺 视频时长设置: ${newDuration.toFixed(2)}s`);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('▶️ 视频开始播放');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('⏸️ 视频暂停');
  };

  const handleLoadedMetadata = () => {
    console.log('📺 视频元数据加载完成');
  };

  // 监听播放状态变化，在正常播放过程中清除点读模式的选中状态（修复状态冲突）
  useEffect(() => {
    // 只有在普通模式（非点读模式）下，且视频正在播放，且不是因为点读模式的目标播放时，才清除点读状态
    if (isPlaying && !readingMode && !targetEndTime && readingModeActiveSubtitle) {
      console.log('🎯 切换到普通播放模式，清除点读模式选中状态');
      setReadingModeActiveSubtitle(null);
    }
  }, [isPlaying, readingMode, targetEndTime, readingModeActiveSubtitle]);

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

  // 获取当前字幕（修复高亮逻辑并增强调试）
  const getCurrentSubtitle = (): Subtitle | undefined => {
    const current = subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime);

    // 增强调试信息，每秒输出一次状态
    if (Math.floor(currentTime * 10) % 10 === 0 && currentTime > 0) {
      console.log(`🔍 高亮调试 - 当前时间: ${currentTime.toFixed(2)}s, 找到字幕: ${current ? `"${current.text}"` : '无'}, 播放状态: ${isPlaying}`);
    }

    // 只在字幕变化时输出切换信息并更新previousActiveId
    if (current && previousActiveId !== current.id) {
      console.log(`✅ 字幕切换: "${current.text}" (${current.startTime}s-${current.endTime}s)`);
      setPreviousActiveId(current.id);
    } else if (!current && previousActiveId !== null) {
      console.log(`❌ 字幕离开: 当前时间${currentTime.toFixed(2)}s无字幕`);
      setPreviousActiveId(null);
    }

    return current;
  };

  // 字幕点击处理 - 增强版
  const handleSubtitleClick = (subtitle: Subtitle) => {
    if (!videoPlayerRef.current) return;

    console.log(`🎯 字幕被点击: "${subtitle.text}" (${subtitle.startTime}s-${subtitle.endTime}s)`);
    console.log(`📊 当前模式: 普通模式=${!readingMode && !repeatMode}, 点读模式=${readingMode}, 重复模式=${repeatMode}`);

    // 跳转到字幕对应的时间点
    videoPlayerRef.current.seekTo(subtitle.startTime);

    if (repeatMode) {
      // 重复播放模式：设置要重复的字幕并开始播放
      setRepeatSubtitle(subtitle);
      setCurrentRepeatCount(1); // 从第一次播放开始计数
      videoPlayerRef.current.play();
      setIsPlaying(true);
      console.log(`🔄 重复模式: 将重复播放 ${repeatCount} 次`);
    } else if (readingMode) {
      // 点读模式：播放到字幕结束时间并自动暂停
      setTargetEndTime(subtitle.endTime);
      setReadingModeActiveSubtitle(subtitle); // 保持字幕高亮状态
      videoPlayerRef.current.play();
      setIsPlaying(true);
      console.log(`🎯 点读模式: 将播放至 ${subtitle.endTime}s 后自动暂停`);
    } else {
      // 普通播放模式：跳转到时间点并连续播放
      setReadingModeActiveSubtitle(null); // 清除点读模式的选中状态
      setTargetEndTime(null); // 清除目标结束时间
      videoPlayerRef.current.play();
      setIsPlaying(true);
      console.log('▶️ 普通模式: 跳转并连续播放');
    }

    // 立即滚动到字幕位置并根据模式添加不同的高亮效果
    requestAnimationFrame(() => {
      fastScrollToSubtitle(subtitle.id);

      // 🔧 修复: 只在点读模式或重复模式下添加紫色点击高亮效果
      // 普通模式下依赖自然的时间跟踪产生浅黄色高亮
      if (readingMode || repeatMode) {
        const subtitleElement = document.getElementById(`subtitle-${subtitle.id}`);
        if (subtitleElement) {
          subtitleElement.classList.add('highlight-click');
          setTimeout(() => {
            subtitleElement.classList.remove('highlight-click');
          }, 1000);
        }
        console.log(`💜 添加紫色点击高亮效果 (${readingMode ? '点读模式' : '重复模式'})`);
      } else {
        console.log(`💛 普通模式 - 依赖时间跟踪产生浅黄色高亮，无需额外点击效果`);
      }
    });
  };

  const currentSubtitle = getCurrentSubtitle();

  // 获取实际应该高亮的字幕（修复点读模式高亮停留问题）
  const getActiveSubtitle = (): Subtitle | undefined => {
    // 点读模式：保持选中字幕的高亮，直到用户手动切换或开始普通播放
    if (readingMode && readingModeActiveSubtitle) {
      // 在点读模式下，始终高亮用户选择的字幕
      // 无论视频是播放、暂停还是停止，都保持高亮在用户点击的字幕上
      if (Math.floor(currentTime * 4) % 4 === 0) {
        console.log(`🎯 点读模式高亮 - 保持在用户选择的字幕: "${readingModeActiveSubtitle.text}" (${readingModeActiveSubtitle.startTime}s-${readingModeActiveSubtitle.endTime}s)`);
      }
      return readingModeActiveSubtitle;
    }

    // 🔧 修复：普通模式下的字幕高亮逻辑
    // 条件：currentTime > 0 表示视频已经开始播放（即使现在暂停了）
    if (currentTime > 0 && currentSubtitle) {
      // 调试信息：记录高亮决策过程
      if (Math.floor(currentTime * 4) % 4 === 0) {
        console.log(`🎯 普通模式高亮 - 当前时间: ${currentTime.toFixed(2)}s, 高亮字幕: "${currentSubtitle.text}" (${currentSubtitle.startTime}s-${currentSubtitle.endTime}s)`);
      }
      return currentSubtitle;
    }

    // 调试信息：记录为什么没有高亮
    if (currentTime > 0 && Math.floor(currentTime * 4) % 4 === 0) {
      console.log(`❌ 普通模式无高亮 - 当前时间: ${currentTime.toFixed(2)}s, 当前字幕: ${currentSubtitle ? `"${currentSubtitle.text}"` : '无'}`);
    }

    return undefined;
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
    // 优先使用当前播放字幕进行滚动
    const subtitleToTrack = currentSubtitle || (readingMode ? readingModeActiveSubtitle : null);

    if (subtitleToTrack) {
      // 字幕变化时立即滚动
      if (subtitleToTrack.id !== previousActiveId) {
        setPreviousActiveId(subtitleToTrack.id);

        // 清除之前的延时器
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // 立即滚动到新字幕
        requestAnimationFrame(() => {
          scrollToActiveSubtitle(subtitleToTrack.id);
        });
      }

      // 持续检查当前字幕位置（每200ms检查一次）
      const now = Date.now();
      if (now - lastScrollCheckRef.current > 200) {
        lastScrollCheckRef.current = now;

        // 检查是否需要调整滚动位置
        if (!isSubtitleInCenter(subtitleToTrack.id)) {
          scrollTimeoutRef.current = setTimeout(() => {
            requestAnimationFrame(() => {
              scrollToActiveSubtitle(subtitleToTrack.id);
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
  }, [currentSubtitle, readingModeActiveSubtitle, readingMode, previousActiveId, scrollToActiveSubtitle, isSubtitleInCenter]);

  // 额外的时间更新监听，确保持续跟踪
  useEffect(() => {
    const subtitleToTrack = currentSubtitle || (readingMode ? readingModeActiveSubtitle : null);

    if (subtitleToTrack && isPlaying) {
      const interval = setInterval(() => {
        if (!isSubtitleInCenter(subtitleToTrack.id)) {
          scrollToActiveSubtitle(subtitleToTrack.id);
        }
      }, 500); // 每500毫秒检查一次

      return () => clearInterval(interval);
    }
  }, [currentSubtitle, readingModeActiveSubtitle, readingMode, isPlaying, isSubtitleInCenter, scrollToActiveSubtitle]);

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
    // 首次计算
    setTimeout(calculateSubtitleListHeight, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateSubtitleListHeight]);

  // 处理从单词卡片跳转到字幕的功能
  const handleJumpToSubtitle = useCallback((subtitleId: number) => {
    const targetSubtitle = subtitles.find(sub => sub.id === subtitleId);
    if (!targetSubtitle || !videoPlayerRef.current) return;

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
    videoPlayerRef.current.seekTo(targetSubtitle.startTime);

    // 6. 开始播放（无论之前是否在播放）
    videoPlayerRef.current.play();

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

  // 加载状态
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666' }}>加载视频数据...</p>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '64px' }}>❌</div>
        <h2 style={{ color: '#d63384' }}>加载失败</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          返回首页
        </button>
      </div>
    )
  }

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

        <div ref={videoContainerRef} className="video-player">
          <div className="video-container" style={{ aspectRatio: '16/9' }}>
            {/* 使用 VideoPlayer 组件，支持 Cloudflare Stream */}
            <VideoPlayer
              ref={videoPlayerRef}
              cloudflareStreamId={videoSource.cloudflareStreamId}
              src={videoSource.src}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlay={handlePlay}
              onPause={handlePause}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full"
              useWebComponent={true} // 优先使用 Web Component，自动降级到 iframe
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
                // 修复高亮逻辑：统一使用activeSubtitle判断
                const shouldHighlight = activeSubtitle?.id === subtitle.id;
                const isPointReadActive = readingMode && readingModeActiveSubtitle?.id === subtitle.id;

                // 组合CSS类名 - 确保正确的高亮行为
                let className = 'subtitle-item clickable';
                if (shouldHighlight) {
                  className += ' active';
                }
                if (isPointReadActive && (isPlaying || targetEndTime)) {
                  className += ' reading-mode-active';
                }

                return (
                  <div
                    key={subtitle.id}
                    id={`subtitle-${subtitle.id}`}
                    data-subtitle-id={subtitle.id}
                    className={className}
                    onClick={() => handleSubtitleClick(subtitle)}
                    title={`点击跳转到 ${Math.floor(subtitle.startTime / 60)}:${String(Math.floor(subtitle.startTime % 60)).padStart(2, '0')} ${
                      readingMode ? '(点读模式: 播放这句后自动暂停)' :
                      repeatMode ? '(重复模式: 重复播放这句)' :
                      '(普通模式: 跳转并连续播放)'
                    }`}
                  >
                    <div className="subtitle-time">
                      {Math.floor(subtitle.startTime / 60)}:{String(Math.floor(subtitle.startTime % 60)).padStart(2, '0')}
                      {/* 点读模式指示器 */}
                      {isPointReadActive && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.7rem',
                          color: '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          🎯
                        </span>
                      )}
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

export default VideoLearningPage;