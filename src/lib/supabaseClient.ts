import { createClient } from '@supabase/supabase-js'

// Supabase configuration - 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://boyyfwfjqczykgufyasp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTA0MjUsImV4cCI6MjA3NDEyNjQyNX0.q5RlpJyVSK7dqbP1BpTc4l4ruL8-e_VUs4wzcKOKoAA'

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// 数据库表的类型定义
export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          title: string
          description?: string
          thumbnail_url?: string
          cloudflare_stream_id: string
          status: 'draft' | 'published'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          created_by?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          thumbnail_url?: string
          cloudflare_stream_id: string
          status?: 'draft' | 'published'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          created_by?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string
          cloudflare_stream_id?: string
          status?: 'draft' | 'published'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          created_by?: string
        }
      }
      subtitles: {
        Row: {
          id: number
          video_id: string
          start_time: number
          end_time: number
          english_text: string
          chinese_text?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username?: string
          email?: string
          full_name?: string
          status: 'pending' | 'approved' | 'suspended'
          role: 'user' | 'admin'
          created_at: string
          approved_at?: string
          approved_by?: string
        }
        Insert: {
          id: string
          username?: string
          email?: string
          full_name?: string
          status?: 'pending' | 'approved' | 'suspended'
          role?: 'user' | 'admin'
        }
        Update: {
          username?: string
          email?: string
          full_name?: string
          status?: 'pending' | 'approved' | 'suspended'
          role?: 'user' | 'admin'
          approved_at?: string
          approved_by?: string
        }
      }
      user_video_progress: {
        Row: {
          id: number
          user_id: string
          video_id: string
          last_position: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          video_id: string
          last_position?: number
          completed?: boolean
        }
        Update: {
          last_position?: number
          completed?: boolean
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 便捷的类型别名
export type VideoRow = Tables<'videos'>
export type SubtitleRow = Tables<'subtitles'>
export type ProfileRow = Tables<'profiles'>
export type UserVideoProgressRow = Tables<'user_video_progress'>
export type VideoInsert = Inserts<'videos'>
export type VideoUpdate = Updates<'videos'>