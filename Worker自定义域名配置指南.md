
# Worker自定义域名配置指南

## 🎯 目标

将Worker从默认域名：
`https://bg-remover-worker.yangyong900829.workers.dev`

配置为自定义域名，例如：
`https://api.alltoolsimagebgremove.shop`

## 📋 前置条件

- ✅ Cloudflare账户
- ✅ 域名已添加到Cloudflare
- ✅ Worker已部署成功

## 🚀 配置步骤

### 第一步：选择自定义域名

建议使用以下格式之一：
- `api.alltoolsimagebgremove.shop`（推荐）
- `worker.alltoolsimagebgremove.shop`
- `backend.alltoolsimagebgremove.shop`

### 第二步：在Cloudflare控制台配置

#### 方式1：通过Worker设置（推荐）

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Workers &amp; Pages**
3. 点击 **bg-remover-worker**
4. 进入 **Settings** → **Triggers**
5. 在 **Custom Domains** 部分，点击 **Add custom domain**
6. 输入你的自定义域名，例如：`api.alltoolsimagebgremove.shop`
7. 点击 **Add custom domain**
8. Cloudflare会自动配置DNS记录

#### 方式2：通过DNS记录手动配置

1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 选择你的域名：`alltoolsimagebgremove.shop`
3. 进入 **DNS**
4. 点击 **Add record**
5. 配置记录：
   - **Type**: `CNAME`
   - **Name**: `api`（或你选择的子域名）
   - **Target**: `bg-remover-worker.yangyong900829.workers.dev`
   - **Proxy status**: `Proxied` (橙色云朵)
   - **TTL**: `Auto`
6. 点击 **Save**

### 第三步：配置Worker路由

1. 进入 **Workers &amp; Pages** → **bg-remover-worker** → **Settings** → **Triggers**
2. 在 **Routes** 部分，点击 **Add route**
3. 配置路由：
   - **Route**: `api.alltoolsimagebgremove.shop/*`
   - **Zone**: 选择 `alltoolsimagebgremove.shop`
4. 点击 **Add route**

### 第四步：验证配置

1. 等待1-2分钟让DNS生效
2. 访问你的自定义域名：`https://api.alltoolsimagebgremove.shop`
3. 应该能看到Worker的响应

### 第五步：更新前端配置

修改 `.env.production` 文件：

```bash
# 旧配置
# NEXT_PUBLIC_WORKER_URL=https://bg-remover-worker.yangyong900829.workers.dev

# 新配置
NEXT_PUBLIC_WORKER_URL=https://api.alltoolsimagebgremove.shop
```

然后重新部署前端：

```bash
cd /root/.openclaw/workspace/bg-remover
npm run build
npm run deploy
```

## 🔧 完整的域名架构建议

### 推荐配置

| 服务 | 域名 | 说明 |
|------|------|------|
| 前端网站 | `https://www.alltoolsimagebgremove.shop` | 用户访问的主站 |
| API/Worker | `https://api.alltoolsimagebgremove.shop` | 后端API服务 |
| （可选）裸域名 | `https://alltoolsimagebgremove.shop` | 重定向到www |

### 配置裸域名重定向（可选）

如果你希望 `https://alltoolsimagebgremove.shop` 也能访问：

1. 进入 **Rules** → **Redirect Rules**
2. 点击 **Create rule**
3. 配置规则：
   - **Rule name**: `Redirect naked domain to www`
   - **Field**: `Hostname`
   - **Operator**: `equals`
   - **Value**: `alltoolsimagebgremove.shop`
   - **Then**: `URL redirect`
   - **Type**: `Dynamic`
   - **Expression**: `concat("https://www.alltoolsimagebgremove.shop", http.request.uri)`
   - **Status code**: `301`
4. 点击 **Deploy**

## 📊 验证检查清单

- [ ] 自定义域名已添加到Worker
- [ ] DNS记录已配置（CNAME）
- [ ] Worker路由已配置
- [ ] 可以通过自定义域名访问Worker
- [ ] 前端配置已更新
- [ ] 前端已重新部署
- [ ] 测试完整功能正常

## 🔍 故障排查

### 问题1：自定义域名无法访问

**检查项**：
- DNS记录是否正确配置
- Proxy状态是否为Proxied（橙色云朵）
- 是否等待了足够的时间（1-5分钟）

**解决方法**：
- 检查DNS记录：`nslookup api.alltoolsimagebgremove.shop`
- 清除浏览器缓存
- 尝试使用无痕模式

### 问题2：CORS错误

**检查项**：
- Worker的CORS配置是否包含新域名
- 前端的API地址是否正确

**解决方法**：
- 检查Worker代码中的CORS配置
- 确认 `.env.production` 中的地址正确

### 问题3：SSL证书错误

**检查项**：
- 域名是否正确托管在Cloudflare
- SSL/TLS设置是否为Full

**解决方法**：
- 进入 **SSL/TLS** → **Overview**
- 确保设置为 **Full** 或 **Full (strict)**
- 等待证书生成（最多15分钟）

## 🎉 完成！

配置完成后，你的架构将是：

```
用户访问
    ↓
https://www.alltoolsimagebgremove.shop (前端)
    ↓
https://api.alltoolsimagebgremove.shop (Worker API)
    ↓
Cloudflare边缘计算
```

---

**文档版本**: v1.0  
**创建日期**: 2026-04-02  
**维护者**: little-young
