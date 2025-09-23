# Vercel 环境变量配置模板

## 📋 在 Vercel 项目设置中配置以下环境变量

### 🔗 Supabase 配置（已准备好）
```
NEXT_PUBLIC_SUPABASE_URL=https://boyyfwfjqczykgufyasp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTA0MjUsImV4cCI6MjA3NDEyNjQyNX0.q5RlpJyVSK7dqbP1BpTc4l4ruL8-e_VUs4wzcKOKoAA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU1MDQyNSwiZXhwIjoyMDc0MTI2NDI1fQ.cCvbJ2CbzK9HPDLZYDBva6mTCVCosONKgcgV3EIY5XA
```

### ☁️ Cloudflare Stream 配置（需要补充）
```
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=d415834a4ce21fc998f3cecdab532988
CLOUDFLARE_STREAM_API_TOKEN=你需要获取这个令牌
```

#### 🔑 获取 Cloudflare Stream API Token:
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 "My Profile" → "API Tokens"
3. 创建新令牌，选择 "Stream:Edit" 权限
4. 复制生成的令牌

### 🌐 站点配置
```
NEXT_PUBLIC_SITE_URL=https://你的vercel域名.vercel.app
NODE_ENV=production
```

## 🚀 Vercel 部署步骤

### 1. 连接 GitHub 仓库
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 导入 GitHub 仓库：`dongchenyu2025/youtube_english`

### 2. 配置构建设置
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. 添加环境变量
在 Vercel 项目设置的 "Environment Variables" 部分：
- 将上述所有环境变量逐一添加
- 选择环境：Production, Preview, Development

### 4. 部署
- 点击 "Deploy" 开始首次部署
- 部署完成后，获得线上地址

## 📊 部署后验证清单

### ✅ 基础功能测试
- [ ] 网站正常加载
- [ ] 视频列表显示
- [ ] 用户注册/登录
- [ ] 字幕显示正常

### ✅ 数据库连接测试
- [ ] Supabase 连接正常
- [ ] 数据读取正常
- [ ] 数据写入正常

### ✅ 视频功能测试
- [ ] 视频播放正常
- [ ] 字幕同步准确
- [ ] 中英对照模式
- [ ] 点读模式正常

## 🔧 常见问题解决

### 构建失败
- 检查环境变量是否完整
- 查看 Vercel 构建日志
- 确认 Node.js 版本兼容

### 数据库连接问题
- 验证 Supabase URL 和密钥
- 检查 RLS 策略设置
- 确认数据库表存在

### 视频播放问题
- 验证 Cloudflare Stream 配置
- 检查视频 ID 是否正确
- 确认 API Token 权限

## 🎯 下一步行动

### 立即执行（你来完成）
1. **获取 Cloudflare Stream API Token**
2. **在 Vercel 中导入 GitHub 仓库**
3. **配置所有环境变量**
4. **执行首次部署**

### 内容准备（后续完成）
1. **上传测试视频到 Cloudflare Stream**
2. **准备字幕文件**
3. **通过管理界面录入内容**
4. **邀请用户测试**

---
*部署支持：如遇问题请提供错误日志，我会协助排查*