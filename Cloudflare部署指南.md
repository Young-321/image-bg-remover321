# Cloudflare 部署指南

## 🚀 快速部署步骤

### 第一步：准备账户
1. **Cloudflare 账户**：注册或登录 https://dash.cloudflare.com
2. **Remove.bg API 密钥**：已获取 `oFdX2c6ARDvKhvVsAp19mheV`

### 第二步：部署 Worker (后端)
```bash
# 1. 登录 Cloudflare
pnpm wrangler login

# 2. 设置 API 密钥（安全方式）
pnpm wrangler secret put REMOVE_BG_API_KEY
# 输入: oFdX2c6ARDvKhvVsAp19mheV

# 3. 部署 Worker
pnpm wrangler deploy
```

### 第三步：部署 Pages (前端)
1. **推送代码到 GitHub**
2. **Cloudflare Dashboard** → Pages → 创建项目
3. **配置构建**：
   - 构建命令：`pnpm build`
   - 输出目录：`out`
   - 环境变量（可选）：
     ```
     WORKER_URL = https://bg-remover-worker.your-account.workers.dev
     ```

### 第四步：配置域名 (可选)
1. **DNS 设置**：
   ```
   CNAME bg-remover.yourdomain.com → your-pages-project.pages.dev
   ```
2. **Pages 绑定**：在 Pages 项目设置中添加自定义域名
3. **Worker 路由**（如果需要 API 子域名）：
   ```
   Route: api.yourdomain.com/*
   Service: bg-remover-worker
   ```

## 🔧 详细配置

### Worker 配置 (`wrangler.toml`)
```toml
name = "bg-remover-worker"
main = "worker/index.ts"
compatibility_date = "2025-03-21"

# 开发环境变量 (本地测试)
[vars]
REMOVE_BG_API_KEY = "dev-test-key"

# 构建配置
[build]
command = "npm run build"
```

### 本地开发环境变量 (`.dev.vars`)
```bash
REMOVE_BG_API_KEY=dev-test-key
```

### 生产环境变量
**不要**将真实 API 密钥提交到代码仓库！使用：
- `wrangler secret put`（推荐）
- Cloudflare Dashboard → Workers & Pages → 你的 Worker → 设置 → 环境变量

## 🧪 本地测试

### 1. 启动前端
```bash
pnpm dev
# 访问 http://localhost:3000
```

### 2. 启动 Worker
```bash
pnpm worker:dev
# API 地址: http://localhost:8787
```

### 3. 更新前端配置
在 `app/page.tsx` 中，找到：
```typescript
const workerUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8787'
  : 'https://bg-remover-worker.your-account.workers.dev';
```
替换为你的实际 Worker 域名。

## 📊 监控与维护

### 查看日志
```bash
# Worker 日志
pnpm wrangler tail

# 或通过 Dashboard
Cloudflare Dashboard → Workers & Pages → 你的 Worker → 日志
```

### 查看使用情况
- **Worker 用量**：Dashboard → Workers & Pages → 用量
- **Remove.bg 额度**：https://www.remove.bg/dashboard

### 更新部署
```bash
# 更新代码后重新部署
git pull origin main
pnpm wrangler deploy

# 重新构建前端（如果修改了前端代码）
pnpm build
# 会自动触发 Pages 重新部署
```

## ⚠️ 常见问题

### 1. API 密钥无效
**症状**：Worker 返回 "Invalid API key" 错误
**解决**：
```bash
# 重新设置密钥
pnpm wrangler secret delete REMOVE_BG_API_KEY
pnpm wrangler secret put REMOVE_BG_API_KEY
```

### 2. CORS 错误
**症状**：浏览器控制台显示 CORS 错误
**解决**：
- 检查 Worker 响应头是否包含 `Access-Control-Allow-Origin: *`
- 确保前端调用正确的 Worker URL

### 3. 文件大小限制
**症状**：上传大图片失败
**解决**：
- Remove.bg API 限制：最大 10MB
- 前端验证：上传前检查文件大小

### 4. 免费额度用尽
**症状**：API 返回 402 错误
**解决**：
- 等待下个月重置（每月1号）
- 购买 Remove.bg 付费套餐
- 考虑使用本地 AI 模型

## 💰 成本控制

### 免费额度
| 服务 | 免费额度 | 备注 |
|------|----------|------|
| Cloudflare Workers | 10万次/天 | 足够个人使用 |
| Cloudflare Pages | 无限请求 | 完全免费 |
| Remove.bg API | 50张/月 | 新用户注册 |

### 超量成本
- **Remove.bg**：$0.29/张（超出免费额度）
- **Cloudflare Workers**：$0.30/百万次请求（超出免费额度）

### 省钱建议
1. **监控使用量**：定期检查 Remove.bg 余额
2. **本地缓存**：常用图片处理结果可以缓存
3. **升级方案**：如果用量大，考虑 Remove.bg 付费套餐

## 🔒 安全建议

### API 密钥安全
1. **永不提交到代码仓库**
2. **使用环境变量**：
   ```bash
   # 正确做法
   wrangler secret put REMOVE_BG_API_KEY
   
   # 错误做法
   echo "REMOVE_BG_API_KEY=xxx" >> wrangler.toml
   ```

### 防止滥用
1. **速率限制**：在 Worker 中添加限流逻辑
2. **文件验证**：检查文件类型和大小
3. **日志监控**：关注异常请求模式

### 隐私保护
1. **无持久化存储**：图片内存处理，不保存
2. **匿名处理**：不记录用户个人信息
3. **定期清理**：无残留数据

## 🎯 上线检查清单

### 部署前检查
- [ ] API 密钥通过 `wrangler secret` 设置
- [ ] Worker 成功部署
- [ ] Pages 项目创建并绑定 GitHub
- [ ] 前端构建成功
- [ ] 域名解析配置（如使用自定义域名）

### 功能测试
- [ ] 前端能正常访问
- [ ] 图片上传功能正常
- [ ] 背景移除处理正常
- [ ] 下载功能正常
- [ ] 错误提示友好

### 性能测试
- [ ] 单次处理时间 < 5秒
- [ ] 并发处理正常
- [ ] 移动端访问正常
- [ ] 不同浏览器兼容性

## 📞 技术支持

### Cloudflare 支持
- 文档：https://developers.cloudflare.com/
- 社区：https://community.cloudflare.com/
- 工单：Dashboard → 帮助 → 联系支持

### Remove.bg 支持
- 文档：https://www.remove.bg/api
- 控制台：https://www.remove.bg/dashboard
- 邮件：support@remove.bg

### 项目问题
1. 检查日志：`pnpm wrangler tail`
2. 本地复现：`pnpm dev` + `pnpm worker:dev`
3. 查看错误：浏览器控制台 + Worker 日志

---

**部署完成标志**：访问你的网站，成功上传图片并移除背景，下载透明背景 PNG 文件！