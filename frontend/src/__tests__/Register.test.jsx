import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Auth/Register';
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
    register: vi.fn(),
  },
}));

// Mock auth utils
vi.mock('../utils/auth', () => ({
  setToken: vi.fn(),
  setUser: vi.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染注册表单', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText('HelpMate')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('学号：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('姓名：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('手机号：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码：')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('确认密码：')).toBeInTheDocument();
  });

  it('密码不一致时应该显示错误', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('学号：'), { target: { value: '2021003' } });
    fireEvent.change(screen.getByPlaceholderText('姓名：'), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByPlaceholderText('手机号：'), { target: { value: '13800138000' } });
    fireEvent.change(screen.getByPlaceholderText('密码：'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('确认密码：'), { target: { value: '654321' } });

    const submitButton = screen.getByRole('button', { name: '注册' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });
  });

  it('密码长度不足时应该显示错误', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('学号：'), { target: { value: '2021003' } });
    fireEvent.change(screen.getByPlaceholderText('姓名：'), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByPlaceholderText('手机号：'), { target: { value: '13800138000' } });
    fireEvent.change(screen.getByPlaceholderText('密码：'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('确认密码：'), { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: '注册' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码长度至少6位')).toBeInTheDocument();
    });
  });

  it('手机号格式错误时应该显示错误', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('学号：'), { target: { value: '2021003' } });
    fireEvent.change(screen.getByPlaceholderText('姓名：'), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByPlaceholderText('手机号：'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('密码：'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('确认密码：'), { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: '注册' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('请输入正确的手机号')).toBeInTheDocument();
    });
  });

  it('注册成功后应该跳转到首页', async () => {
    mockApi.register.mockResolvedValue({
      success: true,
      data: {
        token: 'mock_token',
        user: { id: 3, name: '测试用户' },
      },
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('学号：'), { target: { value: '2021003' } });
    fireEvent.change(screen.getByPlaceholderText('姓名：'), { target: { value: '测试用户' } });
    fireEvent.change(screen.getByPlaceholderText('手机号：'), { target: { value: '13800138000' } });
    fireEvent.change(screen.getByPlaceholderText('密码：'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('确认密码：'), { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: '注册' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('点击登录按钮应该跳转到登录页面', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: '立即登录' });
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
