// Database types
export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  cloudflare_stream_id: string;
  created_at: string;
}

export interface Subtitle {
  id: number;
  video_id: string;
  start_time: number;
  end_time: number;
  english_text: string;
  chinese_text?: string;
}

export interface UserCollection {
  id: number;
  user_id: string;
  word: string;
  created_at: string;
}

// Component types
export interface VideoCardProps {
  video: Video;
}

export interface DisplaySettings {
  showTranslation: boolean;
  readingMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface PlaybackSettings {
  autoScroll: boolean;
  highlightDelay: number;
  scrollOffset: number;
}

export interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentSubtitleId: number | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface VideoWithSubtitles extends Video {
  subtitles: Subtitle[];
}