-- 快速添加测试数据到 videos 表
-- 仅在没有数据时执行

-- 1. 检查现有数据
SELECT 'videos表现状' as status, COUNT(*) as total_videos FROM videos;

-- 2. 快速迁移（为videos表添加必要字段）
ALTER TABLE videos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 3. 更新现有视频状态
UPDATE videos SET status = 'published' WHERE status IS NULL;

-- 4. 如果没有视频，插入测试数据
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM videos) = 0 THEN
        -- 插入测试视频
        INSERT INTO videos (id, title, description, thumbnail_url, cloudflare_stream_id, status, difficulty, duration, created_at) VALUES
        (gen_random_uuid(), '英语书签教程 - 入门级', '学习如何在浏览器中使用英语书签功能，包含基础词汇和操作步骤。', 'https://via.placeholder.com/320x180/007bff/ffffff?text=Bookmark+Tutorial', 'demo-bookmark-tutorial', 'published', 'beginner', 420, NOW() - interval '2 days'),
        (gen_random_uuid(), '日常英语对话 - 初级', '日常生活中的英语对话练习，包含问候、购物、用餐等场景。', 'https://via.placeholder.com/320x180/28a745/ffffff?text=Daily+English', 'demo-daily-english', 'published', 'beginner', 300, NOW() - interval '1 day'),
        (gen_random_uuid(), '商务英语会议 - 中级', '商务环境下的英语会议技巧，学习专业词汇和表达方式。', 'https://via.placeholder.com/320x180/ffc107/000000?text=Business+English', 'demo-business-english', 'published', 'intermediate', 600, NOW() - interval '3 hours'),
        (gen_random_uuid(), '英语演讲技巧 - 高级', '提升英语公众演讲能力，掌握高级表达技巧和演讲结构。', 'https://via.placeholder.com/320x180/dc3545/ffffff?text=Speech+Skills', 'demo-speech-skills', 'published', 'advanced', 900, NOW() - interval '1 hour'),
        (gen_random_uuid(), '旅游英语指南 - 中级', '出国旅游必备的英语表达，包含机场、酒店、景点等场景。', 'https://via.placeholder.com/320x180/17a2b8/ffffff?text=Travel+English', 'demo-travel-english', 'published', 'intermediate', 480, NOW() - interval '6 hours'),
        (gen_random_uuid(), '技术英语词汇 - 高级', 'IT和技术行业的英语专业词汇，适合程序员和工程师学习。', 'https://via.placeholder.com/320x180/6c757d/ffffff?text=Tech+English', 'demo-tech-english', 'published', 'advanced', 720, NOW() - interval '12 hours');

        RAISE NOTICE '✅ 已插入 6 个测试视频';
    ELSE
        RAISE NOTICE '✅ videos 表已有数据，跳过插入';
    END IF;
END $$;

-- 5. 为第一个视频添加测试字幕（如果没有字幕的话）
DO $$
DECLARE
    first_video_id UUID;
BEGIN
    -- 获取第一个视频的ID
    SELECT id INTO first_video_id FROM videos ORDER BY created_at LIMIT 1;

    IF first_video_id IS NOT NULL AND (SELECT COUNT(*) FROM subtitles WHERE video_id = first_video_id) = 0 THEN
        INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text, created_at) VALUES
        (first_video_id, 0.0, 5.5, 'Hello everyone, welcome to our English learning platform!', '大家好，欢迎来到我们的英语学习平台！', NOW()),
        (first_video_id, 5.5, 12.0, 'Today we''re going to learn about bookmarks in your browser.', '今天我们将学习浏览器中的书签功能。', NOW()),
        (first_video_id, 12.0, 18.5, 'Bookmarks help you save your favorite websites for quick access.', '书签帮助您保存喜欢的网站以便快速访问。', NOW()),
        (first_video_id, 18.5, 25.0, 'Let me show you how to create and organize your bookmarks.', '让我来展示如何创建和整理您的书签。', NOW()),
        (first_video_id, 25.0, 32.0, 'First, navigate to the website you want to bookmark.', '首先，导航到您想要添加书签的网站。', NOW()),
        (first_video_id, 32.0, 40.0, 'Then click the star icon in the address bar, or press Ctrl+D.', '然后点击地址栏中的星号图标，或按Ctrl+D。', NOW());

        RAISE NOTICE '✅ 已为第一个视频添加测试字幕';
    ELSE
        RAISE NOTICE '✅ 字幕已存在，跳过插入';
    END IF;
END $$;

-- 6. 验证插入结果
SELECT
    '数据库状态检查' as status,
    (SELECT COUNT(*) FROM videos) as total_videos,
    (SELECT COUNT(*) FROM videos WHERE status = 'published') as published_videos,
    (SELECT COUNT(*) FROM subtitles) as total_subtitles;

-- 7. 显示视频列表预览
SELECT
    '视频列表预览' as preview,
    title,
    difficulty,
    duration,
    status
FROM videos
ORDER BY created_at DESC;