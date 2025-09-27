import React from 'react'
import { Link } from 'react-router-dom'
import { VideoRow } from '../lib/supabaseClient'

// 简单的图标组件
const PlayIcon = () => (
  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
  </svg>
)

interface VideoCardProps {
  video: VideoRow
}

export function VideoCard({ video }: VideoCardProps) {
  // Generate thumbnail URL from Cloudflare Stream
  const thumbnailUrl = video.thumbnail_url ||
    `https://videodelivery.net/${video.cloudflare_stream_id}/thumbnails/thumbnail.jpg`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const getDifficultyLabel = (difficulty?: string) => {
    const labels = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级'
    }
    return labels[difficulty as keyof typeof labels] || '英语学习'
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    return `${mins}min`
  }

  return (
    <Link to={`/videos/${video.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              // Fallback to a placeholder if thumbnail fails to load
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-video.jpg'
            }}
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <PlayIcon />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>

          {video.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {video.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <ClockIcon />
                <span>{formatDate(video.created_at)}</span>
              </div>
              {video.duration && (
                <span>{formatDuration(video.duration)}</span>
              )}
            </div>

            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              {getDifficultyLabel(video.difficulty)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}