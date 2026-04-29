\# API 使用说明



\## 基本信息

\- Base URL：`http://localhost:8080`

\- 数据格式：JSON

\- 认证方式：Bearer Token（JWT）



\## 统一响应格式

所有接口返回统一格式：

```json

{

&#x20; "code": 200,

&#x20; "message": "success",

&#x20; "data": {}

}

```



\## 认证说明

登录后获取 token，后续需要认证的接口在请求头加：

```

Authorization: Bearer <token>

```



\## 接口列表



\### 用户认证



\#### 注册

\- 方法：POST

\- 路径：`/api/user/register`

\- 请求体：

```json

{

&#x20; "username": "lilili",

&#x20; "password": "123456",

&#x20; "email": "lilili@example.com",

&#x20; "phone": "13800138000"

}

```



\#### 登录

\- 方法：POST

\- 路径：`/api/user/login`

\- 请求体：

```json

{

&#x20; "username": "lilili",

&#x20; "password": "123456"

}

```

\- 返回：token、userId、username



\### 任务管理



\#### 发布任务（需登录）

\- 方法：POST

\- 路径：`/api/task/create`

\- 请求体：

```json

{

&#x20; "title": "帮我取快递",

&#x20; "description": "快递柜B区，取件码1234",

&#x20; "category": "EXPRESS",

&#x20; "reward": 5.00,

&#x20; "location": "宿舍楼A栋",

&#x20; "deadline": "2026-03-25 18:00"

}

```



\#### 获取任务列表

\- 方法：GET

\- 路径：`/api/task/list`

\- 参数：

&#x20; - page（默认1）

&#x20; - size（默认10）

&#x20; - category（可选，EXPRESS/FOOD/PURCHASE/OTHER）



\## 状态码说明

| 状态码 | 说明 |

|--------|------|

| 200 | 成功 |

| 400 | 参数错误 |

| 401 | 未登录或token失效 |

| 404 | 资源不存在 |

| 500 | 服务器错误 |

