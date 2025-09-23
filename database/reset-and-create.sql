-- 重置数据库：先清理再重建
-- 警告：这将删除所有现有数据！

-- 1. 删除现有的策略（如果存在）
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Subtitles are viewable by everyone" ON subtitles;
DROP POLICY IF EXISTS "Authenticated users can insert subtitles" ON subtitles;
DROP POLICY IF EXISTS "Users can view own collections" ON user_collections;
DROP POLICY IF EXISTS "Users can insert own collections" ON user_collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON user_collections;

-- 2. 删除现有的视图和函数（如果存在）
DROP VIEW IF EXISTS video_with_subtitle_count;
DROP VIEW IF EXISTS platform_statistics;
DROP FUNCTION IF EXISTS search_subtitles(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. 删除现有的表（按依赖关系逆序）
DROP TABLE IF EXISTS user_collections;
DROP TABLE IF EXISTS subtitles;
DROP TABLE IF EXISTS videos;

-- 4. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. 重新创建视频表
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  cloudflare_stream_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 重新创建字幕表
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

-- 7. 重新创建用户收藏表
CREATE TABLE user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, word)
);

-- 8. 创建索引
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_subtitles_video_id ON subtitles(video_id);
CREATE INDEX idx_subtitles_time_range ON subtitles(video_id, start_time, end_time);
CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_user_collections_created_at ON user_collections(user_id, created_at DESC);

-- 9. 启用 RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- 10. 创建 RLS 策略
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert videos" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Subtitles are viewable by everyone" ON subtitles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert subtitles" ON subtitles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can view own collections" ON user_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON user_collections FOR DELETE USING (auth.uid() = user_id);

-- 11. 创建更新函数和触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 完成重建
SELECT 'Database reset and schema created successfully!' as status;