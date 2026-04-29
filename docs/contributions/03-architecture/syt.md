# 软件架构设计贡献说明

姓名：商雨婷
学号：2312190520
日期：2026-03-18

## 我完成的工作

### 1. 架构设计

- [x] 后端架构设计（模块划分：controller/service/mapper/entity/dto/vo/common）
- [x] 数据库设计（4张核心数据表：user、task、order_info、wallet_transaction）
- [x] 系统交互流程设计（登录流程、发布/接单流程、结算流程）
- [ ] 前端架构设计（由前端成员负责）

### 2. 技术选型

- **后端框架选择**：Spring Boot 3.x，理由：生态成熟、团队熟悉 Java、与 MyBatis-Plus 配合良好
- **数据库选择**：MySQL 8.0，理由：关系型数据库满足强一致性需求，支持事务保证钱包结算原子性
- **ORM 选择**：MyBatis-Plus，理由：在 MyBatis 基础上提供 CRUD 封装，减少样板代码
- **认证方式**：JWT，理由：无状态、适合移动端，不需要服务端 Session

### 3. 环境搭建

- [x] 后端项目初始化（Spring Boot + Maven 项目结构）
- [x] 数据库连接配置（application.yml）
- [x] CLAUDE.md 编写（AI 辅助开发规则）
- [ ] 前端项目初始化（由前端成员负责）

### 4. 文档编写

- [x] `docs/architecture.md`（含 Mermaid 架构图、前后端架构、ER 图、交互流程）
- [x] `docs/database.md`（含 Mermaid ER 图、4张表设计、建表 SQL、Flyway Migration）
- [x] `CLAUDE.md`（项目规则、代码规范、禁止事项）

## PR 链接

- PR #X: （待填写）

## 遇到的问题和解决

1. 问题：MySQL 保留字冲突，`order` 不能作为表名
   解决：将订单表命名为 `order_info`，避免保留字冲突

2. 问题：钱包结算涉及多表更新，需要保证原子性
   解决：在 Service 层使用 `@Transactional` 注解包裹结算逻辑，确保事务一致性

## 心得体会

在架构设计过程中，最大的收获是理解了分层架构的重要性。将 controller/service/mapper 严格分离，使得业务逻辑集中在 Service 层，Controller 只负责参数校验和路由，让代码职责清晰、易于维护。数据库设计时思考了钱包结算的事务场景，认识到数据一致性在金融类业务中的关键性。
