# 前端模块说明

## 模块功能

HelpMate 前端负责提供用户界面与交互体验，主要包括：

- 用户注册、登录与身份验证
- 帮助请求的发布、查询与管理
- 任务接单与完成流程
- 实时位置显示
- 评价系统
- 钱包管理与支付
- 用户信息管理

## 技术选型

| 技术 | 说明 |
|------|------|
| React | 前端框架 |
| React Native | 跨平台移动端开发 |
| Redux | 状态管理 |
| Axios | HTTP 请求库 |
| WebSocket | 实时通信 |
| React Navigation | 导航库 |
| Styled Components | 样式管理 |

## 目录结构

```
frontend/
├── pages/             # 页面
│   ├── Auth/          # 认证相关页面
│   ├── Task/          # 任务相关页面
│   ├── User/          # 用户相关页面
│   └── Wallet/        # 钱包相关页面
├── components/        # 组件
│   ├── TaskCard/      # 任务卡片
│   ├── UserInfo/      # 用户信息
│   └── Map/           # 地图组件
├── utils/             # 工具函数
│   ├── api.js         # API 调用
│   ├── storage.js     # 本地存储
│   └── location.js    # 位置服务
├── services/          # 服务
│   ├── auth.js        # 认证服务
│   ├── task.js        # 任务服务
│   ├── user.js        # 用户服务
│   └── wallet.js      # 钱包服务
├── navigation/        # 导航配置
└── App.js             # 应用入口
```

## 运行方式

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
# Web 端
npm start

# 移动端
npx react-native run-android
# 或
npx react-native run-ios
```

3. 构建生产版本：

```bash
# Web 端
npm run build

# 移动端
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

前端默认运行在 `http://localhost:3000`（Web 端）
