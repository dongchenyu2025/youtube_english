# 🎯 视频同步标准操作程序 (SOP)

**文档版本**: V1.0
**创建日期**: 2025-09-27
**适用范围**: Cloudflare Stream视频与学习平台数据库同步
**负责人**: 系统管理员

---

## 📋 目录

1. [流程概述](#流程概述)
2. [前置条件检查](#前置条件检查)
3. [详细操作步骤](#详细操作步骤)
4. [验证与测试](#验证与测试)
5. [故障排除](#故障排除)
6. [最佳实践](#最佳实践)
7. [附录](#附录)

---

## 🎯 流程概述

### 流程目标
将Cloudflare Stream上传的视频与学习平台数据库进行同步，确保：
- 视频能够正常播放
- 字幕互动功能完全正常
- 数据库记录与实际视频内容匹配

### 流程输入
- **Cloudflare Stream视频ID** (32位hex格式)
- **视频元信息** (标题、描述、难度等)
- **字幕文件** (SRT格式，中英文对照)

### 流程输出
- 数据库中的视频记录已更新
- 视频可正常播放且支持字幕互动
- 管理后台显示正确的视频信息

---

## ✅ 前置条件检查

### 1. 环境准备
- [ ] 确认可访问Supabase数据库管理界面
- [ ] 确认开发环境正常运行 (`npm run dev`)
- [ ] 确认具有管理员权限 (`dongchenyu2025@gmail.com`)

### 2. Cloudflare Stream准备
- [ ] 视频已成功上传到Cloudflare Stream
- [ ] 视频状态为 "Ready"
- [ ] 已获取32位hex格式的Stream ID
- [ ] 视频没有设置访问限制

### 3. 视频内容准备
- [ ] 视频标题和描述信息明确
- [ ] 难度级别已确定 (beginner/intermediate/advanced)
- [ ] 字幕文件准备完毕 (SRT格式)

---

## 📝 详细操作步骤

### 第一步: Stream ID收集与格式验证

#### 1.1 获取Stream ID
```markdown
从Cloudflare Stream控制台获取视频ID：
- 登录Cloudflare Dashboard
- 进入Stream页面
- 复制视频的32位hex ID

示例格式：
✅ 正确: f1dcfbd5d645e471579a33a5c9e006dd
❌ 错误: f1dcfbd5-d645-e471-579a-33a5c9e006dd (包含连字符)
```

#### 1.2 创建Stream ID清单文件
```bash
# 在项目根目录创建或更新 stream_ids.md
# 格式：视频描述: Stream ID
```

**文件示例** (`stream_ids.md`):
```markdown
# 待同步Stream ID清单

## 新增视频 (日期: 2025-09-27)
bookmark_tutorial: f1dcfbd5d645e471579a33a5c9e006dd
daily_conversation: ae2a47c2ac6036543abb2c2c1dbef65a
business_meeting: [待提供]
travel_dialogue: [待提供]

## 已同步视频 (存档)
- bookmark_tutorial: f1dcfbd5d645e471579a33a5c9e006dd ✅ (2025-09-26)
- daily_conversation: ae2a47c2ac6036543abb2c2c1dbef65a ✅ (2025-09-26)
```

### 第二步: 数据库同步SQL脚本生成

#### 2.1 使用标准SQL模板
```sql
-- 🎯 视频同步脚本模板
-- 日期: [YYYY-MM-DD]
-- 操作人: [管理员名称]

-- 第一部分: 检查当前状态
SELECT 'Stream ID 同步前状态' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count
FROM videos
ORDER BY created_at DESC;

-- 第二部分: 更新Stream ID
-- 方式1: 按视频标题匹配更新
UPDATE videos
SET cloudflare_stream_id = '[新的Stream ID]'
WHERE (title LIKE '%[关键词]%' OR title LIKE '%[备用关键词]%')
AND cloudflare_stream_id != '[新的Stream ID]';

-- 方式2: 按视频ID直接更新 (更精确)
UPDATE videos
SET cloudflare_stream_id = '[新的Stream ID]'
WHERE id = '[指定的UUID]';

-- 第三部分: 格式验证
SELECT 'Stream ID 格式验证' as check_type,
       title,
       cloudflare_stream_id,
       CASE
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{32}$' THEN '✅ 格式正确'
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' THEN '✅ UUID格式'
         ELSE '❌ 格式错误'
       END as format_check
FROM videos
WHERE cloudflare_stream_id = '[新的Stream ID]';

-- 第四部分: 最终验证
SELECT 'Stream ID 同步后状态' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count
FROM videos
WHERE cloudflare_stream_id = '[新的Stream ID]'
ORDER BY title;

COMMIT;
```

#### 2.2 实际SQL脚本生成示例
```sql
-- 🎯 视频同步脚本 - 2025-09-27
-- 操作人: 系统管理员
-- 新增视频: 商务会议对话

-- 检查当前状态
SELECT 'Stream ID 同步前状态' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count
FROM videos
ORDER BY created_at DESC;

-- 更新商务会议视频Stream ID
UPDATE videos
SET cloudflare_stream_id = 'abc123def456789012345678901234567'
WHERE (title LIKE '%商务%' OR title LIKE '%会议%' OR title LIKE '%business%')
AND cloudflare_stream_id != 'abc123def456789012345678901234567';

-- 格式验证
SELECT 'Stream ID 格式验证' as check_type,
       title,
       cloudflare_stream_id,
       CASE
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{32}$' THEN '✅ 格式正确'
         ELSE '❌ 格式错误'
       END as format_check
FROM videos
WHERE cloudflare_stream_id = 'abc123def456789012345678901234567';

-- 最终验证
SELECT 'Stream ID 同步后状态' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count
FROM videos
WHERE cloudflare_stream_id = 'abc123def456789012345678901234567';

COMMIT;
```

### 第三步: Supabase数据库执行

#### 3.1 访问Supabase SQL编辑器
```markdown
1. 登录 https://supabase.com
2. 选择项目: boyyfwfjqczykgufyasp
3. 点击左侧菜单 "SQL Editor"
4. 选择 "New query"
```

#### 3.2 执行SQL脚本
```markdown
1. 将生成的SQL脚本粘贴到编辑器
2. 逐段执行验证：
   - 先执行"检查当前状态"部分
   - 确认要更新的视频存在
   - 执行"更新Stream ID"部分
   - 执行"格式验证"部分
   - 执行"最终验证"部分
3. 检查每步执行结果
4. 确认无误后执行COMMIT
```

#### 3.3 执行结果验证
```markdown
预期结果：
✅ 更新操作影响行数 > 0
✅ 格式验证显示 "✅ 格式正确"
✅ 最终验证显示正确的Stream ID
✅ 字幕数量保持不变 (如果之前有字幕)
```

### 第四步: 前端验证测试

#### 4.1 开发环境测试
```bash
# 1. 确保开发服务器运行
npm run dev

# 2. 访问管理后台
http://localhost:3003/admin

# 3. 检查视频列表
# 确认新Stream ID的视频显示正确
```

#### 4.2 视频播放测试
```markdown
测试清单：
□ 管理后台视频列表显示正确
□ 点击视频进入学习页面
□ 视频能够正常加载和播放
□ 字幕显示正常 (中英文对照)
□ 字幕点击跳转功能正常
□ 实时字幕高亮跟随正常
□ 播放控制功能正常 (播放/暂停/倍速)
□ 控制台无错误信息
```

#### 4.3 专项功能测试
```markdown
字幕互动测试：
1. 播放视频，观察字幕自动高亮
2. 点击任意字幕行，验证跳转功能
3. 开启点读模式，测试逐句播放
4. 开启重复模式，测试句子重复
5. 测试变速播放 (0.5x - 2.0x)
6. 测试进度条点击跳转
```

---

## 🔍 验证与测试

### 自动化验证脚本 (可选)

#### 前端验证脚本
```javascript
// 在浏览器控制台执行的验证脚本
// 验证Stream ID是否正确加载

console.log('🎯 开始视频同步验证...');

// 检查VideoPlayer组件是否正确识别Stream ID
const videoPlayer = document.querySelector('video');
if (videoPlayer) {
  console.log('✅ 视频元素存在');
  console.log('📹 视频源:', videoPlayer.src || videoPlayer.currentSrc);

  // 检查是否是HLS格式
  if (videoPlayer.src.includes('.m3u8')) {
    console.log('✅ HLS格式正确');
  }

  // 检查视频状态
  console.log('📊 视频状态:', {
    duration: videoPlayer.duration,
    readyState: videoPlayer.readyState,
    networkState: videoPlayer.networkState
  });
} else {
  console.log('❌ 视频元素未找到');
}

// 检查字幕数据
const subtitleElements = document.querySelectorAll('[data-subtitle-id]');
console.log(`📝 字幕条目数量: ${subtitleElements.length}`);

console.log('🎯 验证完成');
```

### 数据库验证查询
```sql
-- 快速验证查询
SELECT
  '验证结果' as check_type,
  v.title,
  v.cloudflare_stream_id,
  v.status,
  COUNT(s.id) as subtitle_count,
  CASE
    WHEN v.cloudflare_stream_id ~ '^[a-f0-9]{32}$' THEN '✅ ID格式正确'
    ELSE '❌ ID格式错误'
  END as id_format_check
FROM videos v
LEFT JOIN subtitles s ON v.id = s.video_id
WHERE v.cloudflare_stream_id ~ '^[a-f0-9]{32}$'
GROUP BY v.id, v.title, v.cloudflare_stream_id, v.status
ORDER BY v.updated_at DESC;
```

---

## 🚨 故障排除

### 常见问题及解决方案

#### 问题1: 视频播放显示黑屏
```markdown
症状：视频加载但显示黑屏，控制台有错误
可能原因：
- Stream ID格式不正确
- Cloudflare Stream视频未就绪
- 网络连接问题

解决步骤：
1. 检查Stream ID格式 (32位hex)
2. 访问 https://videodelivery.net/{streamId}/manifest/video.m3u8
3. 确认返回200状态码
4. 检查浏览器网络面板
```

#### 问题2: 字幕不显示或点击无效
```markdown
症状：视频播放正常但字幕功能异常
可能原因：
- 数据库字幕数据缺失
- video_id关联错误
- 前端字幕组件错误

解决步骤：
1. 检查数据库字幕数据：
   SELECT * FROM subtitles WHERE video_id = '[视频UUID]';
2. 确认视频ID匹配
3. 检查浏览器控制台错误
```

#### 问题3: SQL执行失败
```markdown
症状：UPDATE语句执行影响行数为0
可能原因：
- WHERE条件不匹配任何记录
- 视频标题关键词不准确
- 数据库权限问题

解决步骤：
1. 先执行SELECT查询确认记录存在
2. 调整WHERE条件的关键词匹配
3. 使用视频ID进行精确更新
```

### 应急回滚程序
```sql
-- 紧急回滚脚本模板
-- 将Stream ID恢复到更新前状态

UPDATE videos
SET cloudflare_stream_id = '[原来的Stream ID]'
WHERE id = '[视频UUID]';

-- 验证回滚结果
SELECT title, cloudflare_stream_id FROM videos WHERE id = '[视频UUID]';
```

---

## 💡 最佳实践

### 操作规范
1. **批量处理**: 一次最多同步5个视频，避免操作复杂化
2. **备份先行**: 执行UPDATE前先备份当前Stream ID
3. **逐步验证**: 每个步骤完成后立即验证，不要跳跃执行
4. **文档记录**: 每次同步操作都要更新同步日志

### 命名规范
```markdown
Stream ID文件命名：
- stream_ids_YYYYMMDD.md (日期标识)
- sync_log_YYYYMMDD.md (同步日志)

SQL脚本命名：
- video_sync_YYYYMMDD_[描述].sql
- 例: video_sync_20250927_business_meeting.sql
```

### 安全考虑
1. **权限控制**: 只有指定管理员可执行同步操作
2. **数据验证**: 每次更新前验证Stream ID格式
3. **回滚准备**: 保留原始数据，支持快速回滚
4. **访问日志**: 记录所有数据库操作的时间和操作人

---

## 📋 附录

### A. Stream ID格式检查工具
```bash
# 命令行检查工具
echo "f1dcfbd5d645e471579a33a5c9e006dd" | grep -E '^[a-f0-9]{32}$' && echo "✅ 格式正确" || echo "❌ 格式错误"
```

### B. 完整SQL模板文件
```sql
-- 视频同步完整模板
-- 复制此模板，替换相应变量使用

-- 变量定义 (手动替换)
-- [NEW_STREAM_ID]: 新的Stream ID
-- [VIDEO_TITLE_KEYWORD]: 视频标题关键词
-- [OPERATION_DATE]: 操作日期
-- [OPERATOR_NAME]: 操作员姓名

-- ===============================================
-- 🎯 视频同步脚本
-- 日期: [OPERATION_DATE]
-- 操作人: [OPERATOR_NAME]
-- ===============================================

-- 第一步: 检查当前状态
SELECT 'Stream ID 同步前状态' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count,
       created_at,
       updated_at
FROM videos
WHERE title LIKE '%[VIDEO_TITLE_KEYWORD]%'
ORDER BY created_at DESC;

-- 第二步: 备份当前Stream ID (可选)
CREATE TEMP TABLE video_backup AS
SELECT id, title, cloudflare_stream_id, updated_at
FROM videos
WHERE title LIKE '%[VIDEO_TITLE_KEYWORD]%';

-- 第三步: 更新Stream ID
UPDATE videos
SET
  cloudflare_stream_id = '[NEW_STREAM_ID]',
  updated_at = NOW()
WHERE title LIKE '%[VIDEO_TITLE_KEYWORD]%'
AND cloudflare_stream_id != '[NEW_STREAM_ID]';

-- 第四步: 格式验证
SELECT 'Stream ID 格式验证' as check_type,
       title,
       cloudflare_stream_id,
       CASE
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{32}$' THEN '✅ 32位hex格式正确'
         WHEN cloudflare_stream_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' THEN '✅ UUID格式正确'
         ELSE '❌ 格式错误'
       END as format_check
FROM videos
WHERE cloudflare_stream_id = '[NEW_STREAM_ID]';

-- 第五步: 字幕关联检查
SELECT '字幕关联检查' as check_type,
       v.title,
       v.cloudflare_stream_id,
       COUNT(s.id) as subtitle_count,
       MIN(s.start_time) as first_subtitle_start,
       MAX(s.end_time) as last_subtitle_end
FROM videos v
LEFT JOIN subtitles s ON v.id = s.video_id
WHERE v.cloudflare_stream_id = '[NEW_STREAM_ID]'
GROUP BY v.id, v.title, v.cloudflare_stream_id;

-- 第六步: 最终验证
SELECT 'Stream ID 同步完成验证' as status,
       id,
       title,
       cloudflare_stream_id,
       status,
       difficulty,
       (SELECT COUNT(*) FROM subtitles WHERE video_id = videos.id) as subtitle_count,
       updated_at
FROM videos
WHERE cloudflare_stream_id = '[NEW_STREAM_ID]'
ORDER BY title;

-- 第七步: 清理临时表
DROP TABLE IF EXISTS video_backup;

-- 提交事务
COMMIT;

-- 操作完成提示
SELECT '🎉 视频同步操作完成！' as completion_message,
       NOW() as completion_time;
```

### C. 同步操作日志模板
```markdown
# 视频同步操作日志

## 操作信息
- **日期**: 2025-09-27
- **操作人**: 系统管理员
- **操作类型**: Stream ID更新

## 同步详情
| 视频标题 | 原Stream ID | 新Stream ID | 状态 | 备注 |
|---------|------------|------------|------|------|
| 商务会议对话 | demo_id_123 | abc123def456... | ✅ | 字幕正常 |
| 旅游英语 | demo_id_456 | def456ghi789... | ⏳ | 待测试 |

## 验证结果
- [x] 数据库更新成功
- [x] Stream ID格式验证通过
- [x] 前端播放测试正常
- [x] 字幕互动功能正常
- [ ] 移动端测试 (待完成)

## 问题记录
无

## 后续行动
1. 完成移动端测试
2. 更新用户手册
```

### D. 紧急联系信息
```markdown
技术支持联系方式：
- 主要联系人: 系统管理员
- 备用联系人: 技术负责人
- Cloudflare支持: https://support.cloudflare.com
- Supabase支持: https://supabase.com/support
```

---

**文档结束**

📞 **技术支持**: 如遇问题，请参考故障排除章节或联系技术团队
📝 **文档更新**: 本SOP文档会根据实际操作经验持续更新优化
🔄 **版本控制**: 每次更新请记录版本号和更新内容