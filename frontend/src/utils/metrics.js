/**
 * 前端基础指标收集工具
 *
 * 收集关键指标：
 * - API 请求计数和响应时间
 * - 错误率统计
 * - 页面性能指标（Web Vitals）
 *
 * 使用方式：
 *   import { metrics } from '../utils/metrics';
 *   const timer = metrics.startTimer('login_api');
 *   await api.login(...);
 *   timer.end({ status: 200 });
 */

const _STORAGE_KEY = 'helpmate_metrics';

/**
 * 环形缓冲区，最多保留 N 条最近的指标记录
 */
class RingBuffer {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.items = [];
    this.index = 0;
  }

  push(item) {
    if (this.items.length < this.maxSize) {
      this.items.push(item);
    } else {
      this.items[this.index % this.maxSize] = item;
    }
    this.index++;
  }

  all() {
    return this.items;
  }
}

const buffer = new RingBuffer(1000);

// 聚合统计
const stats = {
  requests: { total: 0, success: 0, error: 0 },
  timings: {}, // { [label]: { count, totalMs, minMs, maxMs } }
  errors: {},  // { [errorType]: count }
  lastReset: Date.now(),
};

const resetStats = () => {
  stats.requests = { total: 0, success: 0, error: 0 };
  stats.timings = {};
  stats.errors = {};
  stats.lastReset = Date.now();
};

/**
 * 手动开始一个计时器
 */
const startTimer = (label) => {
  const start = performance.now();
  return {
    end: (extra = {}) => {
      const duration = performance.now() - start;
      recordTiming(label, duration, extra);
      return duration;
    },
  };
};

/**
 * 记录一次 API 请求
 */
const recordApiCall = ({ method, url, durationMs, statusCode, error }) => {
  stats.requests.total++;
  if (error || statusCode >= 400) {
    stats.requests.error++;
  } else {
    stats.requests.success++;
  }

  recordTiming(`api:${method}:${url}`, durationMs, { method, url, statusCode });

  buffer.push({
    type: 'api_call',
    time: new Date().toISOString(),
    method,
    url,
    durationMs,
    statusCode,
    error: error?.message || null,
  });
};

/**
 * 记录计时
 */
const recordTiming = (label, durationMs, _extra = {}) => {
  if (!stats.timings[label]) {
    stats.timings[label] = { count: 0, totalMs: 0, minMs: Infinity, maxMs: -Infinity };
  }
  const t = stats.timings[label];
  t.count++;
  t.totalMs += durationMs;
  t.minMs = Math.min(t.minMs, durationMs);
  t.maxMs = Math.max(t.maxMs, durationMs);
};

/**
 * 记录错误
 */
const recordError = (errorType, details = {}) => {
  stats.errors[errorType] = (stats.errors[errorType] || 0) + 1;
  buffer.push({
    type: 'error',
    time: new Date().toISOString(),
    errorType,
    ...details,
  });
};

/**
 * 获取汇总指标快照
 */
const getSnapshot = () => {
  const { total, success, error } = stats.requests;
  const errorRate = total === 0 ? 0 : ((error / total) * 100).toFixed(2);

  const timingSummaries = {};
  for (const [label, t] of Object.entries(stats.timings)) {
    timingSummaries[label] = {
      count: t.count,
      avgMs: t.count ? Math.round(t.totalMs / t.count) : 0,
      minMs: t.minMs === Infinity ? 0 : Math.round(t.minMs),
      maxMs: t.maxMs === -Infinity ? 0 : Math.round(t.maxMs),
    };
  }

  return {
    uptime_s: Math.round((Date.now() - stats.lastReset) / 1000),
    requests: { total, success, error, errorRate: `${errorRate}%` },
    timings: timingSummaries,
    errors: { ...stats.errors },
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  };
};

/**
 * 收集 Web Vitals 指标
 */
const collectWebVitals = () => {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        recordTiming('web_vital:LCP', entry.renderTime || entry.loadTime, {
          metric: 'LCP',
          element: entry.element?.tagName || 'unknown',
        });
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {
    // 浏览器不支持时静默忽略
  }

  // FCP (First Contentful Paint)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          recordTiming('web_vital:FCP', entry.startTime, { metric: 'FCP' });
        }
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (_) {
    // 浏览器不支持时静默忽略
  }

  // FID / INP (First Input Delay / Interaction to Next Paint)
  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        recordTiming('web_vital:INP', entry.duration, { metric: 'INP' });
      }
    });
    inpObserver.observe({ type: 'first-input', buffered: true });
  } catch (_) {
    // 浏览器不支持时静默忽略
  }

  // CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      recordTiming('web_vital:CLS', clsValue, { metric: 'CLS', cumulative: clsValue });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (_) {
    // 浏览器不支持时静默忽略
  }
};

/**
 * 打印指标报告到控制台（开发调试用）
 */
const printReport = () => {
  const snapshot = getSnapshot();
  console.groupCollapsed(
    `%c📊 HelpMate Metrics %c(uptime: ${snapshot.uptime_s}s, requests: ${snapshot.requests.total}, err: ${snapshot.requests.errorRate})`,
    'font-weight: bold',
    'color: #666'
  );
  console.log('Requests:', snapshot.requests);
  if (Object.keys(snapshot.timings).length > 0) {
    console.table(snapshot.timings);
  }
  if (Object.keys(snapshot.errors).length > 0) {
    console.log('Errors:', snapshot.errors);
  }
  console.groupEnd();
  return snapshot;
};

// 挂载到 window 方便调试
if (typeof window !== 'undefined') {
  window.__helpmate_metrics__ = { getSnapshot, printReport, resetStats, stats };
}

// 应用版本号
const APP_VERSION = '1.0.0';

const metrics = {
  startTimer,
  recordApiCall,
  recordError,
  getSnapshot,
  printReport,
  resetStats,
  collectWebVitals,
  APP_VERSION,
};

export { APP_VERSION };
export default metrics;
