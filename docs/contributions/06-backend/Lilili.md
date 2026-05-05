\# 后端开发贡献说明



姓名：Lilili

日期：2026-04-13



\## 我完成的工作



\### API 设计

\- \[x] 用户认证 API 设计（注册、登录）

\- \[x] 任务管理 API 设计（发布任务、任务列表）

\- \[x] 编写 OpenAPI 规范文档（docs/api.yaml）

\- \[x] 编写 API 使用说明（docs/api.md）



\### 后端代码协助

\- \[x] 编写 MyMetaObjectHandler.java（自动填充 createdAt/updatedAt 字段）

\- 位置：backend/src/main/java/com/helpmate/common/MyMetaObjectHandler.java

\- 说明：使用 MyBatis-Plus 的 MetaObjectHandler 实现插入/更新时自动填充时间戳，由后端同学提交至仓库



\### 测试

\- \[x] Apifox 导入 api.yaml 完成接口测试

\- \[x] 测试用例覆盖：注册、登录、发布任务、任务列表



\## PR 链接

\- PR #1: https://github.com/s-123489/HelpMate/pull/1

\- PR #4: https://github.com/s-123489/HelpMate/pull/4



\## 遇到的问题和解决

1\. 问题：Mermaid图表中文编码导致渲染失败

&#x20;  解决：改用UTF-8编码保存，关系标签改为英文

2\. 问题：MyBatis-Plus 自动填充时间戳缺少 MetaObjectHandler 实现

&#x20;  解决：编写 MyMetaObjectHandler.java 放入 common 包下

