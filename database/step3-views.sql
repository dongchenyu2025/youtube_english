-- 第三步：创建视图和函数
-- 确保在前两步执行成功后再执行此脚本

-- 1. 创建视图以便于查询
CREATE OR REPLACE VIEW video_with_subtitle_count AS
SELECT
  v.*,
  COUNT(s.id) as subtitle_count,
  MIN(s.start_time) as first_subtitle_time,
  MAX(s.end_time) as last_subtitle_time
FROM videos v
LEFT JOIN subtitles s ON v.id = s.video_id
GROUP BY v.id, v.title, v.description, v.thumbnail_url, v.cloudflare_stream_id, v.created_at, v.updated_at;

-- 2. 创建函数以搜索字幕内容
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

-- 3. 创建统计视图
CREATE OR REPLACE VIEW platform_statistics AS
SELECT
  (SELECT COUNT(*) FROM videos) as total_videos,
  (SELECT COUNT(*) FROM subtitles) as total_subtitles,
  (SELECT COUNT(*) FROM user_collections) as total_collections,
  (SELECT COUNT(DISTINCT user_id) FROM user_collections) as active_users,
  (SELECT AVG(subtitle_count) FROM video_with_subtitle_count) as avg_subtitles_per_video;

-- 完成所有初始化
SELECT 'Database initialization completed successfully!' as status;