#!/bin/bash

# ============================================
#  Cloudflare Worker 部署脚本
#  部署 PayPal 增强版 Worker
# ============================================

set -e

echo ""
echo "🚀 BG Remover Worker - Cloudflare 部署"
echo "========================================"
echo ""

# --------------------------
# 配置信息
# --------------------------
export CLOUDFLARE_EMAIL="yangyong900829@gmail.com"
export CLOUDFLARE_API_KEY="cfk_6WREwnbWbd9PG3sLm91Udh5EMjqpdj2vd52p6SD725bcdff5"
export CLOUDFLARE_ACCOUNT_ID="c5b1a895b560bf83eb45a9d3ac57be9b"

echo "📋 配置信息："
echo "   - 账户邮箱: $CLOUDFLARE_EMAIL"
echo ""

# --------------------------
# 步骤1: 配置wrangler
# --------------------------
echo "🔧 步骤1: 配置wrangler..."
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
# 步骤2: 执行部署
# --------------------------
echo "🌐 步骤2: 部署到Cloudflare Workers..."
npx wrangler deploy

echo ""
echo "🎉 Worker 部署成功！"
echo ""
echo "🔗 Worker 地址："
echo "   https://bg-remover-worker.yangyong900829.workers.dev"
echo ""
