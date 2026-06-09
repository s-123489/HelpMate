import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('../utils/metrics', () => ({
  default: {
    startTimer: vi.fn(() => ({ end: vi.fn() })),
    recordApiCall: vi.fn(),
    recordError: vi.fn(),
    getSnapshot: vi.fn(() => ({})),
    printReport: vi.fn(),
    resetStats: vi.fn(),
    collectWebVitals: vi.fn(),
    APP_VERSION: '1.0.0',
  },
}));

describe('healthCheck', () => {
  let healthCheck;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockImplementation(() => {});
    localStorage.removeItem.mockImplementation(() => {});
    healthCheck = await import('../utils/healthCheck');
  });

  afterEach(() => {
    healthCheck.stopPeriodicCheck();
    vi.clearAllMocks();
  });

  it('exports expected functions', () => {
    expect(typeof healthCheck.checkFrontendHealth).toBe('function');
    expect(typeof healthCheck.checkBackendHealth).toBe('function');
    expect(typeof healthCheck.getHealthStatus).toBe('function');
    expect(typeof healthCheck.startPeriodicCheck).toBe('function');
    expect(typeof healthCheck.stopPeriodicCheck).toBe('function');
    expect(healthCheck.APP_VERSION).toBe('1.0.0');
  });

  it('checkFrontendHealth returns healthy status', () => {
    const result = healthCheck.checkFrontendHealth();
    expect(result.status).toBe('healthy');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('checks');
  });

  it('checkFrontendHealth checks include localStorage and online', () => {
    const result = healthCheck.checkFrontendHealth();
    expect(result.checks).toHaveProperty('localStorage');
    expect(result.checks).toHaveProperty('online');
    expect(result.checks).toHaveProperty('documentReady');
  });

  it('getHealthStatus returns combined status shape', () => {
    healthCheck.checkFrontendHealth();
    const status = healthCheck.getHealthStatus();
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('frontend');
    expect(status).toHaveProperty('backend');
    expect(status).toHaveProperty('timestamp');
    expect(status).toHaveProperty('version');
  });

  it('checkBackendHealth returns unhealthy when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    const result = await healthCheck.checkBackendHealth();
    expect(result.status).toBe('unhealthy');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('timestamp');
  });

  it('checkBackendHealth returns healthy when fetch succeeds', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const result = await healthCheck.checkBackendHealth();
    expect(result.status).toBe('healthy');
    expect(result).toHaveProperty('latencyMs');
    expect(result.statusCode).toBe(200);
  });

  it('checkBackendHealth returns unhealthy for non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const result = await healthCheck.checkBackendHealth();
    expect(result.status).toBe('unhealthy');
  });

  it('stopPeriodicCheck does not throw when not started', () => {
    expect(() => healthCheck.stopPeriodicCheck()).not.toThrow();
  });

  it('startPeriodicCheck and stopPeriodicCheck work without error', () => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    expect(() => healthCheck.startPeriodicCheck(1000)).not.toThrow();
    expect(() => healthCheck.stopPeriodicCheck()).not.toThrow();
    vi.useRealTimers();
  });
});
