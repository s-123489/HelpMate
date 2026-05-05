# 软件测试贡献说明

姓名：syt　角色：后端　日期：2026-04-22

## 完成的测试工作

### 测试文件

- `backend/src/test/java/com/helpmate/service/UserServiceTest.java`
- `backend/src/test/java/com/helpmate/service/TaskServiceTest.java`
- `backend/src/test/java/com/helpmate/controller/UserControllerTest.java`
- `backend/src/test/java/com/helpmate/controller/TaskControllerTest.java`

### 测试清单

**单元测试（UserServiceTest — 8个）**
- [x] 正常注册成功
- [x] 重复用户名抛出异常
- [x] 注册时密码被 BCrypt 加密（不存明文）
- [x] 注册时余额默认为 0、状态默认为 1
- [x] 登录成功返回 token 和用户名
- [x] 用户不存在时抛出异常
- [x] 密码错误时抛出异常
- [x] 登录时使用正确的 userId 调用 generateToken

**单元测试（TaskServiceTest — 8个）**
- [x] 创建任务成功，返回正确 ID
- [x] 创建任务时 publisherId 和初始 status=0 正确设置
- [x] 创建任务时请求字段全部映射到实体
- [x] listTasks 无 category 参数时返回全部待接单任务
- [x] listTasks 指定 category 时返回筛选结果
- [x] listTasks 无数据时返回空列表
- [x] listTasks 分页参数正确传递给 Mapper
- [x] Mock 隔离数据库（TaskMapper、UserMapper）

**API 接口测试（UserControllerTest — 7个）**
- [x] 正常注册返回 code=200
- [x] 缺少用户名返回 code=400（参数校验）
- [x] 密码少于6位返回 code=400
- [x] 重复用户名返回 code=500（业务异常）
- [x] 正常登录返回 token 和 username
- [x] 密码错误返回 code=500
- [x] 缺少用户名字段返回 code=400

**API 接口测试（TaskControllerTest — 7个）**
- [x] 携带合法 Token 发布任务返回 code=200 和任务 ID
- [x] 标题为空返回 code=400
- [x] 分类为空返回 code=400
- [x] 悬赏金额不足 0.01 返回 code=400
- [x] 无筛选条件查询列表返回分页数据
- [x] 指定 category 查询返回筛选结果
- [x] 无数据时返回空 records

### 覆盖率

- 核心模块（UserService、TaskService、UserController、TaskController）覆盖率目标：> 60%
- 通过 JaCoCo Maven 插件生成报告：`mvn test`，报告位于 `target/site/jacoco/index.html`

### AI 辅助

- 使用工具：Claude Code
- 主要用途：根据已有 Service / Controller 代码自动生成测试用例框架，人工审查并补充边界场景
- AI 生成 + 人工修改的测试数量：30 个

## PR 链接

- PR #：（提交后填写）

## 遇到的问题和解决

1. 问题：`@WebMvcTest` 会加载 `AuthInterceptor`，导致接口测试被拦截器拦截 → 解决：使用 `requestAttr("userId", 1L)` 直接注入拦截器写入的属性，同时 `@MockBean JwtUtil` 满足依赖注入
2. 问题：`UserServiceImpl` 内部 `new BCryptPasswordEncoder()` 无法被 Mock → 解决：在测试中直接断言存储的 hash 以 `$2a$` 开头，验证加密行为

## 心得体会

通过 Mockito 隔离数据库和外部依赖，使单元测试运行速度极快且结果稳定。`@WebMvcTest` 配合 `MockMvc` 可以在不启动完整 Spring 容器的情况下验证接口行为，包括参数校验和全局异常处理，覆盖了正常、边界和异常三类场景。
