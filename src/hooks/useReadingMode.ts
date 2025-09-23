import { useEffect, useRef } from 'react'
import { Subtitle } from '@/types'
import { VideoPlayerRef } from '@/components/VideoPlayer'

interface UseReadingModeOptions {
  enabled: boolean
  currentSubtitle: Subtitle | null
  currentTime: number
  onSubtitleEnd: () => void
  videoPlayerRef: React.RefObject<VideoPlayerRef>
}

export const useReadingMode = (
  { enabled, currentSubtitle, currentTime, onSubtitleEnd, videoPlayerRef }: UseReadingModeOptions
) => {
  const lastSubtitleRef = useRef<Subtitle | null>(null)
  const hasTriggeredPauseRef = useRef(false)
  const targetEndTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !currentSubtitle) {
      hasTriggeredPauseRef.current = false
      targetEndTimeRef.current = null
      return
    }

    // 检查是否切换到新的字幕
    if (lastSubtitleRef.current?.id !== currentSubtitle.id) {
      hasTriggeredPauseRef.current = false
      lastSubtitleRef.current = currentSubtitle
      targetEndTimeRef.current = currentSubtitle.end_time
    }

    // 检查当前字幕是否播放完成
    if (targetEndTimeRef.current && currentTime >= targetEndTimeRef.current && !hasTriggeredPauseRef.current) {
      hasTriggeredPauseRef.current = true
      targetEndTimeRef.current = null
      onSubtitleEnd()
    }

  }, [enabled, currentSubtitle, currentTime, onSubtitleEnd])

  // 添加更频繁的时间检查
  useEffect(() => {
    if (!enabled || !targetEndTimeRef.current || hasTriggeredPauseRef.current) {
      return
    }

    const checkTime = () => {
      const currentTime = videoPlayerRef.current?.getCurrentTime() || 0

      if (targetEndTimeRef.current && currentTime >= targetEndTimeRef.current && !hasTriggeredPauseRef.current) {
        hasTriggeredPauseRef.current = true
        targetEndTimeRef.current = null
        onSubtitleEnd()
      }
    }

    const interval = setInterval(checkTime, 50) // 每50ms检查一次

    return () => clearInterval(interval)
  }, [enabled, targetEndTimeRef.current, hasTriggeredPauseRef.current, onSubtitleEnd, videoPlayerRef])

  useEffect(() => {
    // 当禁用点读模式时，重置状态
    if (!enabled) {
      hasTriggeredPauseRef.current = false
      lastSubtitleRef.current = null
      targetEndTimeRef.current = null
    }
  }, [enabled])
}