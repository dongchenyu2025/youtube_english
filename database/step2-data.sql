-- 第二步：插入示例数据
-- 确保在第一步执行成功后再执行此脚本

-- 1. 插入示例视频数据
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

-- 2. 插入示例字幕数据
-- 为第一个视频插入字幕
WITH first_video AS (
  SELECT id FROM videos WHERE title LIKE 'TED演讲%' LIMIT 1
)
INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text)
SELECT
  first_video.id,
  series_num * 5.0,
  (series_num + 1) * 5.0,
  CASE series_num
    WHEN 0 THEN 'Today, technology is changing the world at an unprecedented pace.'
    WHEN 1 THEN 'We see artificial intelligence, machine learning, and robotics transforming every industry.'
    WHEN 2 THEN 'But with great power comes great responsibility.'
    WHEN 3 THEN 'How do we ensure that these technologies benefit all of humanity?'
    WHEN 4 THEN 'The answer lies in ethical development and responsible deployment.'
    WHEN 5 THEN 'Innovation should serve humanity, not replace it.'
    WHEN 6 THEN 'We must consider the ethical implications of every technological advancement.'
    WHEN 7 THEN 'Education and adaptation are key to thriving in this digital age.'
    WHEN 8 THEN 'Together, we can shape a future where technology empowers everyone.'
    WHEN 9 THEN 'Thank you for joining me on this journey into the future.'
    ELSE 'This is a sample subtitle line number ' || series_num || '.'
  END,
  CASE series_num
    WHEN 0 THEN '今天，科技正以前所未有的速度改变着世界。'
    WHEN 1 THEN '我们看到人工智能、机器学习和机器人技术正在改变每一个行业。'
    WHEN 2 THEN '但是能力越大，责任越大。'
    WHEN 3 THEN '我们如何确保这些技术造福全人类？'
    WHEN 4 THEN '答案在于道德发展和负责任的部署。'
    WHEN 5 THEN '创新应该服务于人类，而不是取代人类。'
    WHEN 6 THEN '我们必须考虑每一个技术进步的伦理影响。'
    WHEN 7 THEN '教育和适应是在数字时代繁荣发展的关键。'
    WHEN 8 THEN '我们可以共同塑造一个技术赋能每个人的未来。'
    WHEN 9 THEN '感谢您与我一起踏上这个通往未来的旅程。'
    ELSE '这是第 ' || series_num || ' 行示例字幕。'
  END
FROM first_video, generate_series(0, 9) AS series_num;

-- 完成示例数据插入
SELECT 'Sample data inserted successfully!' as status;