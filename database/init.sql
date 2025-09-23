-- 视频跟练英语学习平台数据库设计
-- 基于 PRD_0922.md 的需求设计

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 启用 RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- 3. 创建视频表
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  cloudflare_stream_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 创建字幕表
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

-- 5. 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- 确保同一用户不重复收藏同一单词
  UNIQUE(user_id, word)
);

-- 6. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtitles_video_id ON subtitles(video_id);
CREATE INDEX IF NOT EXISTS idx_subtitles_time_range ON subtitles(video_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(user_id, created_at DESC);

-- 7. 启用行级安全策略 (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- 8. 创建 RLS 策略

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

-- 9. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 创建触发器以自动更新 updated_at 字段
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. 插入示例数据 (仅在开发环境使用)
-- 注意：在生产环境中，这些数据应该通过管理界面或API插入

INSERT INTO videos (title, description, cloudflare_stream_id) VALUES
  (
    'TED演讲: 科技创新改变世界',
    '探讨现代科技如何改变我们的生活方式和工作方式，以及未来的发展趋势。',
    'sample-cloudflare-stream-id-1'
  ),
  (
    '商务对话: 国际会议讨论',
    '真实的商务场景对话，帮助提升职场英语交流能力。',
    'sample-cloudflare-stream-id-2'
  ),
  (
    '日常交流: 超市购物对话',
    '日常生活中的实用对话，学习购物时的常用表达。',
    'sample-cloudflare-stream-id-3'
  );

-- 12. 插入示例字幕数据
-- 为第一个视频插入字幕
INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text)
SELECT
  v.id,
  generate_series * 5.0,
  (generate_series + 1) * 5.0,
  CASE generate_series
    WHEN 0 THEN 'Today, technology is changing the world at an unprecedented pace.'
    WHEN 1 THEN 'We see artificial intelligence, machine learning, and robotics transforming every industry.'
    WHEN 2 THEN 'But with great power comes great responsibility.'
    WHEN 3 THEN 'How do we ensure that these technologies benefit all of humanity?'
    WHEN 4 THEN 'The answer lies in ethical development and responsible deployment.'
    ELSE 'This is a sample subtitle line number ' || generate_series || '.'
  END,
  CASE generate_series
    WHEN 0 THEN '今天，科技正以前所未有的速度改变着世界。'
    WHEN 1 THEN '我们看到人工智能、机器学习和机器人技术正在改变每一个行业。'
    WHEN 2 THEN '但是能力越大，责任越大。'
    WHEN 3 THEN '我们如何确保这些技术造福全人类？'
    WHEN 4 THEN '答案在于道德发展和负责任的部署。'
    ELSE '这是第 ' || generate_series || ' 行示例字幕。'
  END
FROM videos v, generate_series(0, 9)
WHERE v.title LIKE 'TED演讲%'
LIMIT 10;

-- 13. 创建视图以便于查询
CREATE OR REPLACE VIEW video_with_subtitle_count AS
SELECT
  v.*,
  COUNT(s.id) as subtitle_count,
  MIN(s.start_time) as first_subtitle_time,
  MAX(s.end_time) as last_subtitle_time
FROM videos v
LEFT JOIN subtitles s ON v.id = s.video_id
GROUP BY v.id, v.title, v.description, v.thumbnail_url, v.cloudflare_stream_id, v.created_at, v.updated_at;

-- 14. 创建函数以搜索字幕内容
CREATE OR REPLACE FUNCTION search_subtitles(search_term TEXT)
RETURNS TABLE(
  video_id UUID,
  video_title TEXT,
  subtitle_id BIGINT,
  english_text TEXT,
  chinese_text TEXT,
  start_time REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    s.id,
    s.english_text,
    s.chinese_text,
    s.start_time
  FROM videos v
  JOIN subtitles s ON v.id = s.video_id
  WHERE
    s.english_text ILIKE '%' || search_term || '%'
    OR s.chinese_text ILIKE '%' || search_term || '%'
  ORDER BY v.created_at DESC, s.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- 15. 创建统计视图
CREATE OR REPLACE VIEW platform_statistics AS
SELECT
  (SELECT COUNT(*) FROM videos) as total_videos,
  (SELECT COUNT(*) FROM subtitles) as total_subtitles,
  (SELECT COUNT(*) FROM user_collections) as total_collections,
  (SELECT COUNT(DISTINCT user_id) FROM user_collections) as active_users,
  (SELECT AVG(subtitle_count) FROM video_with_subtitle_count) as avg_subtitles_per_video;

-- 完成初始化
SELECT 'Database initialization completed successfully!' as status;