# Docker 部署贡献说明

姓名：商雨婷
学号：2312190520
日期：2026-05-13

## 我完成的工作

### 1. Dockerfile 编写

- [x] 后端 Dockerfile（多阶段构建，目标镜像 < 300MB）
- [x] backend/.dockerignore（排除 target/、.git/、.env、测试代码等）

后端使用两阶段构建：
- `builder` 阶段：`eclipse-temurin:17-jdk-alpine` + Maven 打包
- `runtime` 阶段：`eclipse-temurin:17-jre-alpine`，仅拷贝 jar，镜像更小

### 2. Compose 配置

- [x] 开发环境 `compose.yaml`：后端 + MySQL 8.0，含热重载友好的环境变量配置
- [x] 生产环境 `compose.prod.yaml`：从 GHCR 拉取镜像，密钥通过环境变量注入，含资源限制（backend 512M / db 256M）
- [x] 健康检查配置：
  - 后端：`wget -qO- http://localhost:8080/health`，interval 30s，retries 3
  - MySQL：`mysqladmin ping`，interval 5s，retries 10
- [x] 数据持久化：MySQL 使用 `dbdata` 命名卷，容器重启数据不丢失

为此新增了 `/health` 端点（`HealthController.java`），并将其加入拦截器白名单。

### 3. 自动化部署

- 选择了**选项 A**：构建并推送镜像到 GHCR
- 配置文件：`.github/workflows/docker.yml`
  - 触发条件：push 到 main 分支
  - 步骤：登录 GHCR → 多阶段构建并推送 → trivy 漏洞扫描（CRITICAL/HIGH）
  - 使用 GHA 缓存加速构建（`cache-from/cache-to: type=gha`）
- 同时提供 `deploy.sh` 一键本地启动脚本（选项 B 兜底）

## PR 链接

- PR #：（提交后填写）

## 遇到的问题和解决

1. 问题：Spring Boot 默认没有 `/health` 端点，Docker HEALTHCHECK 无法探测  
   解决：新增 `HealthController.java` 返回 `{"status":"ok"}`，并在 `WebMvcConfig` 中将 `/health` 加入拦截器白名单

2. 问题：多阶段构建中 Maven 不在 JDK Alpine 基础镜像中  
   解决：在 builder 阶段通过 `apk add --no-cache maven` 安装，不影响最终 runtime 镜像体积

3. 问题：生产 compose 中 MySQL 密码如何安全传入  
   解决：`compose.prod.yaml` 全部通过 `${ENV_VAR}` 引用，部署时配合 `.env` 文件（已加入 `.gitignore`）或 CI Secret 注入

## AI 使用情况

- 使用工具：Claude Code
- 主要用途：生成 Dockerfile 多阶段构建框架、Compose 健康检查配置语法、GitHub Actions docker.yml 模板
- AI 生成后人工调整：将数据库从 PostgreSQL 改为 MySQL 8.0（匹配项目实际技术栈）、调整镜像标签路径格式、补充 HealthController 实现

## 心得体会

多阶段构建是减小镜像体积的关键——builder 阶段包含完整 JDK 和 Maven，runtime 阶段只保留 JRE 和 jar 文件，两者的基础镜像都选用 Alpine 变体，进一步压缩体积。非 root 用户运行是容器安全的基础实践，即使容器被攻破也无法获取宿主机 root 权限。生产环境通过环境变量注入密钥、配合 GitHub Actions 自动扫描，把安全检查固化进流水线，这是 DevSecOps 的核心思路。
