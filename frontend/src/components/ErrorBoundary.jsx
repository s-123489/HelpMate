import { Component } from 'react';
import { createLogger } from '../utils/logger';
import metrics from '../utils/metrics';

const logger = createLogger('error_boundary');

/**
 * React 错误边界组件
 *
 * 捕获子组件渲染错误，输出结构化 JSON 日志，
 * 并记录到 metrics 系统，同时显示友好的降级 UI。
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const componentStack = errorInfo?.componentStack || '';

    // 结构化 JSON 日志
    logger.renderError(error, componentStack);

    // 记录到指标系统
    metrics.recordError('react_render_error', {
      errorName: error.name,
      errorMessage: error.message,
      componentStack: componentStack.split('\n').slice(0, 5).join('\n'),
    });

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // 可在此扩展 Sentry 等错误追踪服务
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // 尝试重新挂载（通过修改 key）
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset,
        });
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😵</div>
          <h2 style={{ margin: '0 0 8px', color: '#333' }}>页面出了点问题</h2>
          <p style={{ color: '#666', margin: '0 0 24px', maxWidth: '400px' }}>
            我们已自动记录错误信息，请尝试刷新页面。如果问题持续出现，请联系技术支持。
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              maxWidth: '500px',
              margin: '0 auto 16px',
              textAlign: 'left',
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '12px',
            }}>
              <summary style={{ cursor: 'pointer', color: '#F44336', fontWeight: 'bold' }}>
                {this.state.error.message}
              </summary>
              <pre style={{
                fontSize: '12px',
                color: '#666',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginTop: '8px',
              }}>
                {this.state.errorInfo?.componentStack || '无堆栈信息'}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 24px',
                border: '1px solid #2196F3',
                borderRadius: '8px',
                background: '#fff',
                color: '#2196F3',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              重试
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                background: '#2196F3',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
