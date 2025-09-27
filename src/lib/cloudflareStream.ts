// Cloudflare Stream API 客户端配置
const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_STREAM_TOKEN = import.meta.env.VITE_CLOUDFLARE_STREAM_TOKEN
const CLOUDFLARE_CUSTOMER_CODE = import.meta.env.VITE_CLOUDFLARE_CUSTOMER_CODE
const CLOUDFLARE_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`

export interface CloudflareStreamVideo {
  uid: string
  thumbnail: string
  thumbnailTimestampPct: number
  readyToStream: boolean
  status: {
    state: 'pendingupload' | 'downloading' | 'queued' | 'inprogress' | 'ready' | 'error'
    pctComplete?: string
    errorReasonCode?: string
    errorReasonText?: string
  }
  meta: {
    name?: string
    [key: string]: any
  }
  created: string
  modified: string
  size?: number
  preview?: string
  allowedOrigins?: string[]
  requireSignedURLs?: boolean
  uploaded: string
  uploadExpiry?: string
  maxSizeBytes?: number
  maxDurationSeconds?: number
  duration?: number
  input?: {
    width?: number
    height?: number
  }
  playback?: {
    hls?: string
    dash?: string
  }
  watermark?: {
    uid: string
  }
}

export interface CloudflareStreamUploadResponse {
  result: CloudflareStreamVideo
  success: boolean
  errors: Array<{
    code: number
    message: string
  }>
  messages: Array<{
    code: number
    message: string
  }>
}

export interface CloudflareStreamListResponse {
  result: CloudflareStreamVideo[]
  success: boolean
  errors: Array<{
    code: number
    message: string
  }>
  messages: Array<{
    code: number
    message: string
  }>
}

class CloudflareStreamClient {
  private baseUrl: string
  private token: string

  constructor() {
    // 对于播放功能，不需要 API 凭证
    // 只有上传、管理功能才需要凭证
    if (CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_STREAM_TOKEN) {
      this.baseUrl = CLOUDFLARE_API_BASE
      this.token = CLOUDFLARE_STREAM_TOKEN
    } else {
      // 播放功能不需要凭证，只需要 getPlaybackUrl 方法
      console.warn('⚠️ Cloudflare Stream API 凭证未配置，只能使用播放功能')
      this.baseUrl = ''
      this.token = ''
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }
  }

  private getFormHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
    }
  }

  /**
   * 上传视频文件到 Cloudflare Stream
   */
  async uploadVideo(
    file: File,
    metadata?: {
      name?: string
      requireSignedURLs?: boolean
      allowedOrigins?: string[]
      watermark?: string
    }
  ): Promise<CloudflareStreamVideo> {
    const formData = new FormData()
    formData.append('file', file)

    if (metadata) {
      if (metadata.name) {
        formData.append('meta', JSON.stringify({ name: metadata.name }))
      }
      if (metadata.requireSignedURLs !== undefined) {
        formData.append('requireSignedURLs', metadata.requireSignedURLs.toString())
      }
      if (metadata.allowedOrigins) {
        formData.append('allowedOrigins', metadata.allowedOrigins.join(','))
      }
      if (metadata.watermark) {
        formData.append('watermark', metadata.watermark)
      }
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cloudflare Stream 上传失败:', errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }

    const data: CloudflareStreamUploadResponse = await response.json()

    if (!data.success) {
      throw new Error(`Upload failed: ${data.errors.map(e => e.message).join(', ')}`)
    }

    return data.result
  }

  /**
   * 获取视频详情
   */
  async getVideo(videoId: string): Promise<CloudflareStreamVideo> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      headers: this.getHeaders(),
    })

    const data: CloudflareStreamUploadResponse = await response.json()

    if (!data.success) {
      throw new Error(`Get video failed: ${data.errors.map(e => e.message).join(', ')}`)
    }

    return data.result
  }

  /**
   * 列出所有视频
   */
  async listVideos(): Promise<CloudflareStreamVideo[]> {
    const response = await fetch(this.baseUrl, {
      headers: this.getHeaders(),
    })

    const data: CloudflareStreamListResponse = await response.json()

    if (!data.success) {
      throw new Error(`List videos failed: ${data.errors.map(e => e.message).join(', ')}`)
    }

    return data.result
  }

  /**
   * 删除视频
   */
  async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    const data: CloudflareStreamUploadResponse = await response.json()

    if (!data.success) {
      throw new Error(`Delete video failed: ${data.errors.map(e => e.message).join(', ')}`)
    }
  }

  /**
   * 获取视频播放URL
   */
  getPlaybackUrl(videoId: string, format: 'hls' | 'dash' | 'mp4' | 'iframe' = 'hls'): string {
    // 如果有客户代码，使用官方格式
    if (CLOUDFLARE_CUSTOMER_CODE) {
      const baseUrl = `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}`;
      if (format === 'iframe') {
        return `${baseUrl}/iframe`;
      } else if (format === 'dash') {
        return `${baseUrl}/manifest/video.mpd`
      } else if (format === 'mp4') {
        return `${baseUrl}/downloads/default.mp4`
      }
      return `${baseUrl}/manifest/video.m3u8`
    }

    // 如果有账户ID，尝试构建客户代码（通常是账户ID的前8位）
    if (CLOUDFLARE_ACCOUNT_ID) {
      const customerCode = CLOUDFLARE_ACCOUNT_ID.substring(0, 8);
      console.log(`🔍 尝试使用推断的客户代码: ${customerCode}`)
      const baseUrl = `https://customer-${customerCode}.cloudflarestream.com/${videoId}`;
      if (format === 'iframe') {
        return `${baseUrl}/iframe`;
      } else if (format === 'dash') {
        return `${baseUrl}/manifest/video.mpd`
      } else if (format === 'mp4') {
        return `${baseUrl}/downloads/default.mp4`
      }
      return `${baseUrl}/manifest/video.m3u8`
    }

    // 最后回退到通用格式
    console.warn('⚠️ 未配置 CLOUDFLARE_CUSTOMER_CODE 和 CLOUDFLARE_ACCOUNT_ID，使用通用格式')
    if (format === 'iframe') {
      return `https://videodelivery.net/${videoId}/iframe`;
    } else if (format === 'dash') {
      return `https://videodelivery.net/${videoId}/manifest/video.mpd`
    } else if (format === 'mp4') {
      return `https://videodelivery.net/${videoId}/mp4`
    }
    return `https://videodelivery.net/${videoId}/manifest/video.m3u8`
  }

  /**
   * 获取视频缩略图URL
   */
  getThumbnailUrl(videoId: string, options?: {
    time?: string // 时间戳，格式: 1m2s 或 62s
    width?: number
    height?: number
    fit?: 'crop' | 'clip' | 'scale'
  }): string {
    let url = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`

    if (options) {
      const params = new URLSearchParams()
      if (options.time) params.append('time', options.time)
      if (options.width) params.append('width', options.width.toString())
      if (options.height) params.append('height', options.height.toString())
      if (options.fit) params.append('fit', options.fit)

      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    return url
  }
}

// 导出单例实例
export const cloudflareStream = new CloudflareStreamClient()

// 工具函数：检查Cloudflare Stream配置是否完整
export const isCloudflareStreamConfigured = (): boolean => {
  return !!(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_STREAM_TOKEN)
}

// 工具函数：从Cloudflare Stream URL提取视频ID
export const extractVideoIdFromUrl = (url: string): string | null => {
  const match = url.match(/videodelivery\.net\/([a-f0-9]+)/)
  return match ? match[1] : null
}