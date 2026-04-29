# AI 功能集成贡献说明

姓名：商雨婷
学号：2312190520
日期：2026-04-20

## 我完成的工作

### 1. AI 功能
- 功能类型：智能客服
- 使用模型：DeepSeek Chat（`deepseek-chat`）

### 2. 实现细节
- [x] 后端 API（`POST /api/ai/chat`）
- [x] 调用 DeepSeek API，使用 Java 内置 HttpClient
- [x] 系统 Prompt 设定为平台客服角色
- [x] API Key 通过环境变量管理，未提交到仓库
- [x] 统一错误处理，异常由 GlobalExceptionHandler 捕获返回

## PR 链接
无（本次直接提交到分支）

## 心得体会
本次作业完成了 AI 功能与后端 Spring Boot 的集成。通过调用 DeepSeek API，掌握了大语言模型接口的调用方式（OpenAI 兼容协议），理解了 API Key 的安全管理（环境变量）、流式与非流式响应的区别，以及如何将 AI 能力封装成标准的 REST 接口供前端调用。
