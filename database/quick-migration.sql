-- 快速迁移脚本 - 仅添加必要字段
-- 适用于现有开发环境的增量更新

-- 为 videos 表添加新字段
ALTER TABLE videos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 更新现有视频为已发布状态
UPDATE videos SET status = 'published' WHERE status IS NULL;

-- 添加有用的索引
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_videos_difficulty ON videos(difficulty);

SELECT 'Quick migration completed - videos table updated!' as status;