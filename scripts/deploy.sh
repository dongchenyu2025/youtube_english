#!/bin/bash

# 部署脚本
# 用于自动化部署流程

echo "🚀 开始部署视频跟练英语学习平台..."

# 1. 检查环境变量
echo "📋 检查环境变量..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL 未设置"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY 未设置"
  exit 1
fi

echo "✅ 环境变量检查通过"

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci

# 3. 类型检查
echo "🔍 运行类型检查..."
npm run type-check

# 4. 构建项目
echo "🏗️ 构建项目..."
npm run build

# 5. 部署到 Vercel (如果在 CI/CD 环境中)
if [ "$VERCEL" = "1" ]; then
  echo "🚀 Vercel 自动部署中..."
else
  echo "💻 本地构建完成"
  echo "📁 构建文件位于: .next/"
  echo ""
  echo "手动部署步骤:"
  echo "1. 确保 Vercel CLI 已安装: npm i -g vercel"
  echo "2. 运行: vercel --prod"
fi

echo "✅ 部署流程完成!"