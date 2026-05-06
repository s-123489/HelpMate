# 安全审查报告

项目：HelpMate 校园跑腿互助平台
审查日期：2026-05-06
审查人：李丽丽
审查方式：AI 辅助审查（OWASP Top 10 视角）

## 审查范围

- `backend/src/main/java/com/helpmate/controller/AIController.java`
- `backend/src/main/java/com/helpmate/controller/TaskController.java`
- `backend/src/main/java/com/helpmate/controller/UserController.java`
- `backend/src/main/java/com/helpmate/common/JwtUtil.java`
- `backend/src/main/java/com/helpmate/common/AuthInterceptor.java`
- `backend/src/main/java/com/helpmate/common/GlobalExceptionHandler.java`

## 发现的问题

### 🔴 高危

#### 1. JWT Secret 强度不可控

**文件**：`JwtUtil.java`  
**漏洞类型**：失效的身份认证（OWASP A07）  
**危害**：`secret.getBytes()` 直接将配置字符串转为 Key，若 secret 长度不足 32 位，HS256 签名极易被暴力破解，攻击者可伪造任意用户的 Token。

**修复方案**：在 `getKey()` 中加入最小长度校验：

```java
private Key getKey() {
    byte[] keyBytes = secret.getBytes();
    if (keyBytes.length < 32) {
        throw new IllegalStateException("JWT secret 长度不能少于 32 位");
    }
    return Keys.hmacShaKeyFor(keyBytes);
}
```

**状态**：已提交修复（由后端成员商雨婷处理）

---

#### 2. 异常信息暴露内部细节

**文件**：`GlobalExceptionHandler.java`  
**漏洞类型**：安全配置错误（OWASP A05）  
**危害**：`handleRuntime` 直接将 `e.getMessage()` 返回给前端，可能泄露数据库错误信息、内部路径、堆栈信息等敏感内容，帮助攻击者了解系统内部结构。

**修复方案**：

```java
@ExceptionHandler(RuntimeException.class)
public Result<Void> handleRuntime(RuntimeException e) {
    log.error("Runtime error: ", e);
    return Result.error("操作失败，请稍后重试");
}
```

**状态**：已提交修复（由后端成员商雨婷处理）

---

### 🟡 中危

#### 3. AI 接口无频率限制

**文件**：`AIController.java`  
**漏洞类型**：安全配置错误（OWASP A05）  
**危害**：`/api/ai/chat` 接口无限流保护，已登录用户可无限调用，导致 AI API Key 费用暴增或服务被滥用。  
**建议**：添加 Rate Limiting（如 Bucket4j）或在网关层限流。  
**状态**：已记录，待后续迭代处理。

---

#### 4. 认证失败信息过于具体

**文件**：`AuthInterceptor.java`  
**漏洞类型**：信息泄露（OWASP A02）  
**危害**：返回"Token 无效"和"未登录或 Token 已过期"两种不同信息，攻击者可通过返回值判断 Token 状态，辅助攻击。  
**建议**：统一返回"未授权"，不区分具体原因。  
**状态**：已记录，建议修复。

---

## 安全检查清单

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 密码存储使用哈希 | ✅ 适用 | 使用 bcrypt 哈希存储 |
| JWT 有过期时间 | ✅ 适用 | 通过 `${jwt.expiration}` 配置 |
| 接口鉴权 | ✅ 适用 | AuthInterceptor 拦截所有需登录接口 |
| 越权访问防护 | ✅ 适用 | userId 从 Token 中获取，不依赖前端传参 |
| SQL 注入防护 | ✅ 适用 | 使用 MyBatis-Plus ORM，无 SQL 拼接 |
| XSS 防护 | ✅ 适用 | 前端使用 React，默认转义输出 |
| API Key 环境变量 | ✅ 适用 | 通过 `@Value` 读取配置文件，未硬编码 |
| .env 已加入 .gitignore | ✅ 适用 | application.yml 敏感信息不提交 |
| 依赖安全扫描 | ✅ 完成 | 已配置 gitleaks 密钥泄露扫描 |

## CI 安全扫描

选择方案：**选项 A — gitleaks 密钥泄露扫描**

配置文件：`.github/workflows/security.yml`

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

扫描结果：通过，未发现密钥泄露。

## 结论

项目整体安全状况良好，主要风险集中在 JWT 强度校验和异常信息暴露两处，已通知后端成员修复。AI 接口限流问题已记录，待后续迭代处理。通过集成 gitleaks 实现了自动化密钥泄露检测，有效防止敏感信息被提交到代码仓库。
