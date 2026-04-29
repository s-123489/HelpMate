# API 设计贡献说明

姓名：商雨婷
学号：2312190520
日期：2026-03-31

## 我完成的工作

### 1. API 接口设计与实现

- [x] 用户模块接口（`POST /api/user/register`、`POST /api/user/login`）
- [x] 任务模块接口（`POST /api/task/create`、`GET /api/task/list`）
- [x] 统一返回结构 `Result<T>`（code / message / data）
- [x] JWT 鉴权拦截器（`AuthInterceptor`），需要登录的接口自动校验 Token

### 2. 数据传输对象（DTO / VO）

- [x] `RegisterRequest`：用户名（2-50位）、密码（≥6位）、邮箱、手机号，含参数校验注解
- [x] `LoginRequest`：用户名 + 密码
- [x] `CreateTaskRequest`：标题、描述、分类、悬赏金额（≥0.01）、地点、截止时间，含参数校验注解
- [x] `LoginVO`：登录成功后返回 token + username

### 3. API 文档编写

- [x] `docs/api.md`：覆盖全部已实现接口，包含请求/响应示例、鉴权说明、错误码说明

## 接口设计决策

| 决策 | 理由 |
|------|------|
| 统一用 `Result<T>` 包装所有响应 | 前端统一判断 `code` 字段，不用处理 HTTP 状态码差异 |
| JWT 无状态鉴权 | 移动端无 Session，JWT 不依赖服务端存储，适合跨平台 |
| DTO 与 Entity 分离 | 避免暴露数据库字段（如 `password_hash`），接口与数据库解耦 |
| 任务列表支持 `category` 过滤参数 | 前端首页需要按分类筛选任务，在接口层统一处理 |

## 遇到的问题和解决

1. 问题：Spring Boot 3.x 不再支持 `javax.validation`，注解报错
   解决：改用 `jakarta.validation.constraints.*`，对应依赖改为 `spring-boot-starter-validation`

2. 问题：MyBatis-Plus 分页插件需要额外注册，否则 `Page<T>` 不生效
   解决：在 `common` 包下注册 `MybatisPlusInterceptor` 并添加 `PaginationInnerInterceptor`

## 心得体会

API 设计阶段最深的体会是 DTO 与 Entity 分离的价值。最初想直接用 Entity 接收请求参数，但 Entity 里有 `passwordHash`、`balance` 等字段不应由客户端传入，若不分离很容易引发安全漏洞（如客户端伪造余额）。单独设计 DTO 后，字段职责清晰，校验注解也只加在真正需要校验的入参上，减少了多余的约束。
