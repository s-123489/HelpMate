# API 设计文档

## 基础信息

- Base URL: `http://localhost:8080/api`
- 数据格式：JSON
- 认证方式：JWT（在请求头中携带 `Authorization: Bearer <token>`）

## 接口列表

### 用户模块

#### 注册

- **POST** `/user/register`
- 请求体：

```json
{
  "username": "string",
  "password": "string",
  "email": "string"
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

- **POST** `/user/login`
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
    "token": "string"
  }
}
```

### 帮助请求模块

#### 发布请求

- **POST** `/help/create`
- 请求头：需携带 Token
- 请求体：

```json
{
  "title": "string",
  "description": "string",
  "category": "string"
}
```

- 返回：

```json
{
  "code": 200,
  "message": "发布成功",
  "data": { "id": 1 }
}
```

#### 查询请求列表

- **GET** `/help/list?page=1&size=10`
- 请求头：需携带 Token
- 返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "category": "string",
        "createdAt": "2024-01-01 12:00:00"
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
| 401 | 未授权 |
| 500 | 服务器内部错误 |
