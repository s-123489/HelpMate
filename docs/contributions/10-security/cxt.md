# 安全审查贡献说明

姓名：cxt
日期：2026-05-10

## 我完成的工作

### AI 安全审查

- 审查了哪些文件/模块：
  - `frontend/src/services/mockApi.js`（认证逻辑、数据处理）
  - `frontend/src/pages/Auth/Login.jsx`（登录界面）
  - `frontend/src/pages/Task/TaskDetail.jsx`（任务详情、接单操作）
  - `frontend/src/pages/AIChat/AIChat.jsx`（AI 聊天输入）

- AI 发现的主要问题：
  1. **账号枚举漏洞**（中危）：登录错误分别提示"学号不存在"和"密码错误"，可被枚举账号
  2. **硬编码测试凭证**（中危）：Login.jsx 在 UI 中明文展示测试账号和密码
  3. **AI 输入无长度限制**（低危）：聊天框无 maxLength，可输入任意长度文本
  4. **客户端越权风险**（中危）：completeTask 未在 Mock 层校验执行人身份，仅靠 UI 隐藏
  5. **密码明文存储**（中危，Mock 环境）：mockApi.js 用户数据密码为明文字符串

- 我修复了哪些问题：
  1. 修复账号枚举漏洞：统一登录错误信息为"学号或密码错误"
  2. 删除 Login.jsx 中 demo-hint 区块，移除硬编码测试账号展示
  3. 为 AIChat.jsx 输入框添加 `maxLength={500}` 限制

### 安全检查清单

#### 认证与授权
- ⚠️ **密码存储**：Mock 环境为明文，真实后端须用 bcrypt/argon2 哈希（后端团队负责）
- ⚠️ **JWT / Session**：Mock token 无过期，`logout()` 仅清除本地存储；真实后端须实现 token 黑名单
- ✅ **接口鉴权**：前端路由有 `isAuthenticated()` 守卫，未登录自动跳转
- ⚠️ **越权访问**：前端 UI 有限制，Mock 层 `completeTask` 未强制校验操作人，真实后端须在服务端校验

#### 注入防护
- ✅ **SQL**：前端无数据库操作，不适用
- ✅ **XSS**：使用 JSX 渲染用户数据，React 自动转义，未使用 `dangerouslySetInnerHTML`

#### 敏感信息
- ✅ **API Key / 密码**：已删除硬编码测试账号展示；项目暂无外部 API Key
- ✅ **.env 文件**：已创建 `frontend/.env.example`，`.gitignore` 已排除 `.env`

#### 依赖安全
- ✅ **依赖扫描**：CI 中集成 `npm audit --audit-level=high`，当前无高危漏洞

### CI 安全扫描

- 配置了选项：**A（gitleaks 密钥泄露扫描）+ B（npm audit 依赖漏洞扫描）**
- 扫描结果：workflow 文件已创建（`.github/workflows/security.yml`），推送到 GitHub 后将自动运行

### 选做完成情况

- 无

## PR 链接

- 待提交 PR 后补充

## 遇到的问题和解决

1. 问题：前端使用 Mock API，无法体现真实的后端安全漏洞（如 SQL 注入）
   解决：针对前端层面的安全问题（账号枚举、信息泄露、输入限制）进行修复，并在文档中标注真实后端需关注的事项

2. 问题：部分安全风险（密码哈希、token 黑名单）属于后端职责
   解决：在安全审查文档中标注"待后端处理"，前端做力所能及的防护

## 心得体会

在 Vibe Coding 场景下，AI 辅助能快速扫描出代码中不易察觉的安全模式问题，比如账号枚举这类逻辑漏洞，纯靠人工 review 容易忽视。平衡开发效率和安全的关键在于把安全检查嵌入工作流——在 CI 中自动运行 gitleaks 和 npm audit，让安全扫描变成开发流程的一部分，而不是事后补课。前端侧要特别注意：不要在 UI 中暴露任何测试凭证，所有敏感 Key 通过环境变量注入，渲染用户数据时避免 `dangerouslySetInnerHTML`。
