# HelpMate 部署说明文档

## 一、平台选择

### 前端部署：Vercel

选择 **Vercel** 作为前端部署平台，原因如下：
- 对 Vite/React 项目开箱即用，零配置即可部署
- 免费层资源充足（100GB 带宽/月）
- 自动 HTTPS、全球 CDN 加速
- 支持 Git 推送自动部署（连接 GitHub 仓库即可）
- 支持环境变量、SPA 路由重写等高级配置

### 后端部署：Railway / Docker

后端 Spring Boot 应用推荐以下方案之一：
- **Railway**：支持 Docker 部署，自动检测 Dockerfile
- **自建 VPS + Docker Compose**：使用项目已有的 `compose.prod.yaml`

---

## 二、前端部署配置

### 2.1 Vercel 配置文件 (`vercel.json`)

项目根目录下的 `vercel.json` 配置如下：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rootDirectory": "frontend",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**关键配置说明：**

| 配置项 | 说明 |
|--------|------|
| `rootDirectory` | 指定为 `frontend`，因为项目采用 monorepo 结构 |
| `buildCommand` | `npm run build` → 执行 `vite build` 生成静态资源 |
| `outputDirectory` | `dist` — Vite 默认构建输出目录 |
| `rewrites` | SPA fallback：所有非 `/api/` 路由重写到 `index.html`，由 React Router 接管 |
| `headers` | 静态资源强缓存（带 hash 的文件），安全响应头（XSS/Frame 防护） |

### 2.2 部署步骤

#### 方式一：Vercel CLI 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目根目录执行部署（预览）
vercel

# 4. 生产部署
vercel --prod
```

#### 方式二：Vercel 网页端（推荐）

1. 访问 [vercel.com](https://vercel.com) 并登录（推荐 GitHub 账号）
2. 点击 **New Project** → 导入 GitHub 仓库 `s-123489/HelpMate`
3. 配置项目：
   - **Framework Preset**：Vite
   - **Root Directory**：`frontend`
   - **Build Command**：`npm run build`
   - **Output Directory**：`dist`
4. 配置环境变量（见下方 2.3）
5. 点击 **Deploy** 即可

---

### 2.3 环境变量配置

在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://api.helpmate.app/api` | 后端 API 地址 |
| `NODE_ENV` | `production` | 生产模式 |

> **注意**：Vite 中环境变量需加 `VITE_` 前缀才会暴露给前端代码。在 `src/services/api.js` 中通过 `import.meta.env.VITE_API_BASE_URL` 读取。

---

### 2.4 自动部署配置

连接 GitHub 仓库后，Vercel 默认会：

- 监听 `main` 分支（可在设置中改为 `develop`）
- 每次 `git push` 自动触发构建和部署
- 为每个 Pull Request 生成独立的预览环境（Preview Deployments）

**额外 CI/CD**：项目已配置 GitHub Actions（`.github/workflows/`），用于 Docker 镜像构建和自动化测试。

---

## 三、后端部署（Docker）

后端使用 Docker Compose 部署，详见 `compose.yaml`：

```bash
# 生产环境启动
docker compose -f compose.prod.yaml up -d
```

前端 Nginx 配置（`frontend/nginx.conf`）已包含：
- SPA fallback（`try_files $uri /index.html`）
- `/api/` 反向代理到后端
- 健康检查端点（`/health`）

---

## 四、域名配置（可选）

### Vercel 自定义域名

1. 在 Vercel 项目设置 → **Domains** → 添加域名
2. 在域名 DNS 服务商处添加 CNAME 记录指向 `cname.vercel-dns.com`
3. Vercel 自动申请并续期 SSL 证书（Let's Encrypt）

### 生产环境推荐域名

- 前端：`helpmate.vercel.app`（默认）或自定义 `app.helpmate.app`
- 后端 API：`api.helpmate.app`

---

## 五、目录结构

```
project/
├── vercel.json              # Vercel 部署配置
├── .vercelignore            # Vercel 上传忽略文件
├── docker-compose.yaml      # Docker Compose 配置
├── frontend/
│   ├── Dockerfile           # 前端 Docker 镜像
│   ├── nginx.conf           # Nginx 配置
│   ├── package.json         # 前端依赖与脚本
│   └── vite.config.js       # Vite 构建配置
├── backend/
│   ├── Dockerfile           # 后端 Docker 镜像
│   └── ...
├── docs/
│   ├── deployment.md        # 本文档
│   └── contributions/
│       └── 12-cloud/
│           ├── 陈晓彤.md
│           ├── Lilili.md
│           └── syt.md
└── .github/
    └── workflows/           # CI/CD 工作流
```

---

## 六、验证清单

- [ ] 部署后通过浏览器访问应用 URL
- [ ] 测试登录/注册功能（确保 API 连接正常）
- [ ] 测试 SPA 路由——直接访问子路径（如 `/task/1`）不 404
- [ ] 检查 HTTPS 是否生效
- [ ] 检查环境变量是否生效（`VITE_API_BASE_URL`）
- [ ] Git 推送后确认自动部署触发
