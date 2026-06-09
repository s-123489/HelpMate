import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';
import { api } from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  api: {
    getTasks: vi.fn(),
  },
}));

const sampleTasks = [
  {
    id: 1,
    category: '跑腿',
    title: '帮我取快递',
    description: '南门菜鸟驿站',
    reward: 5,
    pickupLocation: '南门菜鸟驿站',
    deliveryLocation: '东区一号楼',
    publisher: { name: '张三', rating: 4.9 },
    publishTime: '2026-05-19T08:00:00',
  },
  {
    id: 2,
    category: '代购',
    title: '代买午餐',
    description: '麦当劳套餐',
    reward: 8,
    pickupLocation: '南门麦当劳',
    deliveryLocation: '西区三号楼',
    publisher: { name: '李四', rating: 4.7 },
    publishTime: '2026-05-19T09:00:00',
  },
];

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTasks.mockResolvedValue({ success: true, data: sampleTasks });
  });

  it('应该渲染首页标题和导航按钮', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('HelpMate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /客服/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /订单/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /我的/ })).toBeInTheDocument();
  });

  it('应该渲染分类筛选按钮', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '跑腿' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '代购' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '代拿' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '代办' })).toBeInTheDocument();
  });

  it('应该显示任务列表', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('帮我取快递')).toBeInTheDocument();
      expect(screen.getByText('代买午餐')).toBeInTheDocument();
    });
  });

  it('点击分类按钮应该用对应分类重新请求任务', async () => {
    api.getTasks.mockResolvedValueOnce({ success: true, data: sampleTasks });
    api.getTasks.mockResolvedValueOnce({ success: true, data: [sampleTasks[0]] });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('帮我取快递')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '跑腿' }));

    await waitFor(() => {
      expect(api.getTasks).toHaveBeenLastCalledWith({ category: '跑腿' });
    });
  });

  it('点击任务卡片应该跳转到任务详情页', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('帮我取快递')).toBeInTheDocument();
    });

    const taskCard = screen.getByText('帮我取快递').closest('.task-card');
    fireEvent.click(taskCard);

    expect(mockNavigate).toHaveBeenCalledWith('/task/1');
  });

  it('点击发布任务按钮应该跳转到发布页面', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const publishButton = screen.getByRole('button', { name: '+ 发布任务' });
    fireEvent.click(publishButton);

    expect(mockNavigate).toHaveBeenCalledWith('/task/publish');
  });

  it('点击订单按钮应该跳转到订单页面', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const orderButton = screen.getByRole('button', { name: /订单/ });
    fireEvent.click(orderButton);

    expect(mockNavigate).toHaveBeenCalledWith('/order/message');
  });

  it('点击我的按钮应该跳转到个人中心', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const profileButton = screen.getByRole('button', { name: /我的/ });
    fireEvent.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith('/user/center');
  });
});
