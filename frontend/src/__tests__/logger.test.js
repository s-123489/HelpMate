import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../utils/logger';

vi.mock('../utils/logger', async () => {
  const actual = await vi.importActual('../utils/logger');
  return actual;
});

describe('createLogger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a logger with expected methods', () => {
    const logger = createLogger('test');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.apiRequest).toBe('function');
    expect(typeof logger.renderError).toBe('function');
    expect(typeof logger.unhandledRejection).toBe('function');
    expect(typeof logger.userEvent).toBe('function');
    expect(typeof logger.perf).toBe('function');
  });

  it('info logs output something', () => {
    const logger = createLogger('test');
    logger.info('hello', {});
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('warn uses console.warn', () => {
    const logger = createLogger('test');
    logger.warn('warning', {});
    expect(consoleSpy.warn).toHaveBeenCalled();
  });

  it('error uses console.error', () => {
    const logger = createLogger('test');
    logger.error('err', {});
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('apiRequest logs with status info', () => {
    const logger = createLogger('test');
    logger.apiRequest('GET', '/api/tasks', 120, 200);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('apiRequest uses warn for 4xx status', () => {
    const logger = createLogger('test');
    logger.apiRequest('GET', '/api/tasks', 50, 404);
    expect(consoleSpy.warn).toHaveBeenCalled();
  });

  it('renderError logs structured error', () => {
    const logger = createLogger('test');
    logger.renderError(new Error('boom'), 'at Component');
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('unhandledRejection logs rejection', () => {
    const logger = createLogger('test');
    logger.unhandledRejection({ reason: new Error('unhandled') });
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it('userEvent logs user action', () => {
    const logger = createLogger('test');
    logger.userEvent('click_login');
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('perf logs performance timing', () => {
    const logger = createLogger('test');
    logger.perf('render', 42);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('respects log level from localStorage', () => {
    localStorage.getItem.mockReturnValue('silent');
    const logger = createLogger('test');
    logger.info('should be suppressed');
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });
});
