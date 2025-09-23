import { createServerSupabase } from './supabase-server'
import { Video, Subtitle, VideoWithSubtitles, UserCollection } from '@/types'

export async function getVideos(): Promise<Video[]> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  return data || []
}

export async function getVideoWithSubtitles(videoId: string): Promise<VideoWithSubtitles | null> {
  const supabase = createServerSupabase()

  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single()

  if (videoError) {
    console.error('Error fetching video:', videoError)
    return null
  }

  const { data: subtitles, error: subtitlesError } = await supabase
    .from('subtitles')
    .select('*')
    .eq('video_id', videoId)
    .order('start_time', { ascending: true })

  if (subtitlesError) {
    console.error('Error fetching subtitles:', subtitlesError)
    return null
  }

  return {
    ...video,
    subtitles: subtitles || []
  }
}

export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('user_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching collections:', error)
    return []
  }

  return data || []
}