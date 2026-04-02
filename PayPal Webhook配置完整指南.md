
# PayPal Webhook配置完整指南

## 📋 什么是Webhook？

Webhook是PayPal向你的服务器发送实时通知的方式，当支付完成、退款等事件发生时，PayPal会自动调用你的Webhook URL。

**为什么需要Webhook？
- ✅ 实时接收支付完成通知
- ✅ 自动发放配额
- ✅ 处理退款
- ✅ 订单状态自动更新
- ✅ 即使关闭页面也能处理支付

---

## 🔧 配置步骤（沙箱环境 + 真实环境

---

## 第一步：获取Webhook URL

你的Webhook URL已经准备好了！

**沙箱环境Webhook URL**:
```
https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook
```

**真实环境Webhook URL**（切换到live后同样使用相同的URL）:
```
https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook
```

---

## 第二步：在PayPal开发者后台配置Webhook

### 2.1 沙箱环境Webhook配置

1. 访问PayPal开发者后台：https://developer.paypal.com/
2. 登录你的PayPal账户
3. 进入 **Dashboard** → **My Apps &amp; Credentials**
4. 确保在 **Sandbox** 模式（页面上方切换）
5. 点击你之前创建的Sandbox App（如 `BG Remover`）
6. 滚动到 **Webhooks** 部分
7. 点击 **Add Webhook**

### 2.2 填写Webhook信息

**Webhook URL**:
```
https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook
```

**Event types（需要监听的事件）**:

✅ **必需的事件：
- `PAYMENT.CAPTURE.COMPLETED` - 支付完成（最重要！）

可选的事件（建议也选上）：
- `PAYMENT.CAPTURE.DENIED` - 支付被拒绝
- `PAYMENT.CAPTURE.REFUNDED` - 支付退款
- `PAYMENT.CAPTURE.REVERSED` - 支付撤销
- `CHECKOUT.ORDER.COMPLETED` - 订单完成
- `CHECKOUT.ORDER.APPROVED` - 订单已批准

### 2.3 保存Webhook

1. 点击 **Save**
2. 复制生成的 **Webhook ID**（重要！）
3. 格式类似：`08R40476MY532853P`

---

## 第三步：在Cloudflare Dashboard配置Webhook ID

### 3.1 进入Worker设置

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Workers &amp; Pages**
3. 点击 **bg-remover-worker**
4. 进入 **Settings** → **Variables and secrets**

### 3.2 添加Webhook ID Secret

1. 点击 **Add secret**
2. **Name**: `PAYPAL_WEBHOOK_ID`
3. **Value**: 刚才从PayPal复制的Webhook ID
4. 点击 **Add secret**

---

## 第四步：验证Webhook配置

### 4.1 测试Webhook（沙箱环境）

**方式1：通过PayPal开发者后台测试

1. 在PayPal开发者后台，进入你的App
2. 找到Webhooks部分
3. 点击你刚创建的Webhook
4. 点击 **Test** 按钮
5. 选择一个事件类型（如 `PAYMENT.CAPTURE.COMPLETED`）
6. 点击 **Send Test**
7. 检查Worker日志是否收到

**方式2：通过真实支付测试**

1. 访问网站完成一笔沙箱支付
2. 检查是否收到Webhook通知

---

## 第五步：真实环境Webhook配置（切换到live时重复以上步骤

### 5.1 切换到Live模式

1. 在PayPal开发者后台
2. 页面上方切换到 **Live** 模式
3. 创建一个新的Live App（或使用现有的）
4. 重复步骤2-4

### 5.2 Live环境Webhook URL

**注意：Live环境使用相同的Webhook URL：
```
https://bg-remover-worker.yangyong900829.workers.dev/paypal-webhook
```

---

## 📊 当前Worker中的Webhook处理逻辑

### 已实现的功能

你的Worker已经包含Webhook处理代码！

**处理的事件：
- `PAYMENT.CAPTURE.COMPLETED` - 支付完成

**代码位置**: `worker/index.ts` 中的 `/paypal-webhook` 路由

### Webhook处理流程

```
PayPal发送Webhook
    ↓
Worker接收请求
    ↓
验证事件类型
    ↓
解析custom_id（包含planId, userId, orderId）
    ↓
更新订单状态为已支付
    ↓
给用户添加配额
    ↓
记录交易
    ↓
返回200 OK
```

---

## 🔍 Webhook验证和调试

### 查看Worker日志

1. 访问 Cloudflare Dashboard
2. 进入 **Workers &amp; Pages** → **bg-remover-worker**
3. 点击 **Logs** → **Real-time logs**
4. 可以看到实时的Webhook日志

### Webhook签名验证（生产环境建议

当前代码使用简化验证，生产环境建议：

```typescript
// 完整的Webhook签名验证
await paypalService.verifyWebhookSignature(
  headers,
  body,
  webhookId
);
```

---

## ⚠️ 重要注意事项

### 1. Webhook URL必须公开可访问

✅ 你的Worker URL已经是公开的
✅ 不需要额外配置

### 2. Webhook必须返回200 OK

✅ 你的代码已经正确返回200 OK

### 3. Webhook处理要快

✅ 建议在10秒内处理完成
✅ 长时间处理应该异步执行

### 4. 幂等性处理

✅ 相同的Webhook可能会发送多次
✅ 需要处理重复通知

---

## 📋 Webhook配置检查清单

沙箱环境检查：
- [ ] Webhook URL已配置正确
- [ ] 已选择 `PAYMENT.CAPTURE.COMPLETED` 事件
- [ ] Webhook已保存
- [ ] Webhook ID已复制
- [ ] Webhook ID已添加到Cloudflare Secrets
- [ ] 已测试Webhook接收
- [ ] Worker日志显示Webhook已收到

真实环境检查（切换到live时）：
- [ ] 已切换到Live模式
- [ ] 已创建Live App
- [ ] Live环境Webhook已配置
- [ ] Live环境Webhook ID已更新
- [ ] 已测试小额真实支付
- [ ] 确认配额正确到账

---

## 🔧 故障排查

### 问题1：收不到Webhook

**检查项**：
- Webhook URL是否正确
- Worker是否正常运行
- PayPal开发者后台Webhook状态
- Worker日志

**解决方法**：
- 访问Webhook URL看是否能访问
- 检查Worker是否部署成功
- 在PayPal后台重新发送Webhook

### 问题2：Webhook验证失败

**检查项**：
- Webhook ID是否正确
- Secret是否在Cloudflare中正确设置

**解决方法**：
- 重新复制Webhook ID
- 重新添加到Cloudflare Secrets

### 问题3：支付成功但配额没到账

**检查项**：
- Webhook是否收到
- custom_id解析是否正确
- 数据库操作是否成功

**解决方法**：
- 查看Worker日志
- 检查custom_id格式
- 验证数据库连接

---

## 🎉 Webhook配置完成！

配置完Webhook后，你的支付系统就具备了：

- ✅ 实时支付通知
- ✅ 自动配额发放
- ✅ 订单自动更新
- ✅ 退款处理支持
- ✅ 支付状态监控

---

**文档版本**: v1.0  
**创建日期**: 2026-04-02  
**维护者**: little-young
