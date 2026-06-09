# HelpMate 监控配置说明文档

## 一、总体架构

HelpMate 的监控体系覆盖**前端**和**后端**两个维度，确保应用的健康状态、性能表现、错误情况均可观测。

```
┌─────────────────────────────────────────────────┐
│                   监控体系                        │
├──────────────┬──────────────────────────────────┤
│   前端监控    │          后端监控                 │
├──────────────┼──────────────────────────────────┤
│ 结构化日志    │  结构化日志（JSON）               │
│ 健康检查      │  /health 端点（JSON）            │
│ API 指标      │  请求计数 / 响应时间 / 错误率     │
│ ErrorBoundary│  异常处理 / 错误追踪               │
│ Web Vitals   │  JVM 指标 / 数据库连接池          │
└──────────────┴──────────────────────────────────┘
```

---

## 二、前端监控配置

### 2.1 结构化日志（`src/utils/logger.js`）

前端实现了一个轻量级 JSON 结构化日志工具，特点：

- **JSON 格式输出**：每条日志包含 `time`、`level`、`message`、`module` 字段
- **日志级别**：`debug` < `info` < `warn` < `error` < `silent`
- **模块隔离**：每个模块通过 `createLogger('moduleName')` 创建独立 logger
- **双模式输出**：
  - 开发环境：彩色控制台，人类可读
  - 生产环境：纯 JSON 字符串，方便日志采集

**使用示例：**

```javascript
import { createLogger } from '../utils/logger';
const logger = createLogger('my_module');

logger.info('用户登录成功', { userId: 1, method: 'password' });
// 输出: [2026-06-01T10:00:00.000Z] INFO [my_module] 用户登录成功 { userId: 1, method: 'password' }

logger.error('API 调用失败', { url: '/task/list', status: 500 });
// 输出（JSON）: {"time":"...","level":"error","message":"API 调用失败","module":"my_module","url":"/task/list","status":500}
```

**预设日志方法：**

| 方法 | 用途 |
|------|------|
| `logger.apiRequest(method, url, duration, status)` | API 请求日志 |
| `logger.renderError(error, componentStack)` | React 渲染错误 |
| `logger.unhandledRejection(event)` | 未捕获 Promise 异常 |
| `logger.userEvent(action, detail)` | 用户行为事件 |
| `logger.perf(label, duration, detail)` | 性能指标 |

**日志级别配置：**

本地可通过 `localStorage` 覆盖日志级别：

```javascript
// 仅查看 warn 及以上
localStorage.setItem('helpmate_log_level', 'warn');
// 恢复默认
localStorage.removeItem('helpmate_log_level');
```

### 2.2 健康检查

#### Nginx 端点（`frontend/nginx.conf`）

```nginx
location /health {
    access_log off;
    default_type application/json;
    return 200 '{"status":"healthy","service":"helpmate-frontend","version":"1.0.0","timestamp":"$time_iso8601"}';
}
```

返回示例：

```json
{
  "status": "healthy",
  "service": "helpmate-frontend",
  "version": "1.0.0",
  "timestamp": "2026-06-01T10:00:00+08:00"
}
```

#### 前端健康检查工具（`src/utils/healthCheck.js`）

提供完整的前端 + 后端健康探活：

| 功能 | 说明 |
|------|------|
| `checkFrontendHealth()` | 检查 localStorage、网络状态、DOM 就绪 |
| `checkBackendHealth()` | GET `/health`，记录延迟和状态码 |
| `getHealthStatus()` | 返回前端+后端整体健康快照 |
| `startPeriodicCheck(ms)` | 定时健康检查（默认 60 秒） |

**调试方式：**

```javascript
// 浏览器控制台
window.__helpmate_health__.getHealthStatus()
// {
//   status: 'healthy',
//   frontend: 'healthy',
//   backend: 'healthy',
//   version: '1.0.0',
//   backendLatencyMs: 12,
//   uptime: 125
// }
```

### 2.3 基础指标收集（`src/utils/metrics.js`）

#### API 请求指标

每个 API 请求自动记录：
- 请求计数（总数、成功、失败）
- 响应时间（平均值、最小值、最大值）
- 错误率百分比

**数据结构：**

```javascript
{
  uptime_s: 3600,
  requests: { total: 1523, success: 1498, error: 25, errorRate: "1.64%" },
  timings: {
    "api:GET:/task/list": { count: 87, avgMs: 45, minMs: 12, maxMs: 320 },
    "api:POST:/user/login": { count: 34, avgMs: 120, minMs: 45, maxMs: 500 }
  },
  errors: {
    "api_network_error": 15,
    "react_render_error": 3,
    "unhandled_rejection": 7
  },
  timestamp: "2026-06-01T10:00:00.000Z",
  version: "1.0.0"
}
```

#### Web Vitals 核心性能指标

自动收集以下 Web Vitals：
- **LCP**（Largest Contentful Paint）：最大内容绘制
- **FCP**（First Contentful Paint）：首次内容绘制
- **INP**（Interaction to Next Paint）：交互延迟
- **CLS**（Cumulative Layout Shift）：累计布局偏移

#### 调试方式

```javascript
// 浏览器控制台查看完整指标报告
window.__helpmate_metrics__.printReport()
// 重置统计
window.__helpmate_metrics__.resetStats()
```

### 2.4 错误追踪（`src/components/ErrorBoundary.jsx`）

React 错误边界组件，捕获组件树中的渲染错误：

- **自动记录**：捕获错误后输出结构化 JSON 日志
- **指标同步**：错误计入 `metrics.recordError()`
- **降级 UI**：显示友好错误页面（含重试/刷新按钮）
- **开发详情**：开发模式下展示错误消息和组件堆栈

**使用方式**：

```jsx
// 已在 main.jsx 中全局包裹
<ErrorBoundary>
  <App />
</ErrorBoundary>

// 也可用于局部包裹
<ErrorBoundary fallbackRender={({ error, reset }) => (
  <div>加载失败: {error.message} <button onClick={reset}>重试</button></div>
)}>
  <TaskDetail />
</ErrorBoundary>
```

#### 全局错误监听

`main.jsx` 中注册了全局监听：
- `unhandledrejection` — 未处理的 Promise 异常
- `error` — 未捕获的同步异常

---

## 三、后端监控（概要）

后端的 Spring Boot 监控配置（由后端同学负责），与前端监控形成互补：

| 组件 | 说明 |
|------|------|
| 日志 | Logback JSON 格式输出，含 requestId 追踪 |
| `/health` 端点 | Spring Boot Actuator health endpoint |
| `/metrics` 端点 | Actuator metrics：JVM、HTTP、DB 连接池 |
| 异常处理 | `GlobalExceptionHandler` 统一异常捕获与日志记录 |

---

## 四、目录结构

```
frontend/src/
├── components/
│   └── ErrorBoundary.jsx      # 错误边界 + 降级 UI
├── utils/
│   ├── logger.js               # 结构化 JSON 日志工具
│   ├── metrics.js              # 基础指标收集工具
│   └── healthCheck.js          # 健康检查工具
├── services/
│   └── api.js                  # API 服务（已集成指标 + 日志）
└── main.jsx                    # 入口（全局错误监听 + 健康检查启动）

frontend/
└── nginx.conf                  # /health 端点（JSON 格式）

docs/
├── monitoring.md               # 本文档
└── contributions/
    └── 13-monitoring/
        ├── 陈晓彤.md
        ├── Lilili.md
        └── syt.md
```

---

## 五、验证清单

### 前端验证

- [ ] 打开浏览器控制台，看到启动日志 `HelpMate frontend started`
- [ ] `window.__helpmate_health__.getHealthStatus()` 返回健康状态
- [ ] `window.__helpmate_metrics__.printReport()` 显示指标统计
- [ ] 访问 `http://localhost:3000/health`（或部署后的 `/health`）返回 JSON
- [ ] 触发一个 API 调用，控制台看到结构化日志
- [ ] 模拟错误（如在控制台执行 `Promise.reject('test')`），记录到 metrics

### 生产环境验证

- [ ] 部署后 `/health` 返回 JSON 格式
- [ ] 前端日志为纯 JSON 字符串格式
- [ ] Web Vitals 指标正常收集
- [ ] 错误边界捕获渲染异常并显示降级 UI

---

## 六、扩展建议

1. **远程日志上报**：在 `logger.js` 的生产环境中添加 `fetch` 将日志发送到日志收集服务（如 Loki、ELK）
2. **Sentry 集成**：在 `ErrorBoundary.componentDidCatch` 中调用 `Sentry.captureException()`
3. **Grafana 仪表盘**：基于 metrics 数据在前端绘制实时监控仪表盘
4. **告警配置**：在 health check 连续失败 N 次时触发告警通知
