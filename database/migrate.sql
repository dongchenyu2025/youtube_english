-- 数据库迁移脚本
-- 用于从开发环境迁移到生产环境

-- 1. 清理现有数据 (仅在必要时使用)
-- DROP TABLE IF EXISTS user_collections CASCADE;
-- DROP TABLE IF EXISTS subtitles CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;

-- 2. 重新运行初始化脚本
-- \i init.sql

-- 3. 或者执行增量迁移

-- 添加新字段到现有表 (示例)
-- ALTER TABLE videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
-- ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration REAL;

-- 添加新索引 (示例)
-- CREATE INDEX IF NOT EXISTS idx_videos_view_count ON videos(view_count DESC);

-- 更新现有数据 (示例)
-- UPDATE videos SET view_count = 0 WHERE view_count IS NULL;