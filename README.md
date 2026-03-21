# AI 背景移除网站

一个简单易用的在线图片背景移除工具，基于 Cloudflare Workers + remove.bg API 构建。

## ✨ 功能特性

- 🚀 **一键移除背景**：上传图片，AI 自动处理
- 🌍 **全球加速**：Cloudflare 边缘计算，低延迟
- 💾 **隐私保护**：图片不存储，内存处理完即释放
- ⚡ **快速响应**：毫秒级处理速度
- 🆓 **免费额度**：每月前 50 张图片免费
- 📱 **响应式设计**：支持手机和电脑访问

## 🏗️ 技术架构

```
用户浏览器 → Cloudflare Pages (前端) → Cloudflare Workers (后端) → Remove.bg API
```

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Cloudflare Workers (边缘计算)
- **AI服务**: Remove.bg API (专业抠图)
- **部署**: Cloudflare Pages + Workers

## 🚀 快速开始

### 1. 本地开发
```bash
# 克隆项目
git clone <repository-url>
cd bg-remover

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的配置

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 2. 获取 API 密钥
1. 访问 [remove.bg](https://www.remove.bg/api)
2. 注册免费账号
3. 获取 API 密钥

### 3. 环境变量配置
创建 `.env.local` 文件：
```env
# Remove.bg API 密钥
REMOVE_BG_API_KEY=your-api-key-here

# 前端环境变量
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

## 📦 部署到 Cloudflare

### 1. 准备 Cloudflare 账户
- 注册 [Cloudflare](https://dash.cloudflare.com)
- 获取 Account ID 和 API Token

### 2. 配置 GitHub Secrets
在 GitHub 仓库设置中添加：
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `REMOVE_BG_API_KEY`: Remove.bg API 密钥
- `NEXT_PUBLIC_WORKER_URL`: Worker 部署后的 URL

### 3. 自动部署
推送代码到 `main` 分支，GitHub Actions 会自动：
1. 部署 Worker 到 Cloudflare Workers
2. 部署前端到 Cloudflare Pages
3. 运行测试和检查

### 4. 手动部署
```bash
# 部署 Worker
pnpm wrangler login
pnpm wrangler secret put REMOVE_BG_API_KEY
pnpm wrangler deploy

# 部署前端
pnpm build
# 手动上传 out/ 目录到 Cloudflare Pages
```

## 🔧 项目结构

```
bg-remover/
├── app/                    # Next.js 前端
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 全局布局
│   └── globals.css        # 全局样式
├── worker/                # Cloudflare Worker
│   └── index.ts           # Worker 主逻辑
├── public/                # 静态资源
├── .github/workflows/     # GitHub Actions
├── .env.local.example     # 环境变量示例
├── wrangler.toml          # Worker 配置
├── next.config.ts         # Next.js 配置
├── package.json           # 依赖配置
└── README.md              # 项目文档
```

## 💰 成本估算

| 服务 | 免费额度 | 超出费用 |
|------|----------|----------|
| **Cloudflare Workers** | 10万次/天 | $0.30/百万次 |
| **Cloudflare Pages** | 无限请求 | 免费 |
| **Remove.bg API** | 50张/月 | $0.29/张 |
| **总成本** | **基本免费** | 个人使用无压力 |

## 🚀 开发命令

```bash
# 开发
pnpm dev              # 启动前端开发服务器
pnpm worker:dev       # 启动 Worker 开发服务器

# 构建
pnpm build           # 构建生产版本
pnpm start           # 启动生产服务器

# 部署
pnpm wrangler deploy # 部署 Worker

# 代码质量
pnpm lint            # 代码检查
pnpm tsc --noEmit    # TypeScript 检查
```

## 🔒 安全说明

- **API 密钥安全**: 通过环境变量管理，不提交到代码仓库
- **隐私保护**: 图片内存处理，不存储用户数据
- **HTTPS 加密**: 全链路 HTTPS 传输
- **输入验证**: 文件类型、大小验证，防止恶意上传

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 支持

- 问题反馈: [GitHub Issues](https://github.com/your-username/bg-remover/issues)
- 功能建议: [GitHub Discussions](https://github.com/your-username/bg-remover/discussions)

---

**立即体验**: 上传图片，一键移除背景！ 🚀