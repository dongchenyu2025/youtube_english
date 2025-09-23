'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { VideoWithSubtitles, DisplaySettings, PlayerState, Subtitle } from '@/types'
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer'
import SubtitleDisplay from './SubtitleDisplay'
import { useReadingMode } from '@/hooks/useReadingMode'

interface VideoPlaybackPageProps {
  video: VideoWithSubtitles
}

export function VideoPlaybackPage({ video }: VideoPlaybackPageProps) {
  const videoPlayerRef = useRef<VideoPlayerRef>(null)

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    showTranslation: false,
    readingMode: false,
    fontSize: 'medium'
  })

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    currentSubtitleId: null
  })

  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Find current subtitle based on time
  const findCurrentSubtitle = useCallback((time: number): Subtitle | null => {
    return video.subtitles.find(
      subtitle => time >= subtitle.start_time && time <= subtitle.end_time
    ) || null
  }, [video.subtitles])

  // Handle time updates
  const handleTimeUpdate = (currentTime: number) => {
    const currentSubtitle = findCurrentSubtitle(currentTime)
    setPlayerState(prev => ({
      ...prev,
      currentTime,
      currentSubtitleId: currentSubtitle?.id || null
    }))
  }

  // Handle subtitle click (reading mode)
  const handleSubtitleClick = (subtitle: Subtitle) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(subtitle.start_time)
      if (displaySettings.readingMode) {
        videoPlayerRef.current.play()
      }
    }
  }

  // Handle subtitle end (for reading mode auto-pause)
  const handleSubtitleEnd = () => {
    if (videoPlayerRef.current && displaySettings.readingMode) {
      videoPlayerRef.current.pause()
    }
  }

  // Use reading mode hook
  const currentSubtitle = findCurrentSubtitle(playerState.currentTime)
  useReadingMode({
    enabled: displaySettings.readingMode,
    currentSubtitle,
    currentTime: playerState.currentTime,
    onSubtitleEnd: handleSubtitleEnd,
    videoPlayerRef
  })

  // Control handlers
  const togglePlay = () => {
    if (!videoPlayerRef.current) return

    if (playerState.isPlaying) {
      videoPlayerRef.current.pause()
    } else {
      videoPlayerRef.current.play()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Note: HTML5 video mute would be handled in VideoPlayer component
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回列表</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {video.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer
              ref={videoPlayerRef}
              cloudflareStreamId={video.cloudflare_stream_id}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={(duration) => setPlayerState(prev => ({ ...prev, duration }))}
              onPlay={() => setPlayerState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPlayerState(prev => ({ ...prev, isPlaying: false }))}
              onLoadedMetadata={() => {}}
              className="w-full"
            />

            {/* Video Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                {/* Playback Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {playerState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Display Settings */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setDisplaySettings(prev => ({
                      ...prev,
                      showTranslation: !prev.showTranslation
                    }))}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      displaySettings.showTranslation
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    中英对照
                  </button>

                  <button
                    onClick={() => setDisplaySettings(prev => ({
                      ...prev,
                      readingMode: !prev.readingMode
                    }))}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      displaySettings.readingMode
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    点读模式
                  </button>

                  <select
                    value={displaySettings.fontSize}
                    onChange={(e) => setDisplaySettings(prev => ({
                      ...prev,
                      fontSize: e.target.value as DisplaySettings['fontSize']
                    }))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                  >
                    <option value="small">小字体</option>
                    <option value="medium">中字体</option>
                    <option value="large">大字体</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{Math.floor(playerState.currentTime / 60)}:{Math.floor(playerState.currentTime % 60).toString().padStart(2, '0')}</span>
                  <span>{Math.floor(playerState.duration / 60)}:{Math.floor(playerState.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Video Description */}
            {video.description && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-2">视频介绍</h3>
                <p className="text-gray-700 leading-relaxed">{video.description}</p>
              </div>
            )}
          </div>

          {/* Subtitles */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">字幕</h2>
              <SubtitleDisplay
                subtitles={video.subtitles}
                currentSubtitleId={playerState.currentSubtitleId}
                displaySettings={displaySettings}
                onSubtitleClick={handleSubtitleClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}