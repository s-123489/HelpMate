import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import { mockApi } from '../services/mockApi';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock mockApi
vi.mock('../services/mockApi', () => ({
  mockApi: {
    login: vi.fn(),
  },
}));

// Mock auth utils
vi.mock('../utils/auth', () => ({
  setToken: vi.fn(),
  setUser: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染登录表单', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('HelpMate')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('学号：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码：')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
  });

  it('应该能够输入学号和密码', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const studentIdInput = screen.getByPlaceholderText('学号：');
    const passwordInput = screen.getByPlaceholderText('密码：');

    fireEvent.change(studentIdInput, { target: { value: '2021001' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    expect(studentIdInput.value).toBe('2021001');
    expect(passwordInput.value).toBe('123456');
  });

  it('成功登录后应该跳转到首页', async () => {
    mockApi.login.mockResolvedValue({
      success: true,
      data: {
        token: 'mock_token',
        user: { id: 1, name: '张三' },
      },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const studentIdInput = screen.getByPlaceholderText('学号：');
    const passwordInput = screen.getByPlaceholderText('密码：');
    const submitButton = screen.getByRole('button', { name: '登入' });

    fireEvent.change(studentIdInput, { target: { value: '2021001' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('登录失败时应该显示错误信息', async () => {
    mockApi.login.mockRejectedValue(new Error('密码错误'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const studentIdInput = screen.getByPlaceholderText('学号：');
    const passwordInput = screen.getByPlaceholderText('密码：');
    const submitButton = screen.getByRole('button', { name: '登入' });

    fireEvent.change(studentIdInput, { target: { value: '2021001' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码错误')).toBeInTheDocument();
    });
  });

  it('点击注册按钮应该跳转到注册页面', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole('button', { name: '立即注册' });
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('登录中应该显示加载状态', async () => {
    mockApi.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const studentIdInput = screen.getByPlaceholderText('学号：');
    const passwordInput = screen.getByPlaceholderText('密码：');
    const submitButton = screen.getByRole('button', { name: '登入' });

    fireEvent.change(studentIdInput, { target: { value: '2021001' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: '登录中...' })).toBeInTheDocument();
  });
});
