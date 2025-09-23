-- 简化版数据库创建脚本
-- 只创建基本表结构，不包含复杂的策略和触发器

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建视频表
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  cloudflare_stream_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 创建字幕表
CREATE TABLE subtitles (
  id BIGSERIAL PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  english_text TEXT NOT NULL,
  chinese_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT subtitles_time_order CHECK (start_time <= end_time)
);

-- 4. 创建用户收藏表
CREATE TABLE user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, word)
);

-- 5. 创建基本索引
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_subtitles_video_id ON subtitles(video_id);
CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);

-- 完成基本表创建
SELECT 'Basic tables created successfully!' as status;