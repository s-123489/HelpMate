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
