-- 🎯 更新真实的 Cloudflare Stream ID
-- 将测试视频ID替换为真实的Stream ID，确保字幕互动功能正常工作

-- 1. 检查当前视频状态
SELECT 'Stream ID 更新前状态' as status,
       title,
       cloudflare_stream_id,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count
FROM videos
ORDER BY created_at;

-- 2. 更新第一个视频 (bookmark 相关视频)
UPDATE videos
SET cloudflare_stream_id = 'f1dcfbd5d645e471579a33a5c9e006dd'
WHERE title LIKE '%书签%' OR title LIKE '%bookmark%' OR title LIKE '%Bookmark%'
AND cloudflare_stream_id != 'f1dcfbd5d645e471579a33a5c9e006dd';

-- 3. 更新第二个视频 (对话/日常英语视频)
UPDATE videos
SET cloudflare_stream_id = 'ae2a47c2ac6036543abb2c2c1dbef65a'
WHERE (title LIKE '%对话%' OR title LIKE '%日常%' OR title LIKE '%Daily%')
AND cloudflare_stream_id != 'ae2a47c2ac6036543abb2c2c1dbef65a';

-- 4. 验证ID格式是否正确 (32位hex格式)
SELECT 'Stream ID 格式验证' as check_type,
       title,
       cloudflare_stream_id,
       CASE
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{32}$' THEN '✅ 格式正确'
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' THEN '✅ UUID格式'
         ELSE '❌ 格式错误'
       END as format_check
FROM videos
WHERE cloudflare_stream_id IN ('f1dcfbd5d645e471579a33a5c9e006dd', 'ae2a47c2ac6036543abb2c2c1dbef65a');

-- 5. 检查更新后的状态
SELECT 'Stream ID 更新后状态' as status,
       id,
       title,
       cloudflare_stream_id,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count,
       status,
       difficulty
FROM videos
WHERE cloudflare_stream_id IN ('f1dcfbd5d645e471579a33a5c9e006dd', 'ae2a47c2ac6036543abb2c2c1dbef65a')
ORDER BY title;

-- 6. 确保这些视频有字幕数据用于测试互动功能
DO $$
DECLARE
    bookmark_video_id UUID;
    daily_video_id UUID;
BEGIN
    -- 获取书签视频ID
    SELECT id INTO bookmark_video_id
    FROM videos
    WHERE cloudflare_stream_id = 'f1dcfbd5d645e471579a33a5c9e006dd'
    LIMIT 1;

    -- 获取日常英语视频ID
    SELECT id INTO daily_video_id
    FROM videos
    WHERE cloudflare_stream_id = 'ae2a47c2ac6036543abb2c2c1dbef65a'
    LIMIT 1;

    -- 为书签视频添加测试字幕（如果没有的话）
    IF bookmark_video_id IS NOT NULL AND (SELECT COUNT(*) FROM subtitles WHERE video_id = bookmark_video_id) = 0 THEN
        INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text, created_at) VALUES
        (bookmark_video_id, 0.0, 5.5, 'Welcome to the bookmark tutorial!', '欢迎观看书签教程！', NOW()),
        (bookmark_video_id, 5.5, 12.0, 'Bookmarks are a great way to save your favorite websites.', '书签是保存您喜爱网站的好方法。', NOW()),
        (bookmark_video_id, 12.0, 18.5, 'Let me show you how to create a bookmark in your browser.', '让我来演示如何在浏览器中创建书签。', NOW()),
        (bookmark_video_id, 18.5, 25.0, 'First, navigate to the website you want to bookmark.', '首先，导航到您想要添加书签的网站。', NOW()),
        (bookmark_video_id, 25.0, 32.0, 'Then click the star icon in the address bar.', '然后点击地址栏中的星号图标。', NOW()),
        (bookmark_video_id, 32.0, 40.0, 'You can also use the keyboard shortcut Ctrl+D.', '您也可以使用键盘快捷键Ctrl+D。', NOW());

        RAISE NOTICE '✅ 已为书签视频 (%) 添加字幕', bookmark_video_id;
    END IF;

    -- 为日常英语视频添加测试字幕（如果没有的话）
    IF daily_video_id IS NOT NULL AND (SELECT COUNT(*) FROM subtitles WHERE video_id = daily_video_id) = 0 THEN
        INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text, created_at) VALUES
        (daily_video_id, 0.0, 4.0, 'Good morning! How are you today?', '早上好！您今天好吗？', NOW()),
        (daily_video_id, 4.0, 8.0, 'I''m fine, thank you. And you?', '我很好，谢谢。您呢？', NOW()),
        (daily_video_id, 8.0, 12.0, 'I''m doing great! What are your plans for today?', '我过得很好！您今天有什么计划？', NOW()),
        (daily_video_id, 12.0, 16.0, 'I''m going to the store to buy some groceries.', '我要去商店买一些食品杂货。', NOW()),
        (daily_video_id, 16.0, 20.0, 'That sounds like a good plan.', '这听起来是个好计划。', NOW()),
        (daily_video_id, 20.0, 25.0, 'Would you like to come with me?', '您想和我一起去吗？', NOW());

        RAISE NOTICE '✅ 已为日常英语视频 (%) 添加字幕', daily_video_id;
    END IF;
END $$;

-- 7. 最终验证：显示准备好的视频和字幕
SELECT
    '最终验证结果' as verification,
    v.title,
    v.cloudflare_stream_id,
    COUNT(s.id) as subtitle_count,
    v.status,
    v.difficulty
FROM videos v
LEFT JOIN subtitles s ON v.id = s.video_id
WHERE v.cloudflare_stream_id IN ('f1dcfbd5d645e471579a33a5c9e006dd', 'ae2a47c2ac6036543abb2c2c1dbef65a')
GROUP BY v.id, v.title, v.cloudflare_stream_id, v.status, v.difficulty
ORDER BY v.title;

COMMIT;