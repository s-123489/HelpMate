# 安全审查贡献说明

姓名：商雨婷  
学号：2312190520  
日期：2026-05-12

## 我完成的工作

### AI 安全审查

- 审查了哪些文件/模块：
  - `application.yml`（配置文件）
  - `JwtUtil.java`、`AuthInterceptor.java`（认证模块）
  - `GlobalExceptionHandler.java`、`WebMvcConfig.java`（公共组件）
  - `UserController.java`、`UserServiceImpl.java`（用户模块）
  - `TaskController.java`、`TaskServiceImpl.java`（任务模块）
  - `AIController.java`、`AIServiceImpl.java`、`AIChatRequest.java`（AI 客服模块）

- AI 发现的主要问题：
  1. `application.yml` 中硬编码了数据库密码、JWT 密钥、AI API Key（高危）
  2. `AIChatRequest` 对用户输入无长度限制，可被滥用（中危）
  3. `AIServiceImpl` 异常信息直接暴露给客户端，泄露内部细节（中危）
  4. 缺少安全 HTTP 响应头（低危）

- 我修复了哪些问题：
  1. **硬编码密钥**：将 `application.yml` 中所有敏感配置改为 `${ENV_VAR:default}` 形式，通过环境变量注入
  2. **AI 输入无限制**：在 `AIChatRequest.message` 添加 `@Size(max = 500)` 校验
  3. **异常信息泄露**：`AIServiceImpl` 中将错误详情记录到日志，对外只返回通用提示
  4. **安全 HTTP 头**：在 `WebMvcConfig` 中新增 Filter，添加 `X-Content-Type-Options`、`X-Frame-Options` 等响应头

### 安全检查清单

**认证与授权**
- ✅ 密码存储：使用 BCrypt 哈希（`BCryptPasswordEncoder`），不存明文
- ✅ JWT / Session：Token 有 24 小时过期时间
- ✅ 接口鉴权：`AuthInterceptor` 拦截所有 `/api/**`，公开接口白名单排除
- ✅ 越权访问：任务创建从 JWT 中提取 `userId`，用户无法篡改

**注入防护**
- ✅ SQL：使用 MyBatis-Plus `LambdaQueryWrapper` 参数化查询，无字符串拼接
- ⚪ XSS：不适用（后端纯 REST API，无 HTML 渲染）

**敏感信息**
- ✅ API Key / 密码：已修复，改为环境变量注入
- ✅ .env 文件：已加入 `.gitignore`，新增 `.env.example` 模板
- ✅ 依赖安全：Spring Boot 3.2.3，依赖版本较新，无已知高危漏洞

### CI 安全扫描

- 配置了哪个选项：**选项 A — 密钥泄露扫描（Gitleaks）**
- 配置文件：`.github/workflows/security.yml`
- 扫描结果：Gitleaks 在每次 push/PR 时自动扫描全部 Git 历史，检测是否有 API Key、密码等敏感信息泄露

### 选做完成情况

- ✅ **安全 HTTP 头**：在 `WebMvcConfig` 中配置了 `X-Content-Type-Options`、`X-Frame-Options`、`X-XSS-Protection`、`Referrer-Policy` 响应头

## PR 链接

- （提交后填写 PR 链接）

## 遇到的问题和解决

1. 问题：`application.yml` 中历史提交包含真实 API Key，Gitleaks 可能告警  
   解决：建议在 SiliconFlow 控制台撤销旧 Key，申请新 Key；对历史提交中已知的 Key 可添加 `.gitleaksignore` 规则忽略

2. 问题：修改配置为环境变量后，本地开发需要设置环境变量  
   解决：参考 `.env.example` 创建 `.env` 文件，或在 IDE 中配置 Run/Debug Configuration 的环境变量

## 心得体会

在 Vibe Coding 的场景下，AI 能够快速生成功能代码，但安全意识往往被效率优先所淡化。这次审查发现最典型的问题就是硬编码密钥——AI 在生成初始代码时为了让代码能直接运行，直接把真实的 API Key 写进了配置文件，开发者容易忽略这一点就直接提交。

平衡效率和安全的关键在于：**让安全措施自动化**。通过 CI 中集成 Gitleaks，每次提交都会自动检测密钥泄露；通过环境变量管理配置，把安全实践固化到开发流程中，而不是依赖开发者记忆。好的安全不是阻碍开发效率，而是把安全检查点提前到代码合并之前。
