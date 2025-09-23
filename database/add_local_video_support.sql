-- 添加本地视频支持
-- 为视频表添加 local_video_url 字段，使 cloudflare_stream_id 可选

-- 1. 添加 local_video_url 字段
ALTER TABLE videos ADD COLUMN IF NOT EXISTS local_video_url TEXT;

-- 2. 修改 cloudflare_stream_id 为可选
ALTER TABLE videos ALTER COLUMN cloudflare_stream_id DROP NOT NULL;

-- 3. 添加约束：必须有 cloudflare_stream_id 或 local_video_url 中的一个
ALTER TABLE videos ADD CONSTRAINT videos_source_check
CHECK (
  (cloudflare_stream_id IS NOT NULL AND local_video_url IS NULL)
  OR
  (cloudflare_stream_id IS NULL AND local_video_url IS NOT NULL)
);

-- 4. 更新现有数据，添加本地视频 URL 用于测试
UPDATE videos SET
  local_video_url = '/videos/sample-video-1.mp4',
  cloudflare_stream_id = NULL
WHERE title LIKE 'TED演讲%';

UPDATE videos SET
  local_video_url = '/videos/sample-video-2.mp4',
  cloudflare_stream_id = NULL
WHERE title LIKE '商务对话%';

UPDATE videos SET
  local_video_url = '/videos/sample-video-3.mp4',
  cloudflare_stream_id = NULL
WHERE title LIKE '日常交流%';

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_videos_local_url ON videos(local_video_url);

SELECT 'Local video support added successfully!' as status;