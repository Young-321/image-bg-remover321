#!/bin/bash

# ============================================
#  Cloudflare Worker 安全部署脚本
#  不覆盖Cloudflare Dashboard中的Secrets配置
#  仅部署代码，使用Dashboard中的环境变量和Secrets
# ============================================

set -e

echo ""
echo "🚀 BG Remover Worker - 安全部署模式"
echo "========================================"
echo ""
echo "📋 注意：此模式使用Cloudflare Dashboard中的配置"
echo "   不会覆盖Dashboard中的Environment Variables和Secrets"
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
# 步骤2: 备份当前wrangler.toml
# --------------------------
echo "💾 步骤2: 备份配置文件..."
if [ -f "wrangler.toml" ]; then
    cp wrangler.toml wrangler.toml.backup
    echo "   ✅ wrangler.toml已备份为 wrangler.toml.backup"
fi
echo ""

# --------------------------
# 步骤3: 创建临时wrangler.toml（不包含敏感信息）
# --------------------------
echo "🔧 步骤3: 创建安全配置..."
cat > wrangler.toml.temp <<EOF
name = "bg-remover-worker"
main = "index.ts"
compatibility_date = "2025-03-21"

# D1 数据库配置
[[d1_databases]]
binding = "DB"
database_name = "bg-remover-users"
database_id = "6ca89bac-6625-4b5f-b303-30d768827b53"

# 注意：PayPal配置在Cloudflare Dashboard中设置
# 不要在这里存储敏感信息！
EOF

mv wrangler.toml.temp wrangler.toml
echo "   ✅ 安全配置已创建"
echo ""

# --------------------------
# 步骤4: 执行部署
# --------------------------
echo "🌐 步骤4: 部署到Cloudflare Workers..."
echo "   注意：使用Cloudflare Dashboard中的Environment Variables和Secrets"
echo ""

npx wrangler deploy

echo ""
echo "🎉 Worker 部署成功！"
echo ""
echo "🔗 Worker 地址："
echo "   https://bg-remover-worker.yangyong900829.workers.dev"
echo ""
echo "📋 重要提示："
echo "   - PayPal配置使用Cloudflare Dashboard中的设置"
echo "   - 请确认Dashboard中的PAYPAL_MODE已设置为'live'"
echo "   - 请确认Dashboard中的Secrets已正确配置"
echo ""

# --------------------------
# 步骤5: 恢复原始wrangler.toml
# --------------------------
echo "🔄 步骤5: 恢复原始配置..."
if [ -f "wrangler.toml.backup" ]; then
    mv wrangler.toml.backup wrangler.toml
    echo "   ✅ wrangler.toml已恢复"
fi
echo ""
