// API适配器 - 统一的接口，自动切换真实API和Mock API
import { api } from './api.js';
import { mockApi } from './mockApi.js';
import { getToken } from '../utils/auth.js';

// 配置 - 可以在环境变量中设置，默认为true（使用mock）
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// 获取当前用户ID（从token中）
const getCurrentUserId = () => {
  const token = getToken();
  if (token && token.includes('mock_token_')) {
    return parseInt(token.replace('mock_token_', ''));
  }
  return 1; // 默认用户ID
};

// 统一的API接口
export const apiAdapter = {
  // 用户注册
  register: async (userData) => {
    if (USE_MOCK) {
      return mockApi.register(userData);
    }
    return api.register(userData);
  },

  // 用户登录
  login: async (studentId, password) => {
    if (USE_MOCK) {
      return mockApi.login(studentId, password);
    }
    return api.login(studentId, password);
  },

  // 获取任务列表
  getTasks: async (filters = {}) => {
    if (USE_MOCK) {
      return mockApi.getTasks(filters);
    }
    return api.getTasks(filters);
  },

  // 获取任务详情
  getTaskDetail: async (taskId) => {
    if (USE_MOCK) {
      return mockApi.getTaskDetail(taskId);
    }
    return api.getTaskDetail(taskId);
  },

  // 发布任务
  publishTask: async (taskData) => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.publishTask(taskData, userId);
    }
    return api.publishTask(taskData);
  },

  // 接受任务
  acceptTask: async (taskId) => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.acceptTask(taskId, userId);
    }
    return api.acceptTask(taskId);
  },

  // 完成任务
  completeTask: async (taskId) => {
    if (USE_MOCK) {
      return mockApi.completeTask(taskId);
    }
    return api.completeOrder(taskId);
  },

  // 取消任务
  cancelTask: async (taskId) => {
    if (USE_MOCK) {
      return mockApi.cancelTask(taskId);
    }
    return api.cancelOrder(taskId);
  },

  // 提交评价
  submitReview: async (reviewData) => {
    if (USE_MOCK) {
      return mockApi.submitReview(reviewData);
    }
    return api.submitReview(reviewData);
  },

  // 获取用户评价
  getUserReviews: async (userId) => {
    if (USE_MOCK) {
      return mockApi.getUserReviews(userId);
    }
    return api.getUserReviews(userId);
  },

  // 获取消息列表
  getMessages: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.getMessages(userId);
    }
    return api.getNotifications();
  },

  // 标记消息已读
  markMessageRead: async (messageId) => {
    if (USE_MOCK) {
      return mockApi.markMessageRead(messageId);
    }
    return api.markNotificationRead(messageId);
  },

  // 获取用户发布的任务
  getUserPublishedTasks: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.getUserPublishedTasks(userId);
    }
    return api.myPublishedOrders();
  },

  // 获取用户接受的任务
  getUserAcceptedTasks: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.getUserAcceptedTasks(userId);
    }
    return api.myAcceptedOrders();
  },

  // 获取用户资料
  getMyProfile: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.getMyProfile(userId);
    }
    return api.getMyProfile();
  },

  // 充值
  recharge: async ({ amount }) => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.recharge(amount, userId);
    }
    return api.recharge({ amount });
  },

  // 获取我发布的订单
  myPublishedOrders: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.myPublishedOrders(userId);
    }
    return api.myPublishedOrders();
  },

  // 获取我接取的订单
  myAcceptedOrders: async () => {
    if (USE_MOCK) {
      const userId = getCurrentUserId();
      return mockApi.myAcceptedOrders(userId);
    }
    return api.myAcceptedOrders();
  },

  // 判断当前是否在使用Mock
  isUsingMock: () => USE_MOCK
};

export default apiAdapter;
