# AI 功能说明

## 功能类型
智能客服 — 基于大语言模型的平台问答助手

## 使用模型
DeepSeek Chat（`deepseek-chat`），通过 DeepSeek API 调用，与 OpenAI 接口兼容。

## 实现的功能
用户可以向平台客服提问（如"怎么发布任务"、"如何接单"、"钱包怎么充值"），后端调用 DeepSeek API 生成回答并返回给前端。

## API 接口

### POST /api/ai/chat

**请求体：**
```json
{
  "message": "怎么发布任务？"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": "您好！发布任务非常简单：点击首页的「发布任务」按钮，填写任务标题、描述、赏金金额和地点，即可发布。其他同学会在任务列表看到并接单。"
}
```

**认证：** 无需登录即可使用。

## 环境变量配置

```bash
# 在系统环境变量或启动命令中设置（不要写入代码或 git）
export AI_API_KEY=your_deepseek_api_key_here
```

获取 API Key：[https://platform.deepseek.com](https://platform.deepseek.com)

## 代码位置

| 文件 | 说明 |
|------|------|
| `controller/AIController.java` | 接收请求，调用 service |
| `service/AIService.java` | 接口定义 |
| `service/impl/AIServiceImpl.java` | 调用 DeepSeek API，解析响应 |
| `dto/AIChatRequest.java` | 请求体 DTO |
