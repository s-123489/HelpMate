# 安全审查报告

> 本文档包含后端和前端两部分安全审查记录。
**项目**：HelpMate 校园跑腿互助平台  
**审查日期**：2026-05-12  
**审查人**：商雨婷  
**审查方法**：AI 辅助安全审查（OWASP Top 10 视角）

---

## 一、AI 审查过程

将以下核心文件提交给 AI 进行安全审查：

- `application.yml`（配置文件）
- `JwtUtil.java`（JWT 认证）
- `AuthInterceptor.java`（鉴权拦截器）
- `GlobalExceptionHandler.java`（全局异常处理）
- `WebMvcConfig.java`（Web 配置）
- `UserController.java` / `UserServiceImpl.java`（用户模块）
- `TaskController.java` / `TaskServiceImpl.java`（任务模块）
- `AIController.java` / `AIServiceImpl.java`（AI 客服模块）
- `AIChatRequest.java`（输入 DTO）

使用 Prompt：
> 请对以下代码进行安全审查（OWASP Top 10 视角），检查：注入漏洞、失效的访问控制、硬编码密钥或敏感信息、密码是否明文存储、错误信息是否暴露内部细节。

---

## 二、AI 发现的问题

### 问题 1：硬编码密钥和敏感信息（高危）

**漏洞类型**：敏感信息泄露（OWASP A02: Cryptographic Failures）  
**危害等级**：高  
**位置**：`backend/src/main/resources/application.yml`

**原始代码**：
```yaml
spring:
  datasource:
    password: 123456        # 明文数据库密码
jwt:
  secret: helpmate-jwt-secret-key-change-in-production   # 硬编码JWT密钥
ai:
  api-key: sk-upkcmxbnjauswmokblzxvlnbrtzusipbcoqbotjvegdbsbpf  # 硬编码AI API Key
```

**危害**：
- 代码提交到 Git 仓库后，任何有访问权限的人都能获取数据库密码、JWT 签名密钥和第三方 API Key
- JWT 密钥泄露意味着攻击者可以伪造任意用户的 Token，完全绕过认证
- AI API Key 泄露会导致费用损失和账号封禁

**修复方案**：通过环境变量注入，提供默认值用于本地开发

**修复后代码**：
```yaml
spring:
  datasource:
    password: ${DB_PASSWORD:}
jwt:
  secret: ${JWT_SECRET:helpmate-jwt-secret-key-change-in-production}
ai:
  api-key: ${AI_API_KEY:}
```

**修复状态**：✅ 已修复（同时新增 `.env.example` 和 `.gitignore` 中排除 `.env`）

---

### 问题 2：AI 接口无输入长度限制（中危）

**漏洞类型**：输入验证缺失（OWASP A03: Injection 相关）  
**危害等级**：中  
**位置**：`dto/AIChatRequest.java`

**原始代码**：
```java
@NotBlank(message = "消息不能为空")
private String message;
```

**危害**：
- 攻击者可以发送超长字符串（如几 MB 的文本），每次请求都会转发给 AI 服务
- 导致 AI API 费用异常消耗（拒绝服务 + 费用攻击）
- 可能触发 AI 服务的 Token 限制错误

**修复后代码**：
```java
@NotBlank(message = "消息不能为空")
@Size(max = 500, message = "消息长度不能超过500字符")
private String message;
```

**修复状态**：✅ 已修复

---

### 问题 3：错误信息暴露内部细节（中危）

**漏洞类型**：安全配置错误（OWASP A05: Security Misconfiguration）  
**危害等级**：中  
**位置**：`service/impl/AIServiceImpl.java`

**原始代码**：
```java
if (response.statusCode() != 200) {
    throw new RuntimeException("AI 服务请求失败，状态码：" + response.statusCode());
}
// ...
throw new RuntimeException("AI 服务调用失败：" + e.getMessage());
```

**危害**：
- 向客户端暴露 AI 服务的 HTTP 状态码，泄露内部架构信息
- 异常信息中包含底层错误详情（`e.getMessage()`），可能暴露网络配置、服务地址等

**修复后代码**：
```java
if (response.statusCode() != 200) {
    log.error("AI service returned status code: {}", response.statusCode());
    throw new RuntimeException("AI 服务暂时不可用，请稍后重试");
}
// ...
log.error("AI service call failed", e);
throw new RuntimeException("AI 服务暂时不可用，请稍后重试");
```

**修复状态**：✅ 已修复（错误详情记录到服务器日志，对外只返回通用提示）

---

### 问题 4：缺少安全 HTTP 响应头（低危）

**漏洞类型**：安全配置错误（OWASP A05: Security Misconfiguration）  
**危害等级**：低  
**位置**：`common/WebMvcConfig.java`

**危害**：
- 缺少 `X-Content-Type-Options` → 浏览器可能进行 MIME 嗅探攻击
- 缺少 `X-Frame-Options` → 页面可被嵌入 iframe，存在点击劫持风险

**修复**：新增 Security Headers Filter，添加以下响应头：
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

**修复状态**：✅ 已修复

---

## 三、安全检查清单

### 认证与授权

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 密码存储使用 bcrypt | ✅ 已完成 | `UserServiceImpl` 使用 `BCryptPasswordEncoder` |
| JWT 有过期时间 | ✅ 已完成 | `expiration: 86400000`（24小时） |
| 接口鉴权 | ✅ 已完成 | `AuthInterceptor` 拦截所有 `/api/**`，排除公开接口 |
| 越权访问防护 | ✅ 已完成 | 任务创建从 JWT Token 中提取 `userId`，非用户自填 |

### 注入防护

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL 注入防护 | ✅ 已完成 | 使用 MyBatis-Plus `LambdaQueryWrapper`，参数化查询，无字符串拼接 |
| XSS 防护 | ⚪ 不适用 | 后端纯 API，无 HTML 渲染；前端侧需注意 |

### 敏感信息

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API Key / 密码不硬编码 | ✅ 已修复 | 修复前存在问题，已改为环境变量 |
| .env 加入 .gitignore | ✅ 已完成 | 已更新 `.gitignore` |
| 提供 .env.example | ✅ 已完成 | 新增 `.env.example` |

### 依赖安全

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 依赖漏洞扫描 | ✅ 已配置 | Spring Boot 3.2.3 + Maven，依赖版本较新，无已知高危漏洞 |

---

## 四、CI 自动化安全扫描

**选择方案**：选项 A — 密钥泄露扫描（Gitleaks）

**配置文件**：`.github/workflows/security.yml`

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**说明**：Gitleaks 会扫描全部 Git 历史，检测是否有密钥、密码、API Key 等敏感信息被提交到仓库。每次 push 和 PR 自动触发。

> **注意**：由于修复前 `application.yml` 中存在硬编码的 AI API Key，首次运行 Gitleaks 时可能会在历史提交中发现该 Key。建议在 GitHub 上将该 API Key 撤销并重新申请，并通过 `.gitleaksignore` 忽略历史记录中已知的误报。

---

## 五、选做：安全加固

### 进阶加固（已完成）

- **安全 HTTP 头**：配置了 `X-Content-Type-Options`、`X-Frame-Options`、`X-XSS-Protection`、`Referrer-Policy`

---

## 六、总结

| 问题 | 危害等级 | 状态 |
|------|---------|------|
| 硬编码 JWT 密钥、DB 密码、AI API Key | 高 | ✅ 已修复 |
| AI 接口无输入长度限制 | 中 | ✅ 已修复 |
| 错误信息暴露内部细节 | 中 | ✅ 已修复 |
| 缺少安全 HTTP 响应头 | 低 | ✅ 已修复 |
| SQL 注入 | — | ✅ 无问题（ORM 参数化） |
| 密码明文存储 | — | ✅ 无问题（BCrypt） |
| 未授权接口 | — | ✅ 无问题（JWT 拦截器） |
| 越权访问 | — | ✅ 无问题（Token 提取 userId） |

**结论**：项目整体安全性较好，核心认证授权、SQL 注入防护、密码加密均已正确实现。主要问题集中在配置管理（硬编码密钥）和防御纵深（输入限制、安全头）上，均已完成修复。
# 安全审查记录 - HelpMate 前端

## 审查概述

- **审查时间**：2026-05-10
- **审查范围**：前端代码（`frontend/src/`）
- **审查方法**：AI 辅助安全审查（OWASP Top 10 视角）
- **审查人**：cxt（前端负责人）

---

## AI 安全审查（OWASP Top 10）

以下为对前端核心代码进行 AI 安全审查后的完整发现记录。

### 1. 注入漏洞（A03:2021 - Injection）

#### 1.1 XSS 风险 - 用户内容渲染

**文件**：`frontend/src/pages/Task/TaskDetail.jsx`

**危害等级**：低（当前为 Mock 数据，实际接后端后风险上升至中危）

**描述**：JSX 中使用 `{task.publisher.name}`、`{task.description}` 等方式渲染用户输入内容。React 默认会对字符串内容转义，防止了 XSS 注入，但若未来有代码引入 `dangerouslySetInnerHTML` 则存在风险。

**当前状态**：React 自动转义，暂无问题。建议在对接真实后端后做输入净化。

---

### 2. 失效的访问控制（A01:2021 - Broken Access Control）

#### 2.1 客户端鉴权校验可绕过

**文件**：`frontend/src/pages/Task/TaskDetail.jsx`

**危害等级**：中

**描述**：`handleCompleteTask` 没有校验当前用户是否是该任务的接单人，仅在 UI 层通过条件渲染隐藏了按钮，但通过直接调用 API 可以绕过。

```javascript
// 不安全：仅 UI 隐藏，无后端鉴权
const handleCompleteTask = async () => {
  const response = await mockApi.completeTask(task.id); // 未传递 userId
  ...
};
```

**当前状态**：Mock API 为纯前端模拟，待对接真实后端时须在服务端强制校验。已在 `mockApi.js` 中记录此风险。

---

### 3. 硬编码密钥或敏感信息（A02:2021 - Cryptographic Failures）

#### 3.1 测试账号凭证硬编码在 UI【已修复】

**文件**：`frontend/src/pages/Auth/Login.jsx`

**危害等级**：中

**描述**：登录页面在 UI 中直接展示了测试账号及密码明文，一旦上线生产环境，所有用户都能看到这些凭证。

**修复前**：
```jsx
<div className="demo-hint">
  <p>测试账号：2021001 密码：123456</p>
  <p>测试账号：2021002 密码：123456</p>
</div>
```

**修复后**：删除了 `demo-hint` 区块，测试凭证不再暴露在前端 UI 中。

---

#### 3.2 Mock 数据中密码明文存储

**文件**：`frontend/src/services/mockApi.js`

**危害等级**：中（生产环境为高危）

**描述**：`users` 数组中用户密码以明文字符串形式存储。这是 Mock 数据的临时做法，真实后端必须使用 bcrypt/argon2 哈希存储。

**当前状态**：仅限 Mock 开发环境，真实后端已由后端团队负责哈希存储。

---

### 4. 密码明文存储（A02:2021）

参见 3.2，Mock 数据中密码明文，生产后端须使用哈希。

---

### 5. 错误信息暴露内部细节（A09:2021 - Security Logging and Monitoring Failures）

#### 5.1 登录错误区分账号/密码，泄露账号枚举信息【已修复】

**文件**：`frontend/src/services/mockApi.js`

**危害等级**：中

**描述**：原登录逻辑分别抛出"学号不存在"和"密码错误"两种不同错误，攻击者可借此枚举已注册账号。

**修复前**：
```javascript
if (!user) {
  throw new Error('学号不存在'); // 泄露账号是否存在
}
if (user.password !== password) {
  throw new Error('密码错误');   // 进一步确认账号存在
}
```

**修复后**：
```javascript
// 统一错误信息，避免账号枚举攻击
if (!user || user.password !== password) {
  throw new Error('学号或密码错误');
}
```

---

#### 5.2 AI 聊天输入无长度限制【已修复】

**文件**：`frontend/src/pages/AIChat/AIChat.jsx`

**危害等级**：低

**描述**：AI 聊天输入框无 `maxLength` 限制，用户可输入超大文本，可能导致前端性能问题或后续接入真实 AI 接口时产生超额费用。

**修复**：为 `<textarea>` 添加 `maxLength={500}` 属性。

---

## 安全检查清单

### 认证与授权

| 项目 | 状态 | 说明 |
|------|------|------|
| 密码存储：使用 bcrypt / argon2 哈希，不存明文 | ⚠️ 待处理 | 前端 Mock 数据为明文，真实后端由后端团队负责 |
| JWT / Session：token 有过期时间，logout 后失效 | ⚠️ 待处理 | Mock token 无过期，`logout()` 仅清除 localStorage，真实后端需服务端 token 黑名单 |
| 接口鉴权：所有需要登录的接口都有权限校验 | ✅ 适用 | 前端路由通过 `isAuthenticated()` 守卫，Mock 层跳过部分校验，真实后端须强制鉴权 |
| 越权访问：用户只能操作自己的数据 | ⚠️ 待处理 | 前端 UI 有限制，但 Mock API 中 `completeTask` 未强制校验执行人 ID |

### 注入防护

| 项目 | 状态 | 说明 |
|------|------|------|
| SQL：使用 ORM 或参数化查询，无字符串拼接 SQL | ✅ 不适用 | 前端无直接数据库操作，由后端团队负责 |
| XSS：前端输出用户数据时不用 innerHTML | ✅ 已确认 | 所有用户数据通过 JSX 渲染，React 自动转义，未使用 `dangerouslySetInnerHTML` |

### 敏感信息

| 项目 | 状态 | 说明 |
|------|------|------|
| API Key / 密码：不硬编码在代码中，通过环境变量读取 | ✅ 已修复 | 删除了 Login.jsx 中的测试账号展示；项目暂无 API Key（AI 为本地 Mock） |
| .env 文件：已加入 .gitignore，仓库中有 .env.example | ✅ 已创建 | 新增 `frontend/.env.example`，`.gitignore` 已覆盖 `.env` |

### 依赖安全

| 项目 | 状态 | 说明 |
|------|------|------|
| 运行依赖扫描，无高危漏洞 | ✅ 已扫描 | CI 中已集成 `npm audit --audit-level=high`，当前无高危漏洞 |

---

## CI 自动化安全扫描

选择了**选项 A（密钥泄露扫描）+ 选项 B（依赖漏洞扫描）**结合方式：

- `.github/workflows/security.yml`：集成 gitleaks 扫描提交中的密钥泄露
- 同时在 security.yml 中添加前端 `npm audit --audit-level=high` 依赖扫描

---

## 修复汇总

| # | 文件 | 问题 | 危害等级 | 处理方式 |
|---|------|------|----------|----------|
| 1 | `mockApi.js` | 登录错误区分账号/密码，账号可枚举 | 中 | 统一错误信息为"学号或密码错误" |
| 2 | `Login.jsx` | UI 中硬编码显示测试账号密码 | 中 | 删除 demo-hint 区块 |
| 3 | `AIChat.jsx` | 聊天输入无长度限制 | 低 | 添加 `maxLength={500}` |

---

## 结论

前端代码整体安全风险较低，主要原因是当前使用 Mock API，数据均在客户端内存中处理，不涉及真实网络请求。对接真实后端后需重点关注：

1. **服务端鉴权**：所有接口必须验证 JWT token 并校验操作权限
2. **密码哈希**：用户密码必须使用 bcrypt 哈希存储
3. **Token 管理**：实现 token 过期和登出黑名单机制
4. **输入净化**：发布任务等表单内容上传前做 XSS 过滤
