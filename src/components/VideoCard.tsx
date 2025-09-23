'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Video } from '@/types'
import { Play, Clock } from 'lucide-react'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  // Generate thumbnail URL from Cloudflare Stream
  const thumbnailUrl = video.thumbnail_url ||
    `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${video.cloudflare_stream_id}/thumbnails/thumbnail.jpg`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <Link href={`/videos/${video.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback to a placeholder if thumbnail fails to load
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-video.jpg'
            }}
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Play className="w-6 h-6 text-blue-600" fill="currentColor" />
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
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{formatDate(video.created_at)}</span>
            </div>

            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              英语学习
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}