# HelpMate — 校园跑腿 / 互助平台

> 业务逻辑完整，贴近校园生活。技术栈：React Native / 小程序 + Spring Boot。
> 创新点：实时位置 + 订单状态机 + 钱包支付的组合。

[![CI](https://github.com/s-123489/HelpMate/actions/workflows/ci.yml/badge.svg)](https://github.com/s-123489/HelpMate/actions/workflows/ci.yml)

## 项目简介

HelpMate 是一款面向在校学生的跑腿与互助平台，支持发布取快递、送餐、代购、互助等任务，
接单者可实时导航完成任务并通过平台钱包结算报酬。

## 文档

- [架构设计文档](docs/architecture.md)
- [数据库设计文档](docs/database.md)
- [后端模块说明](docs/backend.md)
- [API 设计文档](docs/api.md)
- [UI 设计说明](docs/design-spec.md)

## UI 设计稿（Figma）

> https://www.figma.com/design/dxKa3GWXKRiBquoFIdwZpl/HelpMate-UI-Design?node-id=0-1&t=782aFOJOayYth2nb-1
https://www.figma.com/design/vQljiMMNtFoVaTcWdP6g97/Helpmate-ui-design-2?node-id=0-1&t=CJMKPjgoQSb9uAtl-1

## 目录结构

```
backed/                               # 项目仓库根目录
├── CLAUDE.md                         # AI 辅助开发规则
├── README.md                         # 本文件
├── backend/                          # Spring Boot 后端项目
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/helpmate/
│       │   ├── HelpMateApplication.java
│       │   ├── controller/           # 控制层
│       │   ├── service/              # 业务层
│       │   ├── mapper/               # 数据访问层
│       │   ├── entity/               # 实体类
│       │   ├── dto/                  # 请求对象
│       │   ├── vo/                   # 返回视图对象
│       │   └── common/               # JWT、统一返回、拦截器
│       └── resources/
│           ├── application.yml
│           └── db/migration/         # Flyway Migration SQL
└── docs/
    ├── architecture.md               # 架构设计文档（含 Mermaid 图）
    ├── database.md                   # 数据库设计文档（含 ER 图 + SQL）
    ├── backend.md                    # 后端模块说明
    ├── api.md                        # API 设计文档
    ├── design-spec.md                # UI 设计说明
    ├── design/                       # 设计稿截图
    └── contributions/
        ├── 02-ui/                    # hw2 UI 作业贡献
        │   └── syt.md
        └── 03-architecture/          # hw3 架构作业贡献
            └── XXX.md
```

## 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | React Native / 微信小程序 | 跨平台，覆盖校园微信生态 |
| 后端 | Spring Boot 3.x | 生态成熟，团队熟悉 Java |
| 数据库 | MySQL 8.0 | 关系型，满足事务一致性需求 |
| ORM | MyBatis-Plus | CRUD 封装，减少样板代码 |
| 认证 | JWT | 无状态，适合移动端 |
| 构建 | Maven | 标准 Java 构建工具 |
| 部署 | Docker Compose | 本地/生产环境一致性 |

## 团队分工表

| 成员 | 负责模块 | hw3 贡献 |
|------|---------|---------|
| 商雨婷 | 后端开发 | 架构设计、数据库设计、Spring Boot 项目初始化、CLAUDE.md |
| 陈晓彤 | 前端开发 | 前端架构设计、前端项目初始化 |
| 李丽丽 | API 设计 | API 接口设计文档、接口规范制定 |

## 快速启动

### 后端

```bash
# 1. 确保已安装 JDK 17+ 和 MySQL 8.0
# 2. 创建数据库
mysql -u root -p -e "CREATE DATABASE helpmate DEFAULT CHARACTER SET utf8mb4;"

# 3. 修改 backend/src/main/resources/application.yml 中的数据库密码

# 4. 启动（Flyway 会自动执行 Migration）
cd backend
mvn spring-boot:run
```

服务启动后访问：`http://localhost:8080`
