import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    renderError: vi.fn(),
  }),
}));

vi.mock('../utils/metrics', () => ({
  default: {
    recordError: vi.fn(),
  },
}));

const ThrowingComponent = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('test render error');
  return <div>normal content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('页面出了点问题')).toBeInTheDocument();
  });

  it('shows retry and reload buttons on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('重试')).toBeInTheDocument();
    expect(screen.getByText('刷新页面')).toBeInTheDocument();
  });

  it('renders custom fallback prop when provided', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
  });

  it('renders fallbackRender prop when provided', () => {
    render(
      <ErrorBoundary fallbackRender={({ error }) => <div>error: {error.message}</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('error: test render error')).toBeInTheDocument();
  });

  it('calls onReset prop when retry is clicked', () => {
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByText('重试'));
    expect(onReset).toHaveBeenCalled();
  });

  it('reload button calls window.location.reload', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByText('刷新页面'));
    expect(reloadMock).toHaveBeenCalled();
  });
});
