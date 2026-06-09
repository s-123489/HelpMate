import { describe, it, expect, vi, beforeEach } from 'vitest';
import metrics, { APP_VERSION } from '../utils/metrics';

describe('metrics', () => {
  beforeEach(() => {
    metrics.resetStats();
  });

  it('exports APP_VERSION', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });

  it('startTimer returns end function that returns duration', () => {
    const timer = metrics.startTimer('test_op');
    const duration = timer.end();
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('recordApiCall increments total and success counts', () => {
    metrics.recordApiCall({ method: 'GET', url: '/api/tasks', durationMs: 100, statusCode: 200 });
    const snap = metrics.getSnapshot();
    expect(snap.requests.total).toBe(1);
    expect(snap.requests.success).toBe(1);
    expect(snap.requests.error).toBe(0);
  });

  it('recordApiCall counts 4xx as error', () => {
    metrics.recordApiCall({ method: 'GET', url: '/api/tasks', durationMs: 50, statusCode: 404 });
    const snap = metrics.getSnapshot();
    expect(snap.requests.error).toBe(1);
    expect(snap.requests.success).toBe(0);
  });

  it('recordApiCall counts network error as error', () => {
    metrics.recordApiCall({ method: 'POST', url: '/api/login', durationMs: 10, error: new Error('network') });
    const snap = metrics.getSnapshot();
    expect(snap.requests.error).toBe(1);
  });

  it('recordError increments error type count', () => {
    metrics.recordError('react_render_error', { detail: 'oops' });
    metrics.recordError('react_render_error');
    const snap = metrics.getSnapshot();
    expect(snap.errors['react_render_error']).toBe(2);
  });

  it('getSnapshot returns expected shape', () => {
    const snap = metrics.getSnapshot();
    expect(snap).toHaveProperty('requests');
    expect(snap).toHaveProperty('timings');
    expect(snap).toHaveProperty('errors');
    expect(snap).toHaveProperty('uptime_s');
    expect(snap).toHaveProperty('timestamp');
    expect(snap).toHaveProperty('version');
  });

  it('resetStats clears counts', () => {
    metrics.recordApiCall({ method: 'GET', url: '/x', durationMs: 10, statusCode: 200 });
    metrics.resetStats();
    const snap = metrics.getSnapshot();
    expect(snap.requests.total).toBe(0);
    expect(Object.keys(snap.timings)).toHaveLength(0);
  });

  it('printReport returns snapshot', () => {
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    const snap = metrics.printReport();
    expect(snap).toHaveProperty('requests');
    vi.restoreAllMocks();
  });

  it('errorRate is 0 when no requests', () => {
    const snap = metrics.getSnapshot();
    expect(snap.requests.errorRate).toBe('0%');
  });

  it('startTimer records timing in getSnapshot', () => {
    const timer = metrics.startTimer('my_op');
    timer.end();
    const snap = metrics.getSnapshot();
    expect(snap.timings['my_op']).toBeDefined();
    expect(snap.timings['my_op'].count).toBe(1);
  });
});
