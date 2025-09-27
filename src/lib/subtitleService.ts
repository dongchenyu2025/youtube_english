import { supabase } from './supabaseClient'
import { SubtitleEntry } from './srtParser'

export interface SubtitleUploadProgress {
  stage: 'parsing' | 'validating' | 'uploading' | 'complete' | 'error'
  progress: number
  message: string
  error?: string
}

export interface SubtitleOperationResult {
  success: boolean
  message: string
  data?: {
    inserted: number
    updated: number
    errors: string[]
  }
  error?: string
}

export class SubtitleService {
  static async getSubtitlesForVideo(videoId: string) {
    try {
      const { data, error } = await supabase
        .from('subtitles')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true })

      if (error) {
        throw error
      }

      return {
        success: true,
        data: data || []
      }
    } catch (error) {
      return {
        success: false,
        error: `获取字幕失败: ${error instanceof Error ? error.message : String(error)}`,
        data: []
      }
    }
  }

  static async deleteSubtitlesForVideo(videoId: string): Promise<SubtitleOperationResult> {
    try {
      const { error } = await supabase
        .from('subtitles')
        .delete()
        .eq('video_id', videoId)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: '删除字幕成功'
      }
    } catch (error) {
      return {
        success: false,
        message: '删除字幕失败',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static async uploadSubtitles(
    videoId: string,
    subtitles: SubtitleEntry[],
    progressCallback?: (progress: SubtitleUploadProgress) => void
  ): Promise<SubtitleOperationResult> {

    progressCallback?.({
      stage: 'validating',
      progress: 0,
      message: '正在验证字幕数据...'
    })

    try {
      // Validate subtitles
      if (!videoId || !subtitles || subtitles.length === 0) {
        throw new Error('视频ID或字幕数据无效')
      }

      // Check for duplicate times
      const timeSet = new Set<string>()
      for (const subtitle of subtitles) {
        const timeKey = `${subtitle.startTime}-${subtitle.endTime}`
        if (timeSet.has(timeKey)) {
          throw new Error(`发现重复的时间段: ${subtitle.startTime}s - ${subtitle.endTime}s`)
        }
        timeSet.add(timeKey)
      }

      progressCallback?.({
        stage: 'uploading',
        progress: 10,
        message: '正在清除旧字幕...'
      })

      // Delete existing subtitles for this video
      await this.deleteSubtitlesForVideo(videoId)

      progressCallback?.({
        stage: 'uploading',
        progress: 20,
        message: '正在准备字幕数据...'
      })

      // Prepare subtitle data for insertion
      const subtitleRows = subtitles.map((subtitle, index) => ({
        video_id: videoId,
        start_time: subtitle.startTime,
        end_time: subtitle.endTime,
        english_text: subtitle.english.trim(),
        chinese_text: subtitle.chinese?.trim() || null
      }))

      progressCallback?.({
        stage: 'uploading',
        progress: 30,
        message: `正在上传 ${subtitleRows.length} 条字幕...`
      })

      // Insert subtitles in batches for better performance
      const batchSize = 100
      let inserted = 0
      const errors: string[] = []

      for (let i = 0; i < subtitleRows.length; i += batchSize) {
        const batch = subtitleRows.slice(i, i + batchSize)

        try {
          const { error } = await supabase
            .from('subtitles')
            .insert(batch)

          if (error) {
            throw error
          }

          inserted += batch.length

          const progress = 30 + Math.floor((inserted / subtitleRows.length) * 60)
          progressCallback?.({
            stage: 'uploading',
            progress,
            message: `已上传 ${inserted}/${subtitleRows.length} 条字幕...`
          })

        } catch (batchError) {
          const errorMsg = `批次 ${Math.floor(i / batchSize) + 1} 上传失败: ${batchError instanceof Error ? batchError.message : String(batchError)}`
          errors.push(errorMsg)
          console.error('Batch upload error:', batchError)
        }
      }

      if (inserted === 0) {
        throw new Error('所有字幕上传失败')
      }

      progressCallback?.({
        stage: 'complete',
        progress: 100,
        message: `字幕上传完成！成功上传 ${inserted} 条字幕`
      })

      return {
        success: true,
        message: `字幕上传成功！上传了 ${inserted} 条字幕`,
        data: {
          inserted,
          updated: 0,
          errors
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      progressCallback?.({
        stage: 'error',
        progress: 0,
        message: '字幕上传失败',
        error: errorMessage
      })

      return {
        success: false,
        message: '字幕上传失败',
        error: errorMessage
      }
    }
  }

  static async updateSubtitle(
    subtitleId: number,
    updates: {
      start_time?: number
      end_time?: number
      english_text?: string
      chinese_text?: string
    }
  ): Promise<SubtitleOperationResult> {
    try {
      const { error } = await supabase
        .from('subtitles')
        .update(updates)
        .eq('id', subtitleId)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: '字幕更新成功'
      }
    } catch (error) {
      return {
        success: false,
        message: '字幕更新失败',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static async deleteSubtitle(subtitleId: number): Promise<SubtitleOperationResult> {
    try {
      const { error } = await supabase
        .from('subtitles')
        .delete()
        .eq('id', subtitleId)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: '字幕删除成功'
      }
    } catch (error) {
      return {
        success: false,
        message: '字幕删除失败',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  static async getSubtitleStats(videoId: string) {
    try {
      const { data, error } = await supabase
        .from('subtitles')
        .select('id, start_time, end_time, chinese_text')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true })

      if (error) {
        throw error
      }

      const subtitles = data || []
      const totalCount = subtitles.length

      let totalDuration = 0
      if (subtitles.length > 0) {
        const lastSubtitle = subtitles[subtitles.length - 1]
        totalDuration = lastSubtitle.end_time
      }

      const hasChinese = subtitles.some(s => s.chinese_text && s.chinese_text.trim() !== '')

      return {
        success: true,
        data: {
          totalCount,
          totalDuration,
          hasChinese,
          hasEnglish: totalCount > 0
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `获取字幕统计失败: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  static async exportSubtitlesToSRT(videoId: string, language: 'english' | 'chinese' | 'bilingual' = 'english'): Promise<{success: boolean; data?: string; error?: string}> {
    try {
      const result = await this.getSubtitlesForVideo(videoId)
      if (!result.success) {
        throw new Error(result.error || '获取字幕失败')
      }

      const subtitles = result.data
      if (subtitles.length === 0) {
        return {
          success: false,
          error: '该视频没有字幕'
        }
      }

      let srtContent = ''

      subtitles.forEach((subtitle, index) => {
        const startTime = this.formatTimeToSRT(subtitle.start_time)
        const endTime = this.formatTimeToSRT(subtitle.end_time)

        srtContent += `${index + 1}\n`
        srtContent += `${startTime} --> ${endTime}\n`

        switch (language) {
          case 'english':
            srtContent += `${subtitle.english_text}\n`
            break
          case 'chinese':
            if (subtitle.chinese_text) {
              srtContent += `${subtitle.chinese_text}\n`
            } else {
              srtContent += `${subtitle.english_text}\n`
            }
            break
          case 'bilingual':
            srtContent += `${subtitle.english_text}\n`
            if (subtitle.chinese_text) {
              srtContent += `${subtitle.chinese_text}\n`
            }
            break
        }

        srtContent += '\n'
      })

      return {
        success: true,
        data: srtContent
      }

    } catch (error) {
      return {
        success: false,
        error: `导出SRT失败: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  private static formatTimeToSRT(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
      .toString()
      .padStart(3, '0')}`
  }

  static validateVideoExists = async (videoId: string): Promise<{exists: boolean; title?: string}> => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('title')
        .eq('id', videoId)
        .single()

      if (error || !data) {
        return { exists: false }
      }

      return {
        exists: true,
        title: data.title
      }
    } catch {
      return { exists: false }
    }
  }
}

export default SubtitleService