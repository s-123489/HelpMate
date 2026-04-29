# HelpMate API 使用说明

## 1. 项目概述

HelpMate 是一个校园跑腿/互助平台，核心功能包括：发布任务、接单、实时位置、评价系统、钱包支付。

## 2. 技术选型

- **框架**：Spring Boot
- **接口风格**：RESTful
- **实时通信**：WebSocket
- **数据格式**：JSON
- **第三方支付**：微信支付 / 支付宝 API

## 3. API 基础信息

### 3.1 基础 URL

```
http://localhost:8080/api
```

### 3.2 认证方式

本 API 使用 JWT (JSON Web Token) 进行身份认证。所有需要认证的接口都需要在请求头中携带 `Authorization` 字段：

```
Authorization: Bearer <token>
```

### 3.3 响应格式

所有 API 响应都采用统一的 JSON 格式：

```json
{
  "success": true,
  "data": {...},
  "message": "操作成功"
}
```

错误响应：

```json
{
  "success": false,
  "data": null,
  "message": "错误信息"
}
```

## 4. 核心 API 列表

### 4.1 用户认证接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /users/register | 注册 | 否 |
| POST | /users/login | 登录 | 否 |
| POST | /users/logout | 登出 | 是 |
| GET | /users/me | 获取当前用户信息 | 是 |

### 4.2 任务管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /tasks | 获取任务列表 | 否 |
| POST | /tasks | 发布任务 | 是 |
| GET | /tasks/{id} | 获取任务详情 | 否 |
| PUT | /tasks/{id}/accept | 接取任务 | 是 |
| PUT | /tasks/{id}/complete | 完成任务 | 是 |
| GET | /tasks/published | 获取我发布的任务 | 是 |
| GET | /tasks/accepted | 获取我接取的任务 | 是 |

### 4.3 订单管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /orders | 获取订单列表 | 是 |
| GET | /orders/{id} | 获取订单详情 | 是 |

### 4.4 消息管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /messages | 获取消息列表 | 是 |
| PUT | /messages/{id}/read | 标记消息已读 | 是 |

## 5. 前端 API 调用示例

### 5.1 HTTP 客户端配置

```javascript
// src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 错误处理逻辑
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 登录示例

```javascript
import { authApi } from '../api';

const handleLogin = async (username, password) => {
  try {
    const response = await authApi.login({ username, password });
    
    // 存储 token 和用户信息
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // 跳转到任务列表页
    navigate('/tasks');
  } catch (error) {
    alert(error.message || '登录失败');
  }
};
```

### 5.3 获取任务列表示例

```javascript
import { taskApi } from '../api';

const fetchTasks = async () => {
  try {
    const response = await taskApi.getTasks({
      category: '跑腿',
      page: 1,
      limit: 10
    });
    
    setTasks(response.data);
    setTotal(response.total);
  } catch (error) {
    console.error('获取任务失败:', error);
  }
};
```

### 5.4 发布任务示例

```javascript
import { taskApi } from '../api';

const handlePublishTask = async (taskData) => {
  try {
    await taskApi.createTask(taskData);
    alert('任务发布成功！');
    navigate('/tasks');
  } catch (error) {
    alert(error.message || '发布失败');
  }
};
```

## 6. WebSocket 实时通信

### 6.1 连接地址

```
ws://服务器地址/ws/location/{taskId}
```

### 6.2 用途

- 跑腿员实时位置推送
- 任务状态实时更新
- 消息通知

### 6.3 前端示例

```javascript
const connectWebSocket = (taskId) => {
  const ws = new WebSocket(`ws://localhost:8080/ws/location/${taskId}`);
  
  ws.onopen = () => {
    console.log('WebSocket 连接成功');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'location') {
      setRunnerLocation(data.location);
    } else if (data.type === 'status') {
      setTaskStatus(data.status);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket 连接关闭');
  };
  
  return ws;
};
```

## 7. 错误处理

| 状态码 | 含义 | 处理建议 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 重新登录获取 token |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求路径和参数 |
| 500 | 服务器内部错误 | 联系后端开发人员 |

## 8. 最佳实践

1. **Token 管理**：
   - 登录成功后存储 token 到 localStorage
   - 登出时清除 token
   - 401 错误时自动跳转到登录页

2. **错误处理**：
   - 统一处理 API 错误
   - 显示友好的错误提示
   - 记录详细的错误日志

3. **性能优化**：
   - 使用防抖和节流减少 API 调用
   - 实现请求缓存
   - 合理使用分页和筛选

4. **安全措施**：
   - 不要在前端存储敏感信息
   - 避免在 URL 中传递敏感数据
   - 实现 CSRF 防护

## 9. 开发环境配置

### 9.1 前端配置

在 `frontend/.env` 文件中配置 API 地址：

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### 9.2 跨域配置

后端需要配置 CORS 以允许前端访问：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 10. 测试工具

推荐使用以下工具测试 API：

- **Postman**：https://www.postman.com/
- **Apifox**：https://www.apifox.cn/
- **Swagger UI**：项目启动后访问 `http://localhost:8080/swagger-ui.html`

## 11. 常见问题

### 11.1 Token 过期

**问题**：API 返回 401 错误
**解决**：重新登录获取新的 token

### 11.2 跨域错误

**问题**：浏览器控制台显示 CORS 错误
**解决**：检查后端 CORS 配置是否正确

### 11.3 任务发布失败

**问题**：发布任务时返回 400 错误
**解决**：检查任务数据格式是否正确，确保所有必填字段都已填写

## 12. 联系信息

如有 API 相关问题，请联系后端开发团队。
