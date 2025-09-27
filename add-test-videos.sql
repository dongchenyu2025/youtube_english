-- 检查videos表数据并添加测试数据
SELECT 'videos表检查' as step, COUNT(*) as video_count FROM videos;

-- 查看现有视频
SELECT
  '现有视频列表' as step,
  id,
  title,
  status,
  difficulty,
  duration,
  created_at
FROM videos
ORDER BY created_at DESC;

-- 如果没有视频，插入一些测试数据
INSERT INTO videos (id, title, description, thumbnail_url, cloudflare_stream_id, status, difficulty, duration, created_at)
SELECT
  gen_random_uuid(),
  'English Learning Demo - ' || series.num,
  'This is a demo video for testing the platform. Video ' || series.num || ' covers basic English conversation topics.',
  'https://via.placeholder.com/320x180/007bff/ffffff?text=Video+' || series.num,
  'demo-stream-id-' || series.num,
  'published',
  CASE
    WHEN series.num <= 2 THEN 'beginner'
    WHEN series.num <= 4 THEN 'intermediate'
    ELSE 'advanced'
  END,
  300 + (series.num * 120), -- 5-15分钟的视频
  NOW() - (series.num || ' hours')::interval
FROM generate_series(1, 6) as series(num)
WHERE NOT EXISTS (SELECT 1 FROM videos LIMIT 1);

-- 为测试视频添加一些字幕数据
INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text, created_at)
SELECT
  v.id,
  0.0,
  5.0,
  'Hello everyone, welcome to our English learning platform!',
  '大家好，欢迎来到我们的英语学习平台！',
  NOW()
FROM videos v
WHERE v.title LIKE 'English Learning Demo%'
  AND NOT EXISTS (SELECT 1 FROM subtitles WHERE video_id = v.id)
LIMIT 1;

-- 验证插入结果
SELECT
  '插入后统计' as step,
  (SELECT COUNT(*) FROM videos WHERE status = 'published') as published_videos,
  (SELECT COUNT(*) FROM subtitles) as subtitle_entries;