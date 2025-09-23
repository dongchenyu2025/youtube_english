# 视频跟练英语学习平台

![Platform Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Video+English+Learning+Platform)

一款通过观看真实场景的英语短视频来学习地道口语的在线平台。用户可以通过交互式双语字幕进行跟读、查词和收藏生词，形成"观看-学习-复习"的完整闭环。

## ✨ 特性

- 🎥 **高质量视频内容** - 精选真实场景英语视频
- 📝 **智能双语字幕** - 支持中英文对照显示
- 🔍 **点击查词** - 即时查看单词释义和发音
- ❤️ **生词收藏** - 个人生词本管理
- 🎯 **点读模式** - 点击字幕自动跳转和暂停
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔐 **用户系统** - 安全的注册登录功能

## 🛠️ 技术栈

### 前端
- **Next.js 14** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代化样式框架
- **Lucide React** - 优美的图标库

### 后端
- **Next.js API Routes** - 服务端 API
- **Supabase** - 数据库和认证服务
- **PostgreSQL** - 关系型数据库

### 基础设施
- **Vercel** - 自动化部署平台
- **Cloudflare Stream** - 视频托管和 CDN
- **GitHub** - 代码仓库管理

## 🚀 快速开始

### 前置要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Git

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/video-english-learning-platform.git
   cd video-english-learning-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local` 文件，填入以下配置：
   - Supabase 项目配置
   - Cloudflare Stream 配置
   - 其他必要的环境变量

4. **初始化数据库**
   - 在 Supabase 控制台执行 `database/init.sql`

5. **启动开发服务器**
   ```bash
   npm run dev
   # 或使用便捷脚本
   ./scripts/dev.sh
   ```

6. **访问应用**
   打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 📖 使用指南

### 用户流程

1. **浏览视频** - 在首页查看所有可学习的视频
2. **观看学习** - 点击视频进入播放页面
3. **字幕互动** - 点击字幕跳转时间，点击单词查看释义
4. **收藏生词** - 将不熟悉的单词添加到生词本
5. **复习巩固** - 在个人中心查看和管理收藏的单词

### 核心功能

#### 视频播放
- 支持 Cloudflare Stream 高质量视频播放
- 自动字幕同步高亮显示
- 完整的播放控制功能

#### 字幕系统
- **双语显示**: 同时显示英文和中文字幕
- **点读模式**: 点击字幕自动跳转并在句末暂停
- **字体调节**: 支持小、中、大三种字体大小

#### 单词学习
- **即时查词**: 点击英文单词查看释义
- **语音播放**: 听取标准英语发音
- **生词收藏**: 一键添加到个人生词本

#### 用户系统
- **安全认证**: 基于 Supabase Auth 的用户系统
- **个人中心**: 查看学习统计和生词本
- **数据同步**: 跨设备同步学习进度

## 🏗️ 项目结构

```
video-english-learning-platform/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── auth/               # 认证相关页面
│   │   ├── videos/             # 视频相关页面
│   │   ├── profile/            # 个人中心页面
│   │   └── api/                # API Routes
│   ├── components/             # React 组件
│   │   ├── VideoPlayer.tsx     # 视频播放器
│   │   ├── SubtitleDisplay.tsx # 字幕显示组件
│   │   ├── VideoCard.tsx       # 视频卡片组件
│   │   └── ...
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAutoScroll.ts    # 自动滚动
│   │   ├── useReadingMode.ts   # 点读模式
│   │   └── ...
│   ├── lib/                    # 工具库
│   │   ├── supabase.ts         # Supabase 配置
│   │   └── api.ts              # API 工具函数
│   └── types/                  # TypeScript 类型定义
├── database/                   # 数据库脚本
│   ├── init.sql                # 初始化脚本
│   └── migrate.sql             # 迁移脚本
├── scripts/                    # 部署脚本
│   ├── dev.sh                  # 开发环境启动
│   └── deploy.sh               # 部署脚本
├── public/                     # 静态资源
└── docs/                       # 项目文档
```

## 🔧 开发

### 可用脚本

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 便捷脚本

```bash
# 启动开发环境 (包含环境检查)
./scripts/dev.sh

# 部署到生产环境
./scripts/deploy.sh
```

## 📦 部署

### Vercel 部署 (推荐)

1. Fork 本项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 自动部署完成

### 手动部署

详细部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛡️ 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公开密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务密钥 | ✅ |
| `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | ✅ |
| `CLOUDFLARE_STREAM_API_TOKEN` | Cloudflare API 令牌 | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | ✅ |

## 🤝 贡献

我们欢迎所有形式的贡献！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如果您遇到任何问题或有功能建议，请：

- 📧 发送邮件到: support@example.com
- 🐛 提交 Issue: [GitHub Issues](https://github.com/your-username/video-english-learning-platform/issues)
- 💬 加入讨论: [GitHub Discussions](https://github.com/your-username/video-english-learning-platform/discussions)

## 🙏 致谢

感谢以下优秀的开源项目：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [Tailwind CSS](https://tailwindcss.com/) - CSS 工具框架
- [Lucide](https://lucide.dev/) - 美观的图标库

---

<div align="center">

**[🏠 首页](https://your-app.vercel.app)** | **[📖 文档](./docs/)** | **[🚀 演示](https://your-app.vercel.app)**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>