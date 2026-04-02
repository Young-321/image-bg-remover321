
# PayPal从沙箱切换到真实环境指南

## 🚨 重要提醒

**在切换到真实环境之前，请确保：**

- ✅ 沙箱环境已经充分测试
- ✅ 所有支付流程都正常工作
- ✅ 准备好接受真实支付
- ⚠️ 真实环境会产生真实费用！

---

## 🔄 切换步骤

### 第一步：获取真实环境的PayPal凭证

1. 访问PayPal开发者后台：https://developer.paypal.com/
2. 登录你的PayPal账户
3. 进入 **Dashboard** → **My Apps &amp; Credentials**
4. 在页面上方切换到 **Live**（而不是Sandbox）
5. 点击 **Create App** 创建一个新的Live App
6. 填写App信息：
   - **App Name**: `BG Remover Live`
   - **App Type**: `Merchant`
7. 点击 **Create App**
8. 复制以下凭证：
   - **Client ID**（真实环境）
   - **Secret**（真实环境）

### 第二步：创建真实环境的Webhook（可选但推荐）

1. 在PayPal开发者后台，进入你的Live App
2. 找到 **Webhooks** 部分
3. 点击 **Add Webhook**
4. 配置Webhook：
   - **Webhook URL**: `https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook`
   - **Event types**: 选择 `PAYMENT.CAPTURE.COMPLETED`
5. 点击 **Save**
6. 复制生成的 **Webhook ID**

### 第三步：更新Cloudflare Worker配置

#### 方式1：通过Cloudflare Dashboard（推荐）

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Workers &amp; Pages** → **bg-remover-worker**
3. 点击 **Settings** → **Variables and secrets**
4. **更新Environment Variables**：
   - 找到 `PAYPAL_MODE`，编辑为：`live`
5. **添加Secrets**（如果还没有）：
   - 点击 **Add secret**
   - **Name**: `PAYPAL_CLIENT_ID`
   - **Value**: 你的真实环境Client ID
   - 点击 **Add secret**
   - **Name**: `PAYPAL_CLIENT_SECRET`
   - **Value**: 你的真实环境Secret
   - 点击 **Add secret**
   - **Name**: `PAYPAL_WEBHOOK_ID`（如果创建了）
   - **Value**: 你的真实环境Webhook ID
   - 点击 **Add secret**

#### 方式2：通过wrangler.toml（仅用于非敏感配置）

**注意**: 不要在wrangler.toml中存储真实的Secret！只更新PAYPAL_MODE。

我会帮你更新wrangler.toml中的PAYPAL_MODE：

```toml
# PayPal 环境变量（真实环境）
[vars]
PAYPAL_MODE = "live"
```

**重要**: Client ID和Secret必须通过Cloudflare Dashboard的Secrets设置！

### 第四步：重新部署Worker

```bash
cd /root/.openclaw/workspace/bg-remover/worker
./deploy-worker.sh
```

### 第五步：测试真实环境支付

**⚠️ 重要提示：先用小额测试！**

1. 访问网站：https://www.alltoolsimagebgremove.shop
2. 登录账号
3. 进入定价页面
4. 选择最便宜的套餐（入门版 ¥9.9）
5. 完成真实支付
6. 确认：
   - 支付成功
   - 配额正确到账
   - 订单记录正确

---

## 📋 检查清单

切换前检查：
- [ ] 沙箱环境已充分测试
- [ ] 已获取真实环境Client ID
- [ ] 已获取真实环境Secret
- [ ] 已创建真实环境Webhook（可选）
- [ ] 已准备好接受真实支付

切换中检查：
- [ ] PAYPAL_MODE已设置为"live"
- [ ] Secrets已在Cloudflare Dashboard中设置
- [ ] Worker已重新部署
- [ ] 前端已重新部署（如需要）

切换后检查：
- [ ] 小额测试支付成功
- [ ] 配额正确到账
- [ ] 订单记录正确
- [ ] Webhook正常工作（如配置）

---

## ⚠️ 安全注意事项

### 1. 永远不要提交Secret到代码仓库
- ❌ 不要在wrangler.toml中存储真实Secret
- ❌ 不要在.env文件中存储真实Secret
- ✅ 只在Cloudflare Dashboard的Secrets中存储

### 2. 真实环境测试策略
- ✅ 先用最小金额套餐测试
- ✅ 测试成功后再放开
- ✅ 监控初期的支付情况

### 3. 回滚计划
- 如果出现问题，快速切回sandbox模式
- 保留沙箱环境的凭证以便回滚

### 4. 支付监控
- 定期检查订单和支付情况
- 设置异常支付告警
- 保留完整的支付记录

---

## 🔙 回滚到沙箱环境

如果需要回滚：

1. 在Cloudflare Dashboard中：
   - 将 `PAYPAL_MODE` 改回 `sandbox`
   - Secrets改回沙箱凭证（如果需要）

2. 重新部署Worker

---

## 📞 PayPal支持

如遇到问题：
- PayPal开发者文档: https://developer.paypal.com/docs/
- PayPal技术支持: https://www.paypal.com/smarthelp/contact-us

---

## 🎉 完成！

切换完成后，你的网站就可以接受真实支付了！

**记住：先用小额测试，确认一切正常后再正式推广！**

---

**文档版本**: v1.0  
**创建日期**: 2026-04-02  
**维护者**: little-young
