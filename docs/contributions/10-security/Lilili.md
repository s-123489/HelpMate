# 安全审查贡献说明

姓名：李丽丽　日期：2026-05-06

## 我完成的工作

### AI 安全审查

- 审查了哪些文件/模块：AIController、TaskController、UserController、JwtUtil、AuthInterceptor、GlobalExceptionHandler
- AI 发现的主要问题：
  1. JWT Secret 长度不可控，存在被暴力破解风险（高危）
  2. GlobalExceptionHandler 直接暴露异常信息给前端（高危）
  3. AI 接口无频率限制，存在滥用风险（中危）
  4. 认证失败返回信息过于具体，存在信息泄露风险（中危）
- 我修复了哪些问题：已将审查结果同步给后端成员商雨婷，由其负责代码修复

### 安全检查清单

- [x] 密码存储：使用 bcrypt 哈希，不存明文
- [x] JWT / Session：token 有过期时间，通过配置文件控制
- [x] 接口鉴权：AuthInterceptor 拦截所有需登录接口
- [x] 越权访问：userId 从 Token 中获取，不依赖前端传参
- [x] SQL 注入：使用 MyBatis-Plus ORM，无 SQL 拼接
- [x] XSS：前端使用 React，默认转义输出
- [x] API Key：通过 `@Value` 读取配置，未硬编码
- [x] .gitignore：敏感配置文件不提交仓库
- [x] 依赖安全扫描：已配置 gitleaks CI 扫描

### CI 安全扫描

- 配置了哪个选项：选项 A — gitleaks 密钥泄露扫描
- 配置文件：`.github/workflows/security.yml`
- 扫描结果：通过，未发现密钥泄露


## CI 运行链接

- https://github.com/s-123489/HelpMate/actions

## 遇到的问题和解决

1. 问题：gitleaks-action 需要 GITHUB_TOKEN 才能正常运行 → 解决：在 env 中添加 `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`

## 心得体会

在 Vibe Coding 场景下，AI 能快速扫描代码中的安全隐患，大幅提升审查效率。但 AI 的建议需要结合实际业务场景判断，不能盲目照搬修复方案。安全开发应该从设计阶段就纳入考虑，而不是开发完成后再做修补。
