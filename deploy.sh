#!/bin/bash

# ============================================
#  Cloudflare Pages 标准部署脚本
#  基于2026年3月29日成功验证的部署方式
# ============================================

set -e

echo ""
echo "🚀 BG Remover - Cloudflare Pages 部署"
echo "========================================"
echo ""

# --------------------------
# 配置信息
# --------------------------
export CLOUDFLARE_EMAIL="yangyong900829@gmail.com"
export CLOUDFLARE_API_KEY="cfk_6WREwnbWbd9PG3sLm91Udh5EMjqpdj2vd52p6SD725bcdff5"
export CLOUDFLARE_ACCOUNT_ID="765b6d5d0026cb618e703a30fe28f383"
PROJECT_NAME="bg-remover"
BUILD_DIR="out"

echo "📋 项目配置："
echo "   - 项目名称: $PROJECT_NAME"
echo "   - 构建目录: $BUILD_DIR"
echo "   - 账户邮箱: $CLOUDFLARE_EMAIL"
echo ""

# --------------------------
# 步骤1: 检查构建目录
# --------------------------
echo "🔍 步骤1: 检查构建目录..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "   ⚠️  构建目录不存在，开始构建..."
    npm run build
    echo "   ✅ 构建完成"
else
    echo "   ✅ 构建目录已存在"
fi
echo ""

# --------------------------
# 步骤2: 配置wrangler
# --------------------------
echo "🔧 步骤2: 配置wrangler..."
mkdir -p ~/.wrangler/config

cat > ~/.wrangler/config/default.toml <<EOF
[cloudflare]
email = "$CLOUDFLARE_EMAIL"
api_key = "$CLOUDFLARE_API_KEY"
account_id = "$CLOUDFLARE_ACCOUNT_ID"
EOF

echo "   ✅ wrangler配置已创建"
echo ""

# --------------------------
# 步骤3: 执行部署
# --------------------------
echo "🌐 步骤3: 部署到Cloudflare Pages..."
echo "   执行: npx wrangler pages deploy $BUILD_DIR --project-name=$PROJECT_NAME"
echo ""

npx wrangler pages deploy "$BUILD_DIR" --project-name="$PROJECT_NAME"

echo ""
echo "🎉 部署成功！"
echo ""
echo "🎯 访问地址："
echo "   - 最新版本: 查看上面显示的临时URL"
echo "   - 主域名: https://www.alltoolsimagebgremove.shop"
echo ""
echo "⏰ 等待1-2分钟后测试功能"
echo ""
