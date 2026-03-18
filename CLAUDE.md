# 项目规则 — HelpMate 校园跑腿互助平台

## 项目概述

HelpMate 是面向在校学生的跑腿与互助平台，支持发布任务、接单、实时导航与钱包结算。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | React Native / 微信小程序 | - |
| 后端 | Spring Boot | 3.x |
| 数据库 | MySQL | 8.0 |
| ORM | MyBatis-Plus | 3.5.x |
| 认证 | JWT | - |
| 构建 | Maven | 3.8+ |
| 部署 | Docker Compose | - |

## 目录结构

```
backed/                         # 项目根目录
├── CLAUDE.md                   # AI 辅助开发规则（本文件）
├── README.md                   # 项目说明
├── backend/                    # Spring Boot 后端项目
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/helpmate/
│       │   ├── controller/     # 控制层（HTTP 接口）
│       │   ├── service/        # 业务逻辑层
│       │   ├── mapper/         # 数据访问层（MyBatis-Plus）
│       │   ├── entity/         # 实体类（对应数据库表）
│       │   ├── dto/            # 数据传输对象
│       │   ├── vo/             # 视图对象（返回给前端）
│       │   └── common/         # 公共组件（Result、异常处理等）
│       └── resources/
│           ├── application.yml
│           └── mapper/         # MyBatis XML 映射文件
└── docs/
    ├── architecture.md         # 架构设计文档
    ├── database.md             # 数据库设计文档
    ├── api.md                  # API 设计文档
    └── contributions/          # 个人贡献说明
```

## 后端代码规范

### 包命名
- 根包：`com.helpmate`
- 严格按照 `controller` / `service` / `mapper` / `entity` / `dto` / `vo` / `common` 分层

### 接口规范
- 所有接口统一返回 `Result<T>` 包装对象：
  ```json
  { "code": 200, "message": "success", "data": {...} }
  ```
- RESTful 风格命名，使用标准 HTTP 方法（GET/POST/PUT/DELETE）
- URL 路径全小写，单词用 `-` 分隔

### 实体类规范
- 使用 `@TableName`、`@TableId`、`@TableField` 注解
- 主键统一使用 `Long id`，自增策略
- 时间字段统一使用 `LocalDateTime`，字段名 `createdAt` / `updatedAt`
- 使用 Lombok（`@Data`、`@Builder` 等）减少样板代码

### 安全规范
- 密码必须使用 BCrypt 加密存储，禁止明文
- 所有需要登录的接口必须校验 JWT Token
- 禁止在日志中输出密码、Token 等敏感信息

### 禁止事项
- 禁止在 Controller 层写业务逻辑，业务放 Service
- 禁止直接返回 Entity 给前端，使用 VO 包装
- 禁止使用 `SELECT *`，必须指定字段
- 禁止硬编码数据库连接信息，配置放 `application.yml`
- 禁止修改 `pom.xml` 中的 Spring Boot 版本（除非明确要求）

## 数据库规范

- 表名全小写，单词用 `_` 分隔（如 `wallet_transaction`）
- 每张表必须有 `id`、`created_at`、`updated_at` 字段
- 枚举状态值使用 `TINYINT`，并在注释中说明各值含义
- 所有外键逻辑在应用层维护，数据库不建物理外键

## Git 提交规范

```
feat: 新增功能
fix: 修复 Bug
docs: 文档变更
refactor: 代码重构
test: 测试相关
chore: 构建/工具变更
```

示例：`feat: 新增任务接单接口`
