# 后端模块说明

## 模块功能

HelpMate 后端负责提供核心业务逻辑与数据服务，主要包括：

- 用户注册、登录与身份验证
- 帮助请求的发布、查询与管理
- 用户信息管理
- 前后端数据交互（RESTful API）

## 技术选型

| 技术 | 说明 |
|------|------|
| Spring Boot 3.x | 后端框架 |
| MySQL 8.0 | 关系型数据库 |
| MyBatis-Plus | ORM 框架 |
| JWT | 用户身份验证 |
| Maven | 项目构建工具 |

## 目录结构

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/helpmate/
│       │       ├── controller/   # 控制层
│       │       ├── service/      # 业务层
│       │       ├── mapper/       # 数据访问层
│       │       └── entity/       # 实体类
│       └── resources/
│           └── application.yml   # 配置文件
└── pom.xml
```

## 运行方式

1. 安装依赖环境：JDK 17+、MySQL 8.0
2. 导入数据库脚本
3. 修改 `application.yml` 中的数据库连接配置
4. 执行启动命令：

```bash
mvn spring-boot:run
```

服务默认运行在 `http://localhost:8080`
