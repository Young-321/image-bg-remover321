#!/bin/bash

# BG Remover - Cloudflare 部署脚本

echo "🚀 BG Remover 部署助手"
echo "======================"
echo "架构：Next.js 静态 + Cloudflare Workers"
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装"
    echo "安装命令：pnpm add -D wrangler"
    exit 1
fi

echo "📦 安装依赖..."
pnpm install

echo ""
echo "🔧 构建前端..."
pnpm build

echo ""
echo "📊 项目信息："
echo "  - 每月免费额度：50 张图片"
echo "  - 最大文件大小：10MB"
echo "  - 支持格式：JPG、PNG、WebP"
echo "  - 后端：Cloudflare Workers（内存处理）"
echo ""

echo "🌐 部署步骤："
echo ""
echo "1. 获取 remove.bg API 密钥："
echo "   https://www.remove.bg/api"
echo ""
echo "2. 部署 Worker："
echo "   pnpm wrangler login"
echo "   pnpm wrangler secret put REMOVE_BG_API_KEY"
echo "   pnpm wrangler deploy"
echo ""
echo "3. 部署前端到 Cloudflare Pages："
echo "   - 推送代码到 GitHub"
echo "   - 在 Cloudflare Dashboard 创建 Pages 项目"
echo "   - 构建命令：pnpm build"
echo "   - 输出目录：out"
echo ""
echo "4. 配置域名（可选）："
echo "   - DNS CNAME 记录"
echo "   - Pages 自定义域名"
echo "   - Worker 路由"
echo ""

echo "💰 成本估算："
echo "  ✓ Cloudflare Workers：10万次/天免费"
echo "  ✓ Cloudflare Pages：无限请求免费"
echo "  ✓ remove.bg API：50张/月免费"
echo "  → 个人使用：基本零成本"
echo ""

echo "🎉 准备就绪！"
echo ""
echo "本地测试："
echo "  前端：pnpm dev"
echo "  Worker：pnpm wrangler dev"
echo ""
echo "访问地址："
echo "  - 本地：http://localhost:3000"
echo "  - Worker 开发：http://localhost:8787"