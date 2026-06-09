/**
 * 结构化 JSON 日志工具
 *
 * 浏览器端轻量级日志库，支持：
 * - JSON 结构化格式（time / level / message / module / extra）
 * - 日志级别过滤（debug < info < warn < error）
 * - 开发环境：彩色控制台输出
 * - 生产环境：JSON 格式，可扩展远程上报
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

// 当前日志级别：开发 debug，生产 info（可通过 localStorage 覆盖）
const getLogLevel = () => {
  const stored = localStorage.getItem('helpmate_log_level');
  if (stored && LOG_LEVELS[stored] !== undefined) return stored;
  return import.meta.env.DEV ? 'debug' : 'info';
};

const isProduction = () => import.meta.env.PROD;

/**
 * 创建带模块名的 logger 实例
 * @param {string} moduleName - 模块名称（如 'api', 'auth', 'chat'）
 */
export const createLogger = (moduleName) => {
  const shouldLog = (level) => {
    const currentLevel = getLogLevel();
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
  };

  const formatTime = () => new Date().toISOString();

  const logEntry = (level, message, extra = {}) => ({
    time: formatTime(),
    level,
    message,
    module: moduleName,
    ...extra,
  });

  const print = (level, message, extra) => {
    if (!shouldLog(level)) return;

    const entry = logEntry(level, message, extra);

    if (isProduction()) {
      // 生产环境：纯 JSON 字符串输出（可扩展为 fetch 到远程日志服务）
      const json = JSON.stringify(entry);
      if (level === 'error') {
        console.error(json);
      } else if (level === 'warn') {
        console.warn(json);
      } else {
        console.log(json);
      }
    } else {
      // 开发环境：带颜色的人类可读格式 + JSON 折叠
      const styles = {
        debug: 'color: #888; font-weight: normal',
        info: 'color: #2196F3; font-weight: normal',
        warn: 'color: #FF9800; font-weight: bold',
        error: 'color: #F44336; font-weight: bold',
      };
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[method](
        `%c[${entry.time}] %c${level.toUpperCase()}%c [${moduleName}] ${message}`,
        'color: #666',
        styles[level] || '',
        'color: #333',
        Object.keys(extra).length ? extra : ''
      );
    }

    return entry;
  };

  return {
    debug: (msg, extra) => print('debug', msg, extra),
    info: (msg, extra) => print('info', msg, extra),
    warn: (msg, extra) => print('warn', msg, extra),
    error: (msg, extra) => print('error', msg, extra),

    /** 记录 API 请求日志 */
    apiRequest: (method, url, duration, status) =>
      print(status >= 400 ? 'warn' : 'info', `${method} ${url}`, {
        type: 'api_request',
        http_method: method,
        url,
        duration_ms: Math.round(duration),
        status_code: status,
      }),

    /** 记录前端渲染错误 */
    renderError: (error, componentStack) =>
      print('error', `Render error in ${error?.message || 'unknown'}`, {
        type: 'render_error',
        error_name: error?.name,
        error_message: error?.message,
        component_stack: componentStack,
      }),

    /** 记录未捕获的 Promise 异常 */
    unhandledRejection: (event) =>
      print('error', `Unhandled rejection: ${event.reason?.message || event.reason}`, {
        type: 'unhandled_rejection',
        reason: String(event.reason),
      }),

    /** 记录用户行为事件 */
    userEvent: (action, detail = {}) =>
      print('info', `User: ${action}`, { type: 'user_event', action, ...detail }),

    /** 性能指标日志 */
    perf: (label, duration, detail = {}) =>
      print('info', `Perf: ${label} (${Math.round(duration)}ms)`, {
        type: 'performance',
        label,
        duration_ms: Math.round(duration),
        ...detail,
      }),
  };
};

/**
 * 默认全局 logger（模块名为 'app'）
 */
const logger = createLogger('app');

export default logger;
