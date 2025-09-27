# 生产环境变量配置文档

## Vercel 环境变量配置

在 Vercel 控制台中配置以下环境变量：

### Supabase 配置
```
VITE_SUPABASE_URL=https://boyyfwfjqczykgufyasp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXlmd2ZqcWN6eWtndWZ5YXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTA0MjUsImV4cCI6MjA3NDEyNjQyNX0.5LmaNuBY2OJzNwNQfUZJj7yYv8fF5rN_qMm7eH8m-W4
```

### Cloudflare Stream 配置
```
VITE_CLOUDFLARE_ACCOUNT_ID=[从 Cloudflare 控制台获取]
VITE_CLOUDFLARE_STREAM_TOKEN=[从 Cloudflare 控制台获取]
CLOUDFLARE_STREAM_API_TOKEN=[从 Cloudflare 控制台获取]
```

### 应用环境
```
NODE_ENV=production
VITE_APP_ENV=production
```

## 如何获取 Cloudflare Stream 配置

1. 登录 Cloudflare 控制台
2. 选择你的账户，获取 Account ID
3. 前往 Stream > API Tokens 创建令牌

### Account ID 获取方式：
- 在 Cloudflare 控制台右侧边栏可以找到 Account ID

### API Token 获取方式：
- 前往 My Profile > API Tokens
- 创建自定义令牌，权限包括：
  - Account:Stream:Edit
  - Zone:Zone:Read

## Vercel 部署命令

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

## 环境变量设置方式

### 方式1: Vercel 控制台
1. 进入项目 Settings > Environment Variables
2. 添加上述所有环境变量
3. 重新部署

### 方式2: Vercel CLI
```bash
# 设置环境变量
vercel env add VITE_CLOUDFLARE_ACCOUNT_ID
vercel env add VITE_CLOUDFLARE_STREAM_TOKEN
vercel env add CLOUDFLARE_STREAM_API_TOKEN

# 查看环境变量
vercel env ls
```