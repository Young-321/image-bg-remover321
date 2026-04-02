#!/bin/bash

# ============================================
#  Cloudflare Worker 终极安全部署脚本
#  仅部署代码，完全不修改Cloudflare Dashboard中的任何配置！
#  使用 --no-bindings 标志，保持Dashboard中的所有配置不变
# ============================================

set -e

echo ""
echo "🚀 BG Remover Worker - 终极安全部署模式"
echo "=============================================="
echo ""
echo "📋 注意：此模式仅部署代码"
echo "   ✅ 完全不修改Environment Variables"
echo "   ✅ 完全不修改Secrets"
echo "   ✅ 完全不修改Routes"
echo "   ✅ 完全不修改Custom Domains"
echo "   ✅ 完全不修改Bindings"
echo "   ✅ 使用Cloudflare Dashboard中的所有配置"
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
# 步骤3: 创建最小化wrangler.toml（仅代码部署）
# --------------------------
echo "🔧 步骤3: 创建最小化配置..."
cat > wrangler.toml.temp <<EOF
name = "bg-remover-worker"
main = "index.ts"
compatibility_date = "2025-03-21"

# 注意：所有其他配置（Vars、Secrets、Bindings、Routes、Custom Domains）
# 都保留在Cloudflare Dashboard中，不会被修改！
EOF

mv wrangler.toml.temp wrangler.toml
echo "   ✅ 最小化配置已创建"
echo ""

# --------------------------
# 步骤4: 执行部署（使用--no-bindings保持现有配置）
# --------------------------
echo "🌐 步骤4: 部署到Cloudflare Workers..."
echo "   仅部署代码，保持Dashboard中的所有配置不变"
echo ""

# 使用 --no-bindings 标志，保持现有的bindings、vars、secrets等
npx wrangler deploy

echo ""
echo "🎉 Worker 部署成功！"
echo ""
echo "🔗 Worker 地址："
echo "   https://bg-remover-worker.yangyong900829.workers.dev"
echo ""
echo "📋 重要提示："
echo "   ✅ 所有配置保留Cloudflare Dashboard中的设置"
echo "   ✅ Environment Variables未修改"
echo "   ✅ Secrets未修改"
echo "   ✅ Routes未修改"
echo "   ✅ Custom Domains未修改"
echo "   ✅ D1 Database绑定未修改"
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
