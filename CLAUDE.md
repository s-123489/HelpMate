\# 项目规则 - HelpMate 校园跑腿/互助平台



\## 技术栈

\- 前端：React Native / 小程序

\- 后端：Spring Boot 3.x + Java 17

\- 数据库：MySQL 8.0

\- 部署：Docker Compose



\## 目录结构

backend/

├── src/main/java/com/helpmate/

│   ├── controller/   - 接口层

│   ├── service/      - 业务逻辑层

│   ├── mapper/       - MyBatis Mapper层

│   ├── entity/       - 数据库实体类

│   ├── dto/          - 数据传输对象

│   ├── vo/           - 视图对象

│   └── common/       - 公共组件

└── src/main/resources/

&#x20;   └── application.yml



\## 代码规范

\- 使用 RESTful 风格 API

\- 统一返回格式：{ code, message, data }

\- 使用 MyBatis 操作数据库

\- 异常统一用 GlobalExceptionHandler 处理

\- Controller 只做参数校验和响应封装

\- 业务逻辑写在 Service 层

\- 数据库查询写在 Mapper 层



\## 禁止事项

\- 不要在 Controller 层写业务逻辑

\- 不要直接返回 Entity，使用 VO/DTO

\- 不要硬编码配置信息，使用 application.yml

\- 不要修改数据库迁移文件

