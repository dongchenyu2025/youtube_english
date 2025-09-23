# 🚀 生产部署指南

## 📊 项目概述

**滚动字幕英语学习平台** - 基于 Next.js + Supabase + Cloudflare Stream 的全栈视频学习应用

### 🎯 核心功能
- 🎥 视频播放与字幕同步
- 🔄 中英对照字幕显示
- 📖 点读模式（点击字幕自动播放片段）
- 📱 响应式设计，支持桌面和移动端
- 👤 用户认证与个人收藏
- 🔍 字幕搜索功能

### 🏗️ 技术架构
- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Supabase PostgreSQL
- **视频服务**: Cloudflare Stream
- **认证**: Supabase Auth
- **部署**: Vercel

## ✅ 部署状态检查

### 已完成配置
- ✅ **Supabase 数据库**: 连接正常，表结构完整
- ✅ **GitHub 仓库**: 代码已推送，构建通过
- ✅ **Vercel 配置**: vercel.json 已优化
- ✅ **环境变量模板**: 配置文档已准备

### 需要你完成的步骤
- ⏳ **Cloudflare Stream API Token**: 需要获取
- ⏳ **Vercel 部署**: 需要导入仓库并配置环境变量
- ⏳ **域名配置**: 设置生产环境 URL

## 🔑 环境变量配置

### Supabase 配置（✅ 已准备）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://boyyfwfjqczykgufyasp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTA0MjUsImV4cCI6MjA3NDEyNjQyNX0.q5RlpJyVSK7dqbP1BpTc4l4ruL8-e_VUs4wzcKOKoAA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MDQyNSwiZXhwIjoyMDc0MTI2NDI1fQ.cCvbJ2CbzK9HPDLZYDBva6mTCVCosONKgcgV3EIY5XA
```

### Cloudflare Stream 配置（⚠️ 需要补充）
```bash
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=d415834a4ce21fc998f3cecdab532988
CLOUDFLARE_STREAM_API_TOKEN=你需要获取这个
```

### 生产环境配置
```bash
NEXT_PUBLIC_SITE_URL=https://你的域名.vercel.app
NODE_ENV=production
```

## 🚀 立即部署步骤

### 第 1 步：获取 Cloudflare Stream API Token

1. **登录 Cloudflare Dashboard**
   - 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
   - 使用你的 Cloudflare 账号登录

2. **创建 API Token**
   ```
   Dashboard → 右上角头像 → My Profile → API Tokens → Create Token
   ```

3. **配置权限**
   - Template: "Custom token"
   - Permissions:
     - Account: Cloudflare Stream:Edit
     - Zone Resources: Include All zones

4. **复制 Token**
   - 生成后立即复制保存
   - 这个 Token 只显示一次

### 第 2 步：Vercel 部署

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   ```
   New Project → Import Git Repository
   → 搜索：dongchenyu2025/youtube_english
   → Import
   ```

3. **配置构建设置**
   - Framework Preset: `Next.js` (自动检测)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **添加环境变量**
   在项目设置中添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://boyyfwfjqczykgufyasp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[已提供的密钥]
   SUPABASE_SERVICE_ROLE_KEY=[已提供的密钥]
   NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=d415834a4ce21fc998f3cecdab532988
   CLOUDFLARE_STREAM_API_TOKEN=[刚获取的Token]
   NEXT_PUBLIC_SITE_URL=[部署后的域名]
   NODE_ENV=production
   ```

5. **开始部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

### 第 3 步：验证部署

1. **访问应用**
   - 复制 Vercel 提供的 URL
   - 在新标签页中打开

2. **测试核心功能**
   - [ ] 首页加载正常
   - [ ] 用户注册/登录功能
   - [ ] 视频列表显示
   - [ ] 字幕功能正常

3. **更新环境变量**
   - 将实际的域名更新到 `NEXT_PUBLIC_SITE_URL`
   - 重新部署应用

## 📋 数据库状态

### 已创建的表结构
- ✅ `videos` - 视频信息存储
- ✅ `subtitles` - 字幕数据存储
- ✅ `user_collections` - 用户收藏记录
- ✅ `platform_statistics` - 平台统计视图
- ✅ `video_with_subtitle_count` - 视频字幕计数视图

### 已配置的功能
- ✅ RLS (Row Level Security) 策略
- ✅ 字幕搜索函数 `search_subtitles`
- ✅ 自动时间戳更新
- ✅ UUID 主键生成

## 🎬 内容管理指南

### 上传测试视频

1. **Cloudflare Stream 控制台**
   ```
   Cloudflare Dashboard → Stream → 上传视频
   ```

2. **获取 Stream ID**
   - 上传完成后复制 Stream ID
   - 格式类似：`a1b2c3d4e5f6g7h8i9j0`

3. **添加到数据库**
   ```sql
   INSERT INTO videos (title, description, cloudflare_stream_id)
   VALUES ('测试视频', '描述信息', 'your-stream-id');
   ```

### 准备字幕文件

1. **SRT 格式示例**
   ```srt
   1
   00:00:00,100 --> 00:00:05,300
   Hello, welcome to our platform!
   你好，欢迎来到我们的平台！

   2
   00:00:05,400 --> 00:00:10,200
   This is an English learning video.
   这是一个英语学习视频。
   ```

2. **批量导入字幕**
   - 使用应用的文件上传功能
   - 或通过 SQL 直接插入数据库

## 🛠️ 故障排查

### 常见问题

1. **构建失败**
   ```bash
   # 检查错误日志
   Vercel Dashboard → Project → Deployments → 点击失败的部署
   ```

2. **环境变量问题**
   ```bash
   # 验证变量是否正确
   Vercel Dashboard → Settings → Environment Variables
   ```

3. **数据库连接问题**
   ```bash
   # 测试 Supabase 连接
   curl -X GET "https://boyyfwfjqczykgufyasp.supabase.co/rest/v1/videos" \
   -H "apikey: [你的anon-key]"
   ```

4. **视频播放问题**
   - 检查 Cloudflare Stream ID 是否正确
   - 验证 API Token 权限是否充足
   - 确认视频已处理完成

### 获取支持

- **GitHub Issues**: [项目仓库 Issues](https://github.com/dongchenyu2025/youtube_english/issues)
- **文档参考**:
  - [Next.js 文档](https://nextjs.org/docs)
  - [Supabase 文档](https://supabase.com/docs)
  - [Cloudflare Stream 文档](https://developers.cloudflare.com/stream/)
  - [Vercel 文档](https://vercel.com/docs)

## 🎯 部署后优化

### 性能优化
- 启用 Vercel Analytics
- 配置 CDN 缓存策略
- 添加图片优化

### SEO 优化
- 配置元标签
- 添加 sitemap.xml
- 设置 robots.txt

### 监控设置
- Vercel 性能监控
- Supabase 使用情况监控
- 错误日志收集

---

## 📞 需要我协助的事项

如果在部署过程中遇到问题，请提供：
1. 具体的错误信息
2. Vercel 构建日志
3. 浏览器控制台错误
4. 操作步骤描述

我会立即协助解决！🚀