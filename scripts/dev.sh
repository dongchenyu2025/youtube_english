#!/bin/bash

# 开发环境启动脚本

echo "🛠️ 启动开发环境..."

# 1. 检查 Node.js 版本
node_version=$(node -v)
echo "📋 Node.js 版本: $node_version"

# 2. 检查是否存在 .env.local
if [ ! -f .env.local ]; then
  echo "⚠️ .env.local 文件不存在"
  echo "📄 请复制 .env.example 为 .env.local 并填入配置信息"
  echo ""
  echo "cp .env.example .env.local"
  echo ""
  read -p "是否现在复制? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cp .env.example .env.local
    echo "✅ .env.local 已创建，请编辑并填入配置信息"
    echo "📝 需要配置的服务:"
    echo "   - Supabase (数据库和认证)"
    echo "   - Cloudflare Stream (视频服务)"
    echo ""
    echo "配置完成后请重新运行此脚本"
    exit 0
  else
    echo "❌ 请手动创建 .env.local 文件"
    exit 1
  fi
fi

# 3. 安装依赖 (如果 node_modules 不存在)
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 4. 运行类型检查
echo "🔍 运行类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
  echo "❌ 类型检查失败，请修复错误后重试"
  exit 1
fi

# 5. 启动开发服务器
echo "🚀 启动开发服务器..."
echo "📱 应用将在 http://localhost:3000 启动"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev