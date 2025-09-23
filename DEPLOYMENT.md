# 部署指南

## 项目概述

视频跟练英语学习平台是一个基于 Next.js 的全栈应用，用户可以通过观看英语视频并与字幕互动来学习英语。

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Supabase
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **视频服务**: Cloudflare Stream
- **部署**: Vercel

## 部署前准备

### 1. 注册必要的服务

#### Supabase
1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 创建新项目
3. 获取以下信息：
   - `NEXT_PUBLIC_SUPABASE_URL`: 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 公开 API 密钥
   - `SUPABASE_SERVICE_ROLE_KEY`: 服务角色密钥

#### Cloudflare Stream
1. 访问 [cloudflare.com](https://cloudflare.com) 注册账号
2. 开通 Cloudflare Stream 服务
3. 获取以下信息：
   - `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`: 账户 ID
   - `CLOUDFLARE_STREAM_API_TOKEN`: API 令牌

#### Vercel
1. 访问 [vercel.com](https://vercel.com) 注册账号
2. 连接 GitHub 账号

### 2. 初始化数据库

1. 登录 Supabase 控制台
2. 在 SQL Editor 中执行 `database/init.sql` 脚本
3. 确认所有表和策略创建成功

## 部署步骤

### 方法一：自动部署 (推荐)

1. **Fork 项目到您的 GitHub**
2. **连接到 Vercel**
   - 在 Vercel 中导入您的 GitHub 仓库
   - 选择 Next.js 框架预设
3. **配置环境变量**
   - 在 Vercel 项目设置中添加所有环境变量
   - 变量列表见 `.env.example` 文件
4. **触发部署**
   - Vercel 会自动构建和部署应用

### 方法二：手动部署

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd video-english-learning-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 填入真实配置
   ```

4. **运行部署脚本**
   ```bash
   ./scripts/deploy.sh
   ```

## 开发环境设置

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd video-english-learning-platform
   ```

2. **运行开发脚本**
   ```bash
   ./scripts/dev.sh
   ```

3. **访问应用**
   - 开发服务器: http://localhost:3000

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公开密钥 | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | `eyJhbGci...` |
| `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | `abc123...` |
| `CLOUDFLARE_STREAM_API_TOKEN` | Cloudflare API 令牌 | `xyz789...` |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | `https://your-app.vercel.app` |

## 数据库初始化

### 执行初始化脚本

在 Supabase SQL Editor 中依次执行：

1. `database/init.sql` - 创建表结构和示例数据
2. `database/migrate.sql` - 执行数据迁移 (如需要)

### 验证数据库

确认以下表已创建：
- `videos` - 视频信息
- `subtitles` - 字幕数据
- `user_collections` - 用户收藏

## 内容管理

### 上传视频

1. **上传到 Cloudflare Stream**
   - 使用 Cloudflare Stream 控制台上传视频
   - 或通过 API 上传
   - 获取 `stream_id`

2. **添加视频信息到数据库**
   ```sql
   INSERT INTO videos (title, description, cloudflare_stream_id)
   VALUES ('视频标题', '视频描述', 'cloudflare-stream-id');
   ```

3. **添加字幕数据**
   ```sql
   INSERT INTO subtitles (video_id, start_time, end_time, english_text, chinese_text)
   VALUES ('video-uuid', 0.0, 5.0, 'Hello world', '你好，世界');
   ```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 Supabase URL 和密钥是否正确
   - 确认网络连接正常

2. **视频无法播放**
   - 检查 Cloudflare Stream ID 是否正确
   - 确认视频已上传并处理完成

3. **用户认证问题**
   - 检查 Supabase Auth 配置
   - 确认 RLS 策略设置正确

4. **部署失败**
   - 检查环境变量是否完整
   - 查看 Vercel 构建日志

### 日志查看

- **Vercel**: 在项目面板查看构建和运行时日志
- **Supabase**: 在项目控制台查看数据库日志
- **本地开发**: 检查浏览器控制台和终端输出

## 维护和更新

### 代码更新

1. 推送代码到 GitHub
2. Vercel 自动触发重新部署

### 数据库更新

1. 编写迁移脚本
2. 在 Supabase 控制台执行
3. 更新应用代码 (如需要)

### 监控

- 使用 Vercel Analytics 监控性能
- 使用 Supabase 监控数据库使用情况
- 定期检查错误日志

## 安全考虑

1. **环境变量安全**
   - 不要在代码中硬编码密钥
   - 使用 Vercel 环境变量管理

2. **数据库安全**
   - 启用 RLS 策略
   - 定期审查访问权限

3. **API 安全**
   - 实现适当的认证检查
   - 限制 API 访问频率

## 支持

如遇到问题，请检查：
1. [Next.js 文档](https://nextjs.org/docs)
2. [Supabase 文档](https://supabase.com/docs)
3. [Cloudflare Stream 文档](https://developers.cloudflare.com/stream/)
4. [Vercel 文档](https://vercel.com/docs)