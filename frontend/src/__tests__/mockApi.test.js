import { describe, it, expect } from 'vitest';
import { mockApi } from '../services/mockApi';

describe('Mock API Tests', () => {
  describe('用户认证 API', () => {
    it('登录成功 - 应该返回用户信息和token', async () => {
      const result = await mockApi.login('2021001', '123456');

      expect(result.success).toBe(true);
      expect(result.data.token).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.studentId).toBe('2021001');
      expect(result.data.user.password).toBeUndefined();
    });

    it('登录失败 - 学号不存在应该抛出错误', async () => {
      await expect(mockApi.login('9999999', '123456')).rejects.toThrow('学号或密码错误');
    });

    it('登录失败 - 密码错误应该抛出错误', async () => {
      await expect(mockApi.login('2021001', 'wrongpassword')).rejects.toThrow('密码错误');
    });

    it('注册成功 - 应该创建新用户', async () => {
      const newUser = {
        studentId: '2021999',
        name: '新用户',
        phone: '13900139000',
        password: '123456'
      };

      const result = await mockApi.register(newUser);

      expect(result.success).toBe(true);
      expect(result.data.user.studentId).toBe('2021999');
      expect(result.data.user.name).toBe('新用户');
      expect(result.data.token).toBeDefined();
    });

    it('注册失败 - 学号已存在应该抛出错误', async () => {
      const duplicateUser = {
        studentId: '2021001',
        name: '重复用户',
        phone: '13900139000',
        password: '123456'
      };

      await expect(mockApi.register(duplicateUser)).rejects.toThrow('该学号已被注册');
    });
  });

  describe('任务管理 API', () => {
    it('获取任务列表 - 应该返回所有任务', async () => {
      const result = await mockApi.getTasks();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].publisher).toBeDefined();
    });

    it('获取任务列表 - 按分类筛选', async () => {
      const result = await mockApi.getTasks({ category: '跑腿' });

      expect(result.success).toBe(true);
      expect(result.data.every(task => task.category === '跑腿')).toBe(true);
    });

    it('获取任务详情 - 应该返回完整任务信息', async () => {
      const result = await mockApi.getTaskDetail(1);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.publisher).toBeDefined();
      expect(result.data.title).toBeDefined();
    });

    it('获取任务详情失败 - 任务不存在应该抛出错误', async () => {
      await expect(mockApi.getTaskDetail(99999)).rejects.toThrow('任务不存在');
    });

    it('发布任务 - 应该创建新任务', async () => {
      const taskData = {
        title: '测试任务',
        category: '跑腿',
        description: '这是一个测试任务',
        reward: 5,
        pickupLocation: '南门',
        deliveryLocation: '东区',
        deadline: '2026-04-23T18:00'
      };

      const result = await mockApi.publishTask(taskData, 1);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('测试任务');
      expect(result.data.status).toBe('pending');
      expect(result.data.publisherId).toBe(1);
    });

    it('接受任务 - 应该更新任务状态', async () => {
      const result = await mockApi.acceptTask(1, 2);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('accepted');
      expect(result.data.accepterId).toBe(2);
    });

    it('接受任务失败 - 不能接受自己发布的任务', async () => {
      // 使用任务3，它的状态是pending
      await expect(mockApi.acceptTask(3, 1)).rejects.toThrow('不能接受自己发布的任务');
    });

    it('完成任务 - 应该更新任务状态为已完成', async () => {
      // 先接受任务
      await mockApi.acceptTask(3, 2);

      // 再完成任务
      const result = await mockApi.completeTask(3);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('completed');
    });
  });

  describe('消息通知 API', () => {
    it('获取消息列表 - 应该返回用户的消息', async () => {
      const result = await mockApi.getMessages(1);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('标记消息已读 - 应该更新消息状态', async () => {
      const result = await mockApi.markMessageRead(1);

      expect(result.success).toBe(true);
      expect(result.data.isRead).toBe(true);
    });
  });

  describe('评价系统 API', () => {
    it('提交评价 - 应该创建新评价', async () => {
      const reviewData = {
        taskId: 1,
        reviewerId: 1,
        revieweeId: 2,
        rating: 5,
        comment: '非常好！'
      };

      const result = await mockApi.submitReview(reviewData);

      expect(result.success).toBe(true);
      expect(result.data.rating).toBe(5);
      expect(result.data.comment).toBe('非常好！');
    });

    it('获取用户评价 - 应该返回用户收到的评价', async () => {
      const result = await mockApi.getUserReviews(1);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('用户信息 API', () => {
    it('getCurrentUser - 应该返回用户信息', async () => {
      const loginResult = await mockApi.login('2021001', '123456');
      const token = loginResult.data.token;
      const result = await mockApi.getCurrentUser(token);
      expect(result.success).toBe(true);
      expect(result.data.studentId).toBe('2021001');
      expect(result.data.password).toBeUndefined();
    });

    it('getCurrentUser - token无效应该抛出错误', async () => {
      await expect(mockApi.getCurrentUser('mock_token_9999')).rejects.toThrow('用户不存在');
    });

    it('getMyProfile - 应该返回用户资料', async () => {
      const result = await mockApi.getMyProfile(1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('username');
      expect(result.data).toHaveProperty('balance');
      expect(result.data).toHaveProperty('avgScore');
      expect(result.data).toHaveProperty('reviewCount');
    });

    it('getMyProfile - 用户不存在应该抛出错误', async () => {
      await expect(mockApi.getMyProfile(9999)).rejects.toThrow('用户不存在');
    });

    it('recharge - 应该增加用户余额', async () => {
      const profileBefore = await mockApi.getMyProfile(1);
      const balanceBefore = profileBefore.data.balance;
      const result = await mockApi.recharge(100, 1);
      expect(result.success).toBe(true);
      expect(result.data.balance).toBe(balanceBefore + 100);
    });

    it('recharge - 用户不存在应该抛出错误', async () => {
      await expect(mockApi.recharge(100, 9999)).rejects.toThrow('用户不存在');
    });
  });

  describe('订单 API', () => {
    it('getUserPublishedTasks - 应该返回用户发布的任务', async () => {
      const result = await mockApi.getUserPublishedTasks(1);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(task => expect(task.publisherId).toBe(1));
    });

    it('getUserAcceptedTasks - 应该返回用户接受的任务', async () => {
      const result = await mockApi.getUserAcceptedTasks(2);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('myPublishedOrders - 应该返回我发布的订单', async () => {
      const result = await mockApi.myPublishedOrders(1);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(order => {
        expect(order).toHaveProperty('taskId');
        expect(order).toHaveProperty('taskTitle');
        expect(order).toHaveProperty('reward');
        expect(order).toHaveProperty('status');
      });
    });

    it('myAcceptedOrders - 应该返回我接取的订单', async () => {
      const result = await mockApi.myAcceptedOrders(2);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('任务状态流转', () => {
    it('cancelTask - 应该取消任务', async () => {
      const publishResult = await mockApi.publishTask({
        title: '待取消任务',
        category: '跑腿',
        description: '测试取消',
        reward: 5,
        pickupLocation: 'A',
        deliveryLocation: 'B',
        deadline: '2026-12-31T18:00',
      }, 1);
      const taskId = publishResult.data.id;
      const result = await mockApi.cancelTask(taskId);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });

    it('cancelTask - 任务不存在应该抛出错误', async () => {
      await expect(mockApi.cancelTask(9999)).rejects.toThrow('任务不存在');
    });

    it('completeTask - 任务不存在应该抛出错误', async () => {
      await expect(mockApi.completeTask(9999)).rejects.toThrow('任务不存在');
    });

    it('completeTask - 未接受的任务不能完成', async () => {
      const publishResult = await mockApi.publishTask({
        title: '未接受任务',
        category: '跑腿',
        description: '测试',
        reward: 5,
        pickupLocation: 'A',
        deliveryLocation: 'B',
        deadline: '2026-12-31T18:00',
      }, 1);
      await expect(mockApi.completeTask(publishResult.data.id)).rejects.toThrow('任务状态不正确');
    });
  });
});
