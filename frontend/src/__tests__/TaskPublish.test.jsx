import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskPublish from '../pages/Task/TaskPublish';
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
    publishTask: vi.fn(),
  },
}));

describe('TaskPublish Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('应该渲染任务发布表单', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('任务标题（必填）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('描述任务详情，越详细越容易接单')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('取件地点')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('送达地点')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入金额')).toBeInTheDocument();
  });

  it('应该渲染分类按钮', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    expect(screen.getByText('跑腿')).toBeInTheDocument();
    expect(screen.getByText('代购')).toBeInTheDocument();
    expect(screen.getByText('代拿')).toBeInTheDocument();
    expect(screen.getByText('代办')).toBeInTheDocument();
  });

  it('应该能够切换任务分类', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    const categoryButtons = screen.getAllByRole('button');
    const daiGouButton = categoryButtons.find(btn => btn.textContent.includes('代购'));

    fireEvent.click(daiGouButton);
    expect(daiGouButton).toHaveClass('active');
  });

  it('应该能够输入任务信息', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    const titleInput = screen.getByPlaceholderText('任务标题（必填）');
    const descriptionInput = screen.getByPlaceholderText('描述任务详情，越详细越容易接单');

    fireEvent.change(titleInput, { target: { value: '测试任务' } });
    fireEvent.change(descriptionInput, { target: { value: '这是一个测试任务' } });

    expect(titleInput.value).toBe('测试任务');
    expect(descriptionInput.value).toBe('这是一个测试任务');
  });

  it('应该能够点击快速金额按钮累加金额', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    const rewardInput = screen.getByPlaceholderText('输入金额');
    const quickRewardButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent.startsWith('+¥')
    );

    fireEvent.click(quickRewardButtons[0]); // +¥1
    expect(rewardInput.value).toBe('1');

    fireEvent.click(quickRewardButtons[2]); // +¥5
    expect(rewardInput.value).toBe('6');
  });

  it('点击返回按钮应该返回上一页', () => {
    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('button', { name: /← 发布任务/ });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('提交表单成功后应该跳转到首页', async () => {
    api.publishTask.mockResolvedValue({ success: true, data: { id: 99 } });

    render(
      <BrowserRouter>
        <TaskPublish />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('任务标题（必填）'), {
      target: { value: '测试任务' }
    });
    fireEvent.change(screen.getByPlaceholderText('取件地点'), {
      target: { value: '南门' }
    });
    fireEvent.change(screen.getByPlaceholderText('送达地点'), {
      target: { value: '东区宿舍' }
    });

    const deadlineInput = document.querySelector('input[name="deadline"]');
    fireEvent.change(deadlineInput, { target: { value: '2026-04-23T18:00' } });

    fireEvent.change(screen.getByPlaceholderText('输入金额'), {
      target: { value: '5' }
    });

    const publishButton = screen.getAllByRole('button').find(
      btn => btn.textContent === '发布任务' && btn.type === 'submit'
    );
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(api.publishTask).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
