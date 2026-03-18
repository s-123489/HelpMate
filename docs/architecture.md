# 软件架构设计文档 — HelpMate

## 1. 系统概述

HelpMate 是面向在校学生的跑腿与互助平台。用户可以发布取快递、送餐、代购、互助等任务，接单者完成任务后通过平台钱包结算报酬。

## 2. 技术选型

| 层级 | 选择 | 理由 |
|------|------|------|
| 前端框架 | React Native + 微信小程序 | 跨平台覆盖 iOS/Android/微信生态；校园用户微信使用率高，小程序无需下载，降低使用门槛 |
| 后端框架 | Spring Boot 3.x | 生态成熟、开箱即用、与 MyBatis-Plus 配合良好；团队熟悉 Java 技术栈 |
| 数据库 | MySQL 8.0 | 关系型数据库满足业务强一致性需求；支持 JSON 字段、窗口函数等现代特性 |
| 部署方式 | Docker Compose | 本地/生产环境一致性；一键启动所有服务（后端 + MySQL）；便于团队协作 |

## 3. 系统架构图

```mermaid
graph TB
    subgraph 客户端
        A1[微信小程序]
        A2[React Native APP]
    end

    subgraph 后端服务 Spring Boot
        B1[Controller 层\n路由 & 参数校验]
        B2[Service 层\n业务逻辑]
        B3[Mapper 层\nMyBatis-Plus]
        B4[Common\nJWT鉴权 & 统一异常]
    end

    subgraph 数据层
        C1[(MySQL 8.0)]
    end

    A1 -->|HTTPS/JSON| B1
    A2 -->|HTTPS/JSON| B1
    B1 --> B4
    B1 --> B2
    B2 --> B3
    B3 --> C1
```

## 4. 前端架构（页面/组件结构）

```mermaid
graph TD
    App[App 入口]
    App --> Auth[认证模块]
    App --> Main[主导航 TabBar]

    Auth --> Login[登录页]
    Auth --> Register[注册页]

    Main --> Home[首页\n任务大厅]
    Main --> Publish[发布任务]
    Main --> Orders[我的订单]
    Main --> Profile[个人中心]

    Home --> TaskList[任务列表组件]
    Home --> TaskFilter[筛选/搜索组件]
    Home --> TaskCard[任务卡片组件]

    Publish --> TaskForm[任务表单]
    Publish --> LocationPicker[位置选择器]

    Orders --> OrderCard[订单卡片]
    Orders --> OrderStatus[状态流转显示]

    Profile --> WalletPanel[钱包面板]
    Profile --> UserInfo[用户信息编辑]

    subgraph 公共组件
        Loading[加载状态]
        Toast[消息提示]
        Modal[弹窗]
    end
```

## 5. 后端架构（服务/模块划分）

```mermaid
graph LR
    subgraph controller
        UC[UserController]
        TC[TaskController]
        OC[OrderController]
        WC[WalletController]
    end

    subgraph service
        US[UserService]
        TS[TaskService]
        OS[OrderService]
        WS[WalletService]
    end

    subgraph mapper
        UM[UserMapper]
        TM[TaskMapper]
        OM[OrderMapper]
        WM[WalletTransactionMapper]
    end

    subgraph common
        JWT[JwtUtil]
        RES[Result 统一返回]
        EX[GlobalExceptionHandler]
        AUTH[AuthInterceptor]
    end

    UC --> US --> UM
    TC --> TS --> TM
    OC --> OS --> OM
    WC --> WS --> WM

    OS --> WS
    AUTH --> JWT
```

### 模块说明

| 模块 | 说明 |
|------|------|
| `user` | 用户注册、登录、信息管理、JWT 签发 |
| `task` | 任务发布、查询、状态管理（待接单/进行中/已完成/已取消） |
| `order` | 接单、取消、完成确认、订单状态机 |
| `wallet` | 余额查询、充值、提现、结算流水记录 |
| `common` | 统一返回体 `Result<T>`、JWT 工具、全局异常处理、登录拦截器 |

## 6. 数据库设计（ER 图）

> 详细设计见 [database.md](./database.md)

```mermaid
erDiagram
    USER {
        bigint id PK
        varchar username
        varchar password_hash
        varchar phone
        varchar email
        decimal balance
        datetime created_at
    }

    TASK {
        bigint id PK
        bigint publisher_id FK
        varchar title
        text description
        varchar category
        decimal reward
        tinyint status
        varchar location
        datetime created_at
    }

    ORDER {
        bigint id PK
        bigint task_id FK
        bigint helper_id FK
        tinyint status
        datetime created_at
        datetime completed_at
    }

    WALLET_TRANSACTION {
        bigint id PK
        bigint user_id FK
        decimal amount
        tinyint type
        bigint related_order_id FK
        varchar description
        datetime created_at
    }

    USER ||--o{ TASK : "发布"
    USER ||--o{ ORDER : "接单"
    TASK ||--o| ORDER : "对应"
    ORDER ||--o{ WALLET_TRANSACTION : "触发"
    USER ||--o{ WALLET_TRANSACTION : "拥有"
```

## 7. 系统交互流程

### 7.1 用户登录流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant API as Spring Boot API
    participant DB as MySQL

    C->>API: POST /api/user/login {username, password}
    API->>DB: SELECT * FROM user WHERE username=?
    DB-->>API: 用户记录
    API->>API: BCrypt.verify(password, passwordHash)
    alt 验证通过
        API->>API: 生成 JWT Token
        API-->>C: 200 { token }
    else 验证失败
        API-->>C: 401 用户名或密码错误
    end
```

### 7.2 发布任务 & 接单流程

```mermaid
sequenceDiagram
    participant P as 发布者
    participant API as Spring Boot API
    participant H as 接单者
    participant DB as MySQL

    P->>API: POST /api/task/create (携带 JWT)
    API->>DB: INSERT INTO task (status=PENDING)
    API-->>P: 200 { taskId }

    H->>API: GET /api/task/list
    API->>DB: SELECT * FROM task WHERE status=PENDING
    API-->>H: 任务列表

    H->>API: POST /api/order/accept {taskId} (携带 JWT)
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT INTO order
    API->>DB: UPDATE task SET status=IN_PROGRESS
    API->>DB: COMMIT
    API-->>H: 200 { orderId }
```

### 7.3 完成任务 & 钱包结算流程

```mermaid
sequenceDiagram
    participant H as 接单者
    participant API as Spring Boot API
    participant DB as MySQL
    participant P as 发布者

    H->>API: POST /api/order/complete {orderId}
    P->>API: POST /api/order/confirm {orderId}
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE order SET status=COMPLETED
    API->>DB: UPDATE task SET status=COMPLETED
    API->>DB: UPDATE user SET balance=balance-reward WHERE id=publisherId
    API->>DB: UPDATE user SET balance=balance+reward WHERE id=helperId
    API->>DB: INSERT INTO wallet_transaction (×2)
    API->>DB: COMMIT
    API-->>P: 200 结算完成
    API-->>H: 200 结算完成
```
