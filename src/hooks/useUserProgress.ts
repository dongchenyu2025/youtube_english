import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

interface UseUserProgressProps {
  videoId: string
}

interface UserProgress {
  lastPosition: number
  completed: boolean
  updatedAt: string
}

export const useUserProgress = ({ videoId }: UseUserProgressProps) => {
  const { user, isAuthenticated } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载用户进度
  const loadProgress = useCallback(async () => {
    if (!isAuthenticated || !user || !videoId) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_video_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('加载进度失败:', error)
        setProgress(null)
      } else if (data) {
        setProgress({
          lastPosition: data.last_position,
          completed: data.completed,
          updatedAt: data.updated_at
        })
      } else {
        setProgress(null)
      }
    } catch (error) {
      console.error('加载用户进度失败:', error)
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, videoId])

  // 保存用户进度
  const saveProgress = useCallback(async (
    lastPosition: number,
    completed: boolean = false
  ) => {
    if (!isAuthenticated || !user || !videoId) {
      return
    }

    try {
      const progressData = {
        user_id: user.id,
        video_id: videoId,
        last_position: lastPosition,
        completed: completed,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_video_progress')
        .upsert(progressData, {
          onConflict: 'user_id,video_id'
        })

      if (error) {
        console.error('保存进度失败:', error)
      } else {
        // 更新本地状态
        setProgress({
          lastPosition: lastPosition,
          completed: completed,
          updatedAt: progressData.updated_at
        })
      }
    } catch (error) {
      console.error('保存用户进度失败:', error)
    }
  }, [isAuthenticated, user, videoId])

  // 标记为完成
  const markAsCompleted = useCallback(async () => {
    if (progress) {
      await saveProgress(progress.lastPosition, true)
    }
  }, [progress, saveProgress])

  // 重置进度
  const resetProgress = useCallback(async () => {
    await saveProgress(0, false)
  }, [saveProgress])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    progress,
    loading,
    saveProgress,
    markAsCompleted,
    resetProgress,
    refetchProgress: loadProgress
  }
}