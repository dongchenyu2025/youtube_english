import { cloudflareStream } from './cloudflareStream'
import { supabase, VideoInsert } from './supabaseClient'

export interface VideoUploadOptions {
  file: File
  title: string
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  status?: 'draft' | 'published'
}

export interface VideoUploadProgress {
  stage: 'uploading' | 'processing' | 'saving' | 'completed' | 'error'
  progress: number
  message: string
  error?: string
}

export class VideoUploadService {
  private onProgress?: (progress: VideoUploadProgress) => void

  constructor(onProgress?: (progress: VideoUploadProgress) => void) {
    this.onProgress = onProgress
  }

  private updateProgress(stage: VideoUploadProgress['stage'], progress: number, message: string, error?: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message, error })
    }
  }

  /**
   * 上传视频到 Cloudflare Stream 并保存到数据库
   */
  async uploadVideo(options: VideoUploadOptions, currentUserId?: string): Promise<string> {
    const { file, title, description, difficulty, status = 'draft' } = options

    try {
      // 第1步: 验证文件
      this.updateProgress('uploading', 5, '验证文件格式...')
      this.validateVideoFile(file)

      // 第2步: 上传到 Cloudflare Stream
      this.updateProgress('uploading', 10, '开始上传到 Cloudflare Stream...')

      const streamVideo = await cloudflareStream.uploadVideo(file, {
        name: title,
        requireSignedURLs: false, // 允许公开访问
      })

      this.updateProgress('uploading', 50, '视频上传完成，等待处理...')

      // 第3步: 等待视频处理完成
      this.updateProgress('processing', 60, 'Cloudflare 正在处理视频...')
      await this.waitForVideoProcessing(streamVideo.uid)

      this.updateProgress('processing', 80, '视频处理完成')

      // 第4步: 获取视频时长
      const processedVideo = await cloudflareStream.getVideo(streamVideo.uid)
      const duration = processedVideo.duration || 0

      // 第5步: 保存到数据库
      this.updateProgress('saving', 90, '保存视频信息到数据库...')

      console.log('准备保存视频数据:', { currentUserId, title, status })

      const videoData: VideoInsert = {
        title,
        description,
        difficulty,
        status,
        cloudflare_stream_id: streamVideo.uid,
        duration: Math.round(duration),
        thumbnail_url: cloudflareStream.getThumbnailUrl(streamVideo.uid, {
          time: '10s',
          width: 640,
          height: 360
        }),
        created_by: currentUserId
      }

      console.log('视频数据对象:', videoData)

      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single()

      if (error) {
        throw new Error(`数据库保存失败: ${error.message}`)
      }

      this.updateProgress('completed', 100, '视频上传完成!')
      return data.id

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      this.updateProgress('error', 0, '上传失败', errorMessage)
      throw error
    }
  }

  /**
   * 验证视频文件
   */
  private validateVideoFile(file: File): void {
    // 检查文件类型
    const allowedTypes = [
      'video/mp4',
      'video/quicktime', // .mov
      'video/avi',
      'video/webm',
      'video/mkv'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件格式: ${file.type}`)
    }

    // 检查文件大小 (限制 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      throw new Error(`文件过大: ${(file.size / 1024 / 1024).toFixed(1)}MB, 最大支持 500MB`)
    }

    // 检查文件名
    if (file.name.length === 0) {
      throw new Error('文件名不能为空')
    }
  }

  /**
   * 等待 Cloudflare Stream 处理完成
   */
  private async waitForVideoProcessing(videoId: string, maxAttempts = 30): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const video = await cloudflareStream.getVideo(videoId)

      if (video.status.state === 'ready') {
        return // 处理完成
      }

      if (video.status.state === 'error') {
        throw new Error(`视频处理失败: ${video.status.errorReasonText || '未知错误'}`)
      }

      // 更新进度
      const progressPercent = video.status.pctComplete
        ? parseInt(video.status.pctComplete)
        : (attempt / maxAttempts) * 20 + 60

      this.updateProgress(
        'processing',
        Math.min(progressPercent, 79),
        `处理进度: ${video.status.pctComplete || 'Unknown'}% (${video.status.state})`
      )

      // 等待 2 秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    throw new Error('视频处理超时，请稍后重试')
  }
}

/**
 * 便捷函数：上传视频
 */
export const uploadVideoToCloudflare = async (
  options: VideoUploadOptions,
  onProgress?: (progress: VideoUploadProgress) => void,
  currentUserId?: string
): Promise<string> => {
  const service = new VideoUploadService(onProgress)
  return service.uploadVideo(options, currentUserId)
}

/**
 * 便捷函数：删除视频
 */
export const deleteVideo = async (videoId: string): Promise<void> => {
  // 1. 从数据库获取视频信息
  const { data: video, error } = await supabase
    .from('videos')
    .select('cloudflare_stream_id')
    .eq('id', videoId)
    .single()

  if (error || !video) {
    throw new Error('视频不存在')
  }

  // 2. 从 Cloudflare Stream 删除
  await cloudflareStream.deleteVideo(video.cloudflare_stream_id)

  // 3. 从数据库删除
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)

  if (deleteError) {
    throw new Error(`删除失败: ${deleteError.message}`)
  }
}

/**
 * 便捷函数：更新视频状态
 */
export const updateVideoStatus = async (
  videoId: string,
  status: 'draft' | 'published'
): Promise<void> => {
  const { error } = await supabase
    .from('videos')
    .update({ status })
    .eq('id', videoId)

  if (error) {
    throw new Error(`状态更新失败: ${error.message}`)
  }
}