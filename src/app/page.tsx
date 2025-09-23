import { VideoCard } from '@/components/VideoCard'
import { getVideos } from '@/lib/api'

export default async function HomePage() {
  const videos = await getVideos()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          视频跟练英语学习平台
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          通过观看真实场景的英语短视频来学习地道口语，提升听说能力
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无视频内容，请稍后再来</p>
        </div>
      )}
    </div>
  )
}