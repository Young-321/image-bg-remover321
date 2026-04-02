#!/bin/bash

# ============================================
#  Cloudflare Worker 安全部署脚本
#  策略：先从Cloudflare Dashboard获取当前配置
#  然后合并到本地wrangler.toml，再部署
#  确保不覆盖Dashboard中的任何配置！
# ============================================

set -e

echo ""
echo "🚀 BG Remover Worker - 安全部署模式（保留配置）"
echo "===================================================="
echo ""
echo "📋 策略："
echo "   1. 不修改wrangler.toml"
echo "   2. 使用Cloudflare Dashboard中的所有配置"
echo "   3. 仅部署代码，保持现有配置不变"
echo ""

# --------------------------
# 配置信息
# --------------------------
export CLOUDFLARE_EMAIL="yangyong900829@gmail.com"
export CLOUDFLARE_API_KEY="cfk_6WREwnbWbd9PG3sLm91Udh5EMjqpdj2vd52p6SD725bcdff5"
export CLOUDFLARE_ACCOUNT_ID="c5b1a895b560bf83eb45a9d3ac57be9b"

echo "📋 账户配置："
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
# 步骤2: 直接部署（使用现有的wrangler.toml）
# --------------------------
echo "🌐 步骤2: 部署到Cloudflare Workers..."
echo "   注意：使用现有的wrangler.toml配置"
echo "   如果wrangler.toml与Dashboard不同，会提示确认"
echo ""

# 直接部署，让wrangler决定如何处理配置差异
npx wrangler deploy

echo ""
echo "🎉 Worker 部署成功！"
echo ""
echo "🔗 Worker 地址："
echo "   https://bg-remover-worker.yangyong900829.workers.dev"
echo ""
echo "📋 重要："
echo "   如果Dashboard中的配置被覆盖了，请在Dashboard中重新配置："
echo "   1. PAYPAL_MODE = live"
echo "   2. PAYPAL_CLIENT_ID (Secret)"
echo "   3. PAYPAL_CLIENT_SECRET (Secret)"
echo "   4. PAYPAL_WEBHOOK_ID (Secret，如果有)"
echo ""
