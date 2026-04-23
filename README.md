# HelpMate - 校园跑腿互助平台

[![Frontend Coverage](https://codecov.io/gh/<用户名>/<仓库名>/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/<用户名>/<仓库名>)

## 项目简介

HelpMate 是一个校园跑腿互助平台，帮助学生之间互相帮助完成各种跑腿任务。

## 功能特性

- 用户注册与登录
- 任务发布与浏览
- 任务接受与完成
- 用户评价系统
- 消息通知

## 技术栈

### 前端
- React 18
- React Router
- Vite
- Vitest (测试框架)
- React Testing Library

### 后端
- (待补充)

## 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 运行测试

```bash
cd frontend
npm run test
```

### 生成覆盖率报告

```bash
cd frontend
npm run test:coverage
```

## 测试覆盖率

前端测试覆盖率目标：核心组件覆盖率 > 50%

- 组件渲染/交互测试：8+ 个
- Mock API 测试：4+ 个（含失败场景）

## 贡献者

查看 [贡献文档](./docs/contributions/08-testing/) 了解详细的测试贡献说明。

## License

MIT
