/**
 * 健康检查工具
 *
 * 提供：
 * - 前端自身健康状态检查
 * - 后端 /health 端点探活
 * - 定期健康检查调度
 */

import { createLogger } from './logger';

const logger = createLogger('health');
const APP_VERSION = '1.0.0';

// 健康状态缓存
const healthState = {
  frontend: 'healthy',
  backend: 'unknown',
  lastCheck: null,
  lastBackendCheck: null,
  backendLatencyMs: null,
  consecutiveFailures: 0,
};

let intervalId = null;

/**
 * 前端自身健康检查（同步，始终返回 healthy）
 * 可扩展为检查关键依赖（如 localStorage 可用性、Service Worker 状态等）
 */
const checkFrontendHealth = () => {
  const checks = {
    localStorage: (() => {
      try {
        localStorage.setItem('__health_check__', '1');
        localStorage.removeItem('__health_check__');
        return true;
      } catch {
        return false;
      }
    })(),
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    documentReady: typeof document !== 'undefined'
      ? document.readyState === 'complete' || document.readyState === 'interactive'
      : true,
  };

  const allHealthy = Object.values(checks).every(Boolean);

  healthState.frontend = allHealthy ? 'healthy' : 'degraded';

  logger.info('Frontend health check', {
    type: 'health_check',
    target: 'frontend',
    status: healthState.frontend,
    checks,
  });

  return {
    status: healthState.frontend,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    checks,
  };
};

/**
 * 检查后端健康状态
 * @param {string} apiBaseUrl - 后端 API 基地址
 */
const checkBackendHealth = async (_apiBaseUrl = '/api') => {
  const startTime = performance.now();

  try {
    // nginx /health 直接返回（不经 /api 代理）
    const response = await fetch('/health', {
      method: 'GET',
      headers: { Accept: 'application/json, text/plain' },
      // 短超时避免长时间等待
      signal: AbortSignal.timeout(5000),
    });

    const latency = Math.round(performance.now() - startTime);
    healthState.backend = response.ok ? 'healthy' : 'unhealthy';
    healthState.backendLatencyMs = latency;
    healthState.consecutiveFailures = 0;
    healthState.lastBackendCheck = new Date().toISOString();

    logger.info('Backend health check', {
      type: 'health_check',
      target: 'backend',
      status: healthState.backend,
      latency_ms: latency,
      status_code: response.status,
    });

    return {
      status: healthState.backend,
      latencyMs: latency,
      statusCode: response.status,
      timestamp: healthState.lastBackendCheck,
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    healthState.backend = 'unhealthy';
    healthState.consecutiveFailures++;
    healthState.backendLatencyMs = latency;
    healthState.lastBackendCheck = new Date().toISOString();

    logger.error('Backend health check failed', {
      type: 'health_check',
      target: 'backend',
      status: 'unhealthy',
      latency_ms: latency,
      error: error.message,
      consecutive_failures: healthState.consecutiveFailures,
    });

    return {
      status: 'unhealthy',
      latencyMs: latency,
      error: error.message,
      timestamp: healthState.lastBackendCheck,
    };
  }
};

/**
 * 获取完整健康状态
 */
const getHealthStatus = () => {
  const { frontend, backend, lastBackendCheck, backendLatencyMs, consecutiveFailures } = healthState;
  return {
    status: frontend === 'healthy' && backend !== 'unhealthy' ? 'healthy' : 'degraded',
    frontend,
    backend,
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    backendLatencyMs,
    consecutiveFailures,
    lastBackendCheck,
    uptime: typeof performance !== 'undefined'
      ? Math.round(performance.now() / 1000)
      : null,
  };
};

/**
 * 启动定期健康检查
 * @param {number} intervalMs - 检查间隔（毫秒），默认 30 秒
 */
const startPeriodicCheck = (intervalMs = 30000) => {
  if (intervalId) return;

  // 立即执行一次
  checkFrontendHealth();
  checkBackendHealth();

  intervalId = setInterval(() => {
    checkFrontendHealth();
    checkBackendHealth();
  }, intervalMs);

  logger.info('Periodic health check started', { interval_ms: intervalMs });
};

/**
 * 停止定期健康检查
 */
const stopPeriodicCheck = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Periodic health check stopped');
  }
};

// 挂载到 window 方便调试
if (typeof window !== 'undefined') {
  window.__helpmate_health__ = {
    getHealthStatus,
    checkFrontendHealth,
    checkBackendHealth,
    startPeriodicCheck,
    stopPeriodicCheck,
  };
}

export {
  checkFrontendHealth,
  checkBackendHealth,
  getHealthStatus,
  startPeriodicCheck,
  stopPeriodicCheck,
  APP_VERSION,
};

export default {
  checkFrontendHealth,
  checkBackendHealth,
  getHealthStatus,
  startPeriodicCheck,
  stopPeriodicCheck,
};
