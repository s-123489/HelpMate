<<<<<<< HEAD
# HelpMate — 校园跑腿 / 互助平台

> 业务逻辑完整，贴近校园生活。技术栈：React / Vite + Spring Boot。  
> 创新点：实时位置 + 订单状态机 + 钱包支付的组合。

[![CI](https://github.com/s-123489/HelpMate/actions/workflows/ci.yml/badge.svg)](https://github.com/s-123489/HelpMate/actions)
[![Backend Coverage](https://codecov.io/gh/s-123489/HelpMate/branch/main/graph/badge.svg?flag=backend)](https://codecov.io/gh/s-123489/HelpMate)
[![Frontend Coverage](https://codecov.io/gh/s-123489/HelpMate/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/s-123489/HelpMate)

---

## 项目简介

HelpMate 是一款面向在校学生的跑腿与互助平台，支持发布取快递、送餐、代购、互助等任务，
接单者可实时导航完成任务并通过平台钱包结算报酬。

## 功能特性

- 用户注册与登录（JWT 认证）
- 任务发布、浏览与接单
- 实时位置导航与任务状态机
- 平台钱包支付与结算
- 用户评价系统
- 消息通知

## 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | React 18 + Vite | 组件化开发，构建速度快 |
| 前端测试 | Vitest + React Testing Library | 与 Vite 生态一致 |
| 后端 | Spring Boot 3.x | 生态成熟，团队熟悉 Java |
| 数据库 | MySQL 8.0 | 关系型，满足事务一致性需求 |
| ORM | MyBatis-Plus | CRUD 封装，减少样板代码 |
| 认证 | JWT | 无状态，适合移动端 |
| 构建 | Maven | 标准 Java 构建工具 |
| 部署 | Docker Compose | 本地/生产环境一致性 |

## 文档

- [架构设计文档](docs/architecture.md)
- [数据库设计文档](docs/database.md)
- [后端模块说明](docs/backend.md)
- [API 设计文档](docs/api.md)
- [UI 设计说明](docs/design-spec.md)

## UI 设计稿（Figma）

- https://www.figma.com/design/dxKa3GWXKRiBquoFIdwZpl/HelpMate-UI-Design?node-id=0-1&t=782aFOJOayYth2nb-1
- https://www.figma.com/design/vQljiMMNtFoVaTcWdP6g97/Helpmate-ui-design-2?node-id=0-1&t=CJMKPjgoQSb9uAtl-1

## 目录结构

```
HelpMate/                             # 项目仓库根目录
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI 工作流（后端 + 前端并行）
├── CLAUDE.md                         # AI 辅助开发规则
├── README.md                         # 本文件
├── backend/                          # Spring Boot 后端项目
│   ├── pom.xml
│   ├── tests/                        # 后端测试
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
├── frontend/                         # React 前端项目
│   ├── package.json
│   └── src/
│       └── __tests__/                # 前端测试
└── docs/
    ├── architecture.md
    ├── database.md
    ├── backend.md
    ├── api.md
    ├── design-spec.md
    ├── design/                       # 设计稿截图
    └── contributions/
        ├── 02-ui/
        ├── 03-architecture/
        └── 09-cicd/                  # 本次 CI/CD 作业贡献
```

## 团队分工

| 成员 | 负责模块 |
|------|---------|
| 商雨婷 | 后端开发（架构设计、数据库设计、Spring Boot 项目初始化）、CI/CD 配置 |
| 陈晓彤 | 前端开发（前端架构设计、前端项目初始化）、CI/CD 配置 |
| 李丽丽 | API 设计（接口设计文档、CI/CD 配置与 README） |

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

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 测试

### 后端测试

```bash
cd backend
pip install -r requirements.txt pytest coverage ruff
coverage run -m pytest tests/
coverage report
```

### 前端测试

```bash
cd frontend
npm run lint       # ESLint 检查，零警告
npm test           # 全部测试 + 覆盖率报告
```

## 测试覆盖率目标

| 端 | 目标 |
|----|------|
| 后端 | 核心业务覆盖率 > 60% |
| 前端 | 核心组件覆盖率 > 50%，8+ 组件测试，4+ Mock API 测试 |

## License

MIT

