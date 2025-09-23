'use client'

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

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

  // Determine the video source
  const videoSrc = cloudflareStreamId
    ? `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${cloudflareStreamId}/manifest/video.m3u8`
    : src

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current?.play()
    },
    pause: () => {
      videoRef.current?.pause()
    },
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time
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
      if (videoRef.current) {
        videoRef.current.playbackRate = rate
      }
    },
    getPlaybackRate: () => {
      return videoRef.current?.playbackRate || 1
    }
  }))

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime)
    }

    const handleDurationChange = () => {
      onDurationChange(video.duration)
    }

    const handlePlay = () => {
      onPlay()
    }

    const handlePause = () => {
      onPause()
    }

    const handleLoadedMetadata = () => {
      onLoadedMetadata()
    }

    const handleVideoClick = () => {
      if (onVideoClick) {
        onVideoClick()
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('click', handleVideoClick)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('click', handleVideoClick)
    }
  }, [onTimeUpdate, onDurationChange, onPlay, onPause, onLoadedMetadata, onVideoClick])

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        controls={false}
        preload="metadata"
        className="w-full h-auto"
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer