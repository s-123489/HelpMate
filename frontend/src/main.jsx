import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import logger from './utils/logger'
import metrics from './utils/metrics'
import { startPeriodicCheck } from './utils/healthCheck'
import './index.css'

// 捕获全局未处理的 Promise 异常
window.addEventListener('unhandledrejection', (event) => {
  logger.unhandledRejection(event);
  metrics.recordError('unhandled_rejection', {
    reason: String(event.reason),
  });
});

// 捕获全局未捕获的同步异常
window.addEventListener('error', (event) => {
  logger.error(`Uncaught error: ${event.message}`, {
    type: 'global_error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
  metrics.recordError('uncaught_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
  });
});

// 启动性能指标收集
metrics.collectWebVitals();

// 启动定期健康检查（每 60 秒检查后端）
startPeriodicCheck(60000);

// 记录应用启动
logger.info('HelpMate frontend started', {
  type: 'app_start',
  version: metrics.APP_VERSION,
  env: import.meta.env.MODE,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
