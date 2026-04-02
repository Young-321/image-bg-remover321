
# Worker自定义域名配置完整指南

## 🎯 目标

将Worker从默认域名：
`https://bg-remover-worker.yangyong900829.workers.dev`

配置为自定义域名：
`https://api.alltoolsimagebgremove.shop`

**这样Webhook URL就可以使用：
`https://api.alltoolsimagebgremove.shop/paypal-webhook`

---

## 🚀 配置步骤

### 第一步：在Cloudflare控制台配置自定义域名

#### 方式1：通过Worker设置（最简单，推荐

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Workers &amp; Pages**
3. 点击 **bg-remover-worker**
4. 进入 **Settings** → **Triggers**
5. 在 **Custom Domains** 部分，点击 **Add custom domain**
6. 输入自定义域名：`api.alltoolsimagebgremove.shop`
7. 点击 **Add custom domain**
8. 等待Cloudflare自动配置DNS记录（通常1-2分钟

#### 方式2：手动配置DNS记录

如果方式1不工作，手动配置：

1. 访问 Cloudflare Dashboard
2. 选择你的域名：`alltoolsimagebgremove.shop`
3. 进入 **DNS**
4. 点击 **Add record**
5. 配置记录：
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Target**: `bg-remover-worker.yangyong900829.workers.dev`
   - **Proxy status**: `Proxied` (橙色云朵
   - **TTL**: `Auto`
6. 点击 **Save**

### 第二步：配置Worker路由

1. 在Worker页面，进入 **Settings** → **Triggers**
2. 在 **Routes** 部分，点击 **Add route**
3. 配置路由：
   - **Route**: `api.alltoolsimagebgremove.shop/*`
   - **Zone**: 选择 `alltoolsimagebgremove.shop`
4. 点击 **Add route**

### 第三步：验证自定义域名

1. 等待1-5分钟让DNS生效
2. 访问：`https://api.alltoolsimagebgremove.shop`
3. 应该能看到Worker的响应

### 第四步：更新前端配置

需要的话，更新前端的API地址：

修改 `.env.production`：

```bash
# 旧配置
# NEXT_PUBLIC_WORKER_URL=https://bg-remover-worker.yangyong900829.workers.dev

# 新配置（使用自定义域名
NEXT_PUBLIC_WORKER_URL=https://api.alltoolsimagebgremove.shop
```

然后重新部署前端：

```bash
cd /root/.openclaw/workspace/bg-remover
./deploy.sh
```

---

## 🔔 更新PayPal Webhook URL

### 沙箱环境Webhook URL更新

**新的Webhook URL**（使用自定义域名）：
```
https://api.alltoolsimagebgremove.shop/paypal-webhook
```

#### 更新步骤：

1. 访问PayPal开发者后台：https://developer.paypal.com/
2. 进入 **Dashboard** → **My Apps &amp; Credentials**
3. 选择你的Sandbox App
4. 找到 **Webhooks** 部分
5. 删除旧的Webhook（或编辑
6. 点击 **Add Webhook** 创建新的
7. **Webhook URL**：`https://api.alltoolsimagebgremove.shop/paypal-webhook`
8. 选择事件：`PAYMENT.CAPTURE.COMPLETED`
9. 点击 **Save**
10. 复制新的 **Webhook ID**

### 真实环境Webhook URL更新（切换到live时

同样使用：
```
https://api.alltoolsimagebgremove.shop/paypal-webhook
```

---

## 📊 完整的域名架构

### 配置后的架构

| 服务 | 域名 | 说明 |
|------|------|------|
| 前端网站 | `https://www.alltoolsimagebgremove.shop` | ✅ 已配置 |
| API/Worker | `https://api.alltoolsimagebgremove.shop` | ⏳ 待配置 |
| Webhook | `https://api.alltoolsimagebgremove.shop/paypal-webhook` | ⏳ 待配置 |

---

## ✅ 配置检查清单

Worker自定义域名检查：
- [ ] 已在Worker Settings中添加自定义域名
- [ ] DNS记录已正确配置
- [ ] Worker路由已配置
- [ ] 可以通过自定义域名访问Worker
- [ ] 前端配置已更新（如需要
- [ ] 前端已重新部署（如需要

Webhook更新检查：
- [ ] 已在PayPal后台更新Webhook URL
- [ ] 新Webhook URL使用自定义域名
- [ ] 已选择正确的事件类型
- [ ] 新的Webhook ID已复制
- [ ] Cloudflare Secrets中的Webhook ID已更新
- [ ] 已测试Webhook接收

---

## 🔍 验证测试

### 测试1：自定义域名访问

访问：`https://api.alltoolsimagebgremove.shop`
- 应该能看到Worker的响应
- SSL证书应该有效

### 测试2：Webhook接收

1. 在PayPal开发者后台测试Webhook
2. 检查Worker日志
3. 确认Webhook通过自定义域名接收

### 测试3：完整支付流程

1. 完成一笔支付
2. 确认Webhook收到
3. 确认配额正确到账

---

## 🎉 完成！

配置完成后，你的系统将使用专业的自定义域名：

- 🌐 前端：`https://www.alltoolsimagebgremove.shop`
- 🔧 API：`https://api.alltoolsimagebgremove.shop`
- 🔔 Webhook：`https://api.alltoolsimagebgremove.shop/paypal-webhook`

**优势：
- ✅ 更专业的品牌形象
- ✅ 更稳定的服务
- ✅ 更容易记忆
- ✅ 更好的SEO

---

**文档版本**: v1.0  
**创建日期**: 2026-04-02  
**维护者**: little-young
