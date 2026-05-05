\# AI 功能集成贡献说明



姓名：Lilili

日期：2026-04-21



\## 我完成的工作



\### 1. AI 功能

\- 功能类型：智能问答（用户咨询平台使用方式）

\- 使用模型：DeepSeek



\### 2. 实现内容

\- \[x] 更新 OpenAPI 规范文档，新增 /api/ai/chat 接口

\- \[x] 编写 AI 功能说明文档（docs/ai-feature.md）

\- \[x] 协助编写 AIChatRequest DTO 类



\### 3. 接口设计

\- 路径：POST /api/ai/chat

\- 无需登录即可访问（已在 WebMvcConfig 中排除拦截）

\- 统一返回格式：{ code, message, data }



\## PR 链接

\- PR #1: https://github.com/s-123489/HelpMate/pull/1

\- PR #4: https://github.com/s-123489/HelpMate/pull/4



\## 遇到的问题和解决

1\. 问题：AI接口需要对所有用户开放，但其他接口需要登录验证

&#x20;  解决：在 WebMvcConfig 的拦截器中将 /api/ai/chat 加入白名单



\## 心得体会

通过本次AI功能集成，了解了LLM API的调用流程和接口设计方式，

掌握了如何将AI能力封装为标准RESTful接口供前端调用，

同时理解了API Key安全管理的重要性。

