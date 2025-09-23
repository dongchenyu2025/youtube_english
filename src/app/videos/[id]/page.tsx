import { notFound } from 'next/navigation'
import { getVideoWithSubtitles } from '@/lib/api'
import { VideoPlaybackPage } from '@/components/VideoPlaybackPage'

interface VideoPageProps {
  params: {
    id: string
  }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await getVideoWithSubtitles(params.id)

  if (!video) {
    notFound()
  }

  return <VideoPlaybackPage video={video} />
}

export async function generateMetadata({ params }: VideoPageProps) {
  const video = await getVideoWithSubtitles(params.id)

  if (!video) {
    return {
      title: '视频未找到',
    }
  }

  return {
    title: `${video.title} - 视频跟练英语学习平台`,
    description: video.description,
  }
}