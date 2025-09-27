import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  cloudflareStreamId?: string
  src?: string
  onTimeUpdate: (currentTime: number) => void
  onDurationChange: (duration: number) => void
  onPlay: () => void
  onPause: () => void
  onLoadedMetadata: () => void
  onVideoClick?: () => void
  className?: string
}

export interface VideoPlayerRef {
  play: () => void
  pause: () => void
  seekTo: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  isPlaying: () => boolean
  setPlaybackRate: (rate: number) => void
  getPlaybackRate: () => number
}

// 生成多种Cloudflare Stream URL格式进行测试
const getStreamVideoUrls = (streamId: string): string[] => {
  return [
    // 格式1: 标准HLS播放
    `https://videodelivery.net/${streamId}/manifest/video.m3u8`,
    // 格式2: 直接MP4
    `https://videodelivery.net/${streamId}/mp4`,
    // 格式3: 带客户ID的格式
    `https://customer-m033z5x00ks6nunl.cloudflarestream.com/${streamId}/manifest/video.m3u8`,
    // 格式4: 简化MP4格式
    `https://videodelivery.net/${streamId}.mp4`,
    // 格式5: 无扩展名
    `https://videodelivery.net/${streamId}`
  ]
}

// 检查是否是真实的Stream ID
const isRealStreamId = (id?: string): boolean => {
  if (!id) return false
  return /^[a-f0-9]{32}$/.test(id) || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  cloudflareStreamId,
  src,
  onTimeUpdate,
  onDurationChange,
  onPlay,
  onPause,
  onLoadedMetadata,
  onVideoClick,
  className = ''
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideoError, setHasVideoError] = useState(false)
  const hlsRef = useRef<Hls | null>(null)

  // 获取视频源URL
  const getVideoSrc = (): string => {
    if (cloudflareStreamId && isRealStreamId(cloudflareStreamId)) {
      console.log('🎯 使用真实Cloudflare Stream ID (HLS格式):', cloudflareStreamId)
      // 直接使用已验证可用的HLS格式
      return `https://videodelivery.net/${cloudflareStreamId}/manifest/video.m3u8`
    } else if (cloudflareStreamId) {
      console.log('🎥 使用演示视频')
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    } else if (src) {
      console.log('🎬 使用自定义视频源:', src)
      return src
    }
    return ""
  }

  const videoSrc = getVideoSrc()

  console.log('🎥 VideoPlayer 简化版初始化:', {
    cloudflareStreamId,
    isRealStream: isRealStreamId(cloudflareStreamId),
    videoSrc
  })

  // 实现播放器控制 API
  useImperativeHandle(ref, () => ({
    play: () => {
      console.log('🎮 API 调用: play()')
      if (videoRef.current) {
        videoRef.current.play()
        console.log('▶️ Video 播放')
      }
    },

    pause: () => {
      console.log('🎮 API 调用: pause()')
      if (videoRef.current) {
        videoRef.current.pause()
        console.log('⏸️ Video 暂停')
      }
    },

    seekTo: (time: number) => {
      console.log(`🎮 API 调用: seekTo(${time.toFixed(2)}s)`)
      if (videoRef.current) {
        videoRef.current.currentTime = time
        console.log(`🎯 Video 跳转到 ${time.toFixed(2)}s`)
      }
    },

    getCurrentTime: () => {
      return videoRef.current?.currentTime || 0
    },

    getDuration: () => {
      return videoRef.current?.duration || 0
    },

    isPlaying: () => {
      return videoRef.current ? !videoRef.current.paused : false
    },

    setPlaybackRate: (rate: number) => {
      console.log(`🎮 API 调用: setPlaybackRate(${rate}x)`)
      if (videoRef.current) {
        videoRef.current.playbackRate = rate
        console.log(`⚡ Video 播放速度 ${rate}x`)
      }
    },

    getPlaybackRate: () => {
      return videoRef.current?.playbackRate || 1
    }
  }))

  // video 元素的事件处理
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const time = video.currentTime
      onTimeUpdate(time)
    }

    const handleDurationChange = () => {
      const dur = video.duration
      onDurationChange(dur)
    }

    const handlePlay = () => {
      onPlay()
    }

    const handlePause = () => {
      onPause()
    }

    const handleLoadedMetadata = () => {
      console.log('📺 Video 元数据加载完成')
      onLoadedMetadata()
    }

    const handleVideoClick = () => {
      if (onVideoClick) {
        onVideoClick()
      }
    }

    const handleError = (e: Event) => {
      console.error('❌ Video 加载错误:', e)
      setHasVideoError(true)
    }

    // 添加事件监听器
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('click', handleVideoClick)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('click', handleVideoClick)
      video.removeEventListener('error', handleError)
    }
  }, [onTimeUpdate, onDurationChange, onPlay, onPause, onLoadedMetadata, onVideoClick])

  // HLS播放器初始化
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const videoSrc = getVideoSrc()

    // 清理之前的HLS实例
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // 检查是否是HLS URL且需要HLS.js支持
    if (videoSrc.includes('.m3u8')) {
      if (Hls.isSupported()) {
        console.log('🎯 使用HLS.js播放HLS视频:', videoSrc)

        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
        })

        hlsRef.current = hls
        hls.loadSource(videoSrc)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest 解析成功')
          setHasVideoError(false)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS播放错误:', data)
          if (data.fatal) {
            setHasVideoError(true)
          }
        })

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari原生支持HLS
        console.log('🍎 使用Safari原生HLS支持:', videoSrc)
        video.src = videoSrc
      } else {
        console.error('❌ 浏览器不支持HLS播放')
        setHasVideoError(true)
      }
    } else {
      // 普通MP4视频
      console.log('🎥 使用标准video播放:', videoSrc)
      video.src = videoSrc
    }

    // 清理函数
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [cloudflareStreamId, src])

  // 渲染播放器
  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        controls={false}
        preload="metadata"
        className="w-full h-auto"
        playsInline
        crossOrigin="anonymous"
      >
        您的浏览器不支持视频播放。
      </video>

      {/* 视频类型指示器 */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {isRealStreamId(cloudflareStreamId) && '🎯 Cloudflare Stream (HLS)'}
        {cloudflareStreamId && !isRealStreamId(cloudflareStreamId) && '🎥 演示视频'}
        {!cloudflareStreamId && src && '🎬 自定义视频'}
      </div>

      {/* 错误状态显示 */}
      {hasVideoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
          <div className="text-center">
            <div className="text-4xl mb-2">❌</div>
            <div>视频加载失败</div>
            <div className="text-sm mt-1 opacity-75">
              {videoSrc && <div>URL: {videoSrc}</div>}
            </div>
            <div className="text-xs mt-2 opacity-50">
              请检查网络连接或联系管理员
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer