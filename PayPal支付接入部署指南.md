# PayPal 支付接入部署指南

## 📋 概述

本文档说明如何为 BG Remover 项目接入 PayPal 支付功能。

## 🎯 已完成的工作

### 1. 后端 Worker 增强
- ✅ 创建了 `worker/index-with-paypal.ts` - 集成 PayPal 支付的 Worker
- ✅ 创建了 `worker/paypal.ts` - PayPal 服务类
- ✅ 新增 API 端点：
  - `GET /paypal/config` - 获取 PayPal 配置
  - `POST /paypal/create-order` - 创建 PayPal 订单
  - `POST /paypal/capture-order` - 捕获支付订单
  - `POST /paypal-webhook` - PayPal Webhook 处理

### 2. 前端集成
- ✅ 创建了 `app/hooks/usePayPal.ts` - PayPal React Hook
- ✅ 创建了 `app/components/PayPalButton.tsx` - PayPal 支付按钮组件
- ✅ 更新了 `app/pricing/page.tsx` - 定价页面集成 PayPal

### 3. 配置文件
- ✅ 更新了 `wrangler.toml` - 添加 PayPal 环境变量
- ✅ 更新了 `.dev.vars` - 添加 PayPal 沙箱凭证

## 🚀 部署步骤

### 第一步：更新 Worker 代码

```bash
# 备份原有的 index.ts
cd /root/.openclaw/workspace/bg-remover/worker
mv index.ts index.ts.backup
mv index-with-paypal.ts index.ts
```

### 第二步：配置 Cloudflare Secrets

需要在 Cloudflare Dashboard 中设置以下 Secrets：

1. 访问：https://dash.cloudflare.com/
2. 选择你的 Workers & Pages
3. 选择 `bg-remover-worker`
4. 进入 Settings → Variables and secrets

添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `PAYPAL_CLIENT_ID` | `Af-FZa2gC2hgPNMEDOvhZ4kJ21L40hIcgJljnBRps4euobIXU06Ego_7xNxxRiy3SuDAZ9K5gYq9SBek` | PayPal 客户端 ID |
| `PAYPAL_CLIENT_SECRET` | `EGw_CIAGvz27z198FZrnsaaAsFpH8tPGbp3yRFMcI2e_XpplPMqqh-3BVooSjOseTkWr5GzPK03IivLk` | PayPal 密钥 |
| `PAYPAL_WEBHOOK_ID` | `08R40476MY532853P` | PayPal Webhook ID |

同时添加以下 Environment Variables（非机密）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PAYPAL_MODE` | `sandbox` | 沙箱环境，生产环境改为 `live` |

### 第三步：部署 Worker

```bash
cd /root/.openclaw/workspace/bg-remover

# 部署 Worker
npx wrangler deploy
```

### 第四步：部署前端

```bash
# 构建前端
npm run build

# 部署到 Cloudflare Pages
npm run deploy
```

## 🧪 测试流程

### 1. 测试沙箱支付

1. 访问定价页面：https://www.alltoolsimagebgremove.shop/pricing
2. 选择一个套餐（如入门版 ¥9.9）
3. 点击"使用 PayPal 支付"
4. 应该跳转到 PayPal 沙箱环境
5. 使用 PayPal 沙箱账号测试支付

### PayPal 沙箱测试账号

如需创建沙箱测试账号：
- 访问：https://developer.paypal.com/dashboard/accounts
- 创建个人账号（买家）
- 创建企业账号（卖家）

## 🔧 配置说明

### 货币转换

当前代码中使用简化的汇率转换（1 CNY ≈ 0.14 USD）。

如需更准确的汇率，可以：
1. 集成汇率 API
2. 或者直接用 USD 定价

### Webhook 配置

当前 Webhook URL：
```
https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook
```

监听事件：
- `PAYMENT.CAPTURE.COMPLETED` - 支付完成

## 📊 支付流程

```
1. 用户点击套餐
   ↓
2. 前端调用 /paypal/create-order
   ↓
3. Worker 创建 PayPal 订单
   ↓
4. 返回 approvalLink
   ↓
5. 前端跳转到 PayPal
   ↓
6. 用户完成支付
   ↓
7. PayPal 回调到 return_url
   ↓
8. 前端显示支付成功
   ↓
9. PayPal 发送 Webhook（可选）
```

## ⚠️ 注意事项

### 安全注意事项

1. **永远不要**将 Secrets 提交到代码仓库
2. 生产环境使用 `live` 模式前，务必充分测试 `sandbox`
3. Webhook 应该验证签名（当前简化处理）
4. 订单金额应该在服务器端验证

### 生产环境检查清单

- [ ] 切换到 `PAYPAL_MODE=live`
- [ ] 使用生产环境的 PayPal 凭证
- [ ] 更新 return_url 和 cancel_url
- [ ] 配置真实的 Webhook
- [ ] 测试真实支付（小额测试）
- [ ] 配置数据库存储订单
- [ ] 添加配额自动发放逻辑
- [ ] 配置邮件通知
- [ ] 设置监控和告警

## 📞 故障排查

### 常见问题

**Q: PayPal 按钮显示"支付服务暂时不可用"**
- 检查 Worker 是否正确部署
- 检查 `/paypal/config` 端点是否正常
- 检查 Secrets 是否正确配置

**Q: 创建订单失败**
- 检查 PayPal 凭证是否正确
- 检查 PAYPAL_MODE 是否正确
- 查看 Worker 日志

**Q: 支付成功但配额没到账**
- Webhook 可能没正确处理
- 需要实现数据库和配额逻辑
- 当前版本仅为前端演示

## 🎉 下一步

当前版本实现了完整的 PayPal 支付流程，但还需要：

1. **数据库集成** - 存储订单和用户数据
2. **配额系统** - 支付成功后自动发放配额
3. **订单管理** - 用户可以查看订单历史
4. **退款处理** - 支持退款流程
5. **更多支付方式** - 微信支付、支付宝等

---

**文档版本**: v1.0  
**最后更新**: 2026-03-31  
**维护者**: little-young
