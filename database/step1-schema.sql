-- 第一步：创建表结构
-- 视频跟练英语学习平台数据库设计 (Supabase 版本)

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建视频表
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  cloudflare_stream_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 创建字幕表
CREATE TABLE IF NOT EXISTS subtitles (
  id BIGSERIAL PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  english_text TEXT NOT NULL,
  chinese_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- 创建索引以优化查询性能
  CONSTRAINT subtitles_time_order CHECK (start_time <= end_time)
);

-- 4. 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- 确保同一用户不重复收藏同一单词
  UNIQUE(user_id, word)
);

-- 5. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtitles_video_id ON subtitles(video_id);
CREATE INDEX IF NOT EXISTS idx_subtitles_time_range ON subtitles(video_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(user_id, created_at DESC);

-- 6. 启用行级安全策略 (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- 7. 创建 RLS 策略

-- 视频表策略 - 所有人都可以查看视频
CREATE POLICY "Videos are viewable by everyone" ON videos
  FOR SELECT USING (true);

-- 视频表策略 - 只有认证用户可以插入视频 (管理员功能)
CREATE POLICY "Authenticated users can insert videos" ON videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 字幕表策略 - 所有人都可以查看字幕
CREATE POLICY "Subtitles are viewable by everyone" ON subtitles
  FOR SELECT USING (true);

-- 字幕表策略 - 只有认证用户可以插入字幕 (管理员功能)
CREATE POLICY "Authenticated users can insert subtitles" ON subtitles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户收藏策略 - 用户只能查看自己的收藏
CREATE POLICY "Users can view own collections" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);

-- 用户收藏策略 - 用户只能插入自己的收藏
CREATE POLICY "Users can insert own collections" ON user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户收藏策略 - 用户只能删除自己的收藏
CREATE POLICY "Users can delete own collections" ON user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- 8. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 创建触发器以自动更新 updated_at 字段
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 完成表结构创建
SELECT 'Database schema created successfully!' as status;