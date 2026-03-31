# API 设计文档

## 基础信息

- Base URL: `http://localhost:8080/api`
- 数据格式：JSON
- 认证方式：JWT（在请求头中携带 `Authorization: Bearer <token>`）

## 接口列表

### 用户模块

#### 注册

- **POST** `/api/user/register`
- 请求体：

```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
}
```

- 返回：

```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

#### 登录

- **POST** `/api/user/login`
- 请求体：

```json
{
  "username": "string",
  "password": "string"
}
```

- 返回：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",
    "username": "string"
  }
}
```

### 任务模块

#### 发布任务

- **POST** `/api/task/create`
- 请求头：`Authorization: Bearer <token>`（必须登录）
- 请求体：

```json
{
  "title": "string",
  "description": "string",
  "category": "EXPRESS | FOOD | PURCHASE | OTHER",
  "reward": 10.00,
  "location": "string",
  "deadline": "string"
}
```

- 返回：

```json
{
  "code": 200,
  "message": "发布成功",
  "data": 1
}
```

> `data` 为新建任务的 ID

#### 查询任务列表

- **GET** `/api/task/list?page=1&size=10&category=EXPRESS`
- 请求头：无需登录
- 参数说明：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| category | string | 否 | 分类筛选，不传则返回全部 |

- 返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "size": 10,
    "current": 1,
    "records": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "category": "string",
        "reward": 10.00,
        "status": 0,
        "location": "string",
        "createdAt": "2026-03-31T12:00:00"
      }
    ]
  }
}
```

## 通用错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权（Token 缺失或过期） |
| 500 | 服务器内部错误 |
