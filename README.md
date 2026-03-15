# HelpMate — 校园跑腿 / 互助平台

> 业务逻辑完整，贴近校园生活。技术栈：React Native / 小程序 + Spring Boot。
> 创新点：实时位置 + 订单状态机 + 钱包支付的组合。

## 项目简介

HelpMate 是一款面向在校学生的跑腿与互助平台，支持发布取快递、送餐、代购、互助等任务，
接单者可实时导航完成任务并通过平台钱包结算报酬。

## 文档

- [后端模块说明](docs/backend.md)
- [API 设计文档](docs/api.md)
- [UI 设计说明](docs/design-spec.md)

## UI 设计稿（Figma）

> https://www.figma.com/design/dxKa3GWXKRiBquoFIdwZpl/HelpMate-UI-Design?node-id=0-1&t=782aFOJOayYth2nb-1

## 目录结构

```
backed/
├── docs/
│   ├── design/                  # 设计稿截图（PNG，从 Figma 导出）
│   ├── design-spec.md           # 设计说明（配色、字体、页面、交互）
│   ├── contributions/
│   │   └── 02-ui/               # UI 作业个人贡献说明
│   │       └── syt.md
│   ├── backend.md
│   └── api.md
└── README.md
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React Native / 微信小程序 |
| 后端 | Spring Boot 3.x |
| 数据库 | MySQL 8.0 |
| ORM | MyBatis-Plus |
| 认证 | JWT |
| 构建 | Maven |
