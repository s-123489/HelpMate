# Docker 部署贡献说明

姓名：李丽丽　日期：2026-05-12

## 我完成的工作

### 1. Dockerfile 编写

- [ ] 前端 Dockerfile（多阶段构建）— 不适用，前端暂未完成
- [x] 后端 Dockerfile（多阶段构建）— 由商雨婷编写，已合并到 develop
- [x] .dockerignore 文件 — 由商雨婷编写，已合并到 develop

### 2. Compose 配置

- [x] 开发环境 compose.yaml — 包含 backend + MySQL 服务，健康检查配置
- [x] 生产环境 compose.prod.yaml — 包含资源限制和密钥管理
- [x] 健康检查配置 — backend 和 db 均配置 healthcheck

### 3. 自动化部署

- 选择了选项 A：构建并推送镜像到 GHCR
- 配置文件：`.github/workflows/docker.yml`
- 具体内容：
  - 推送 main 分支时自动触发
  - 登录 GHCR 并构建后端镜像
  - 推送镜像至 `ghcr.io/s-123489/helpmate/backend:latest`
  - 集成 trivy 漏洞扫描，检测 CRITICAL 和 HIGH 级别漏洞

## PR 链接

- 直接 push 至 feature/Lilili-backend-doc 分支后合并到 develop 和 main

## 遇到的问题和解决

1. 问题：后端 Dockerfile 不在 main 分支上 → 解决：等商雨婷将后端分支合并到 develop，再从 develop 拉取
2. 问题：docker.yml 构建需要 backend/Dockerfile 存在 → 解决：确认 develop 上已有 Dockerfile 后再提交 workflow

## AI 使用情况

- 使用 Prompt：为 Spring Boot 后端生成生产级 Docker workflow，包含 GHCR 推送和 trivy 漏洞扫描
- AI 帮助生成了完整的 docker.yml 配置，包括权限设置、登录步骤、构建推送和安全扫描

## 心得体会

通过配置 GitHub Actions 自动构建 Docker 镜像，实现了代码推送后自动打包部署的流程。trivy 漏洞扫描让镜像安全问题在 CI 阶段就能被发现，而不是到生产环境才暴露。容器化部署保证了开发和生产环境的一致性，减少了"在我电脑上能跑"的问题。