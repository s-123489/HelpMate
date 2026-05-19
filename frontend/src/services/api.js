// 真实后端 API 服务
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 获取 token
const getToken = () => localStorage.getItem('helpmate_token');

// 通用请求函数
const request = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // 后端统一返回格式：{ code, message, data }
  if (data.code !== 200) {
    throw new Error(data.message || '请求失败');
  }

  return data;
};

export const api = {
  // 用户注册
  // POST /api/user/register
  // RegisterRequest: { username, password, email, phone }
  register: async (userData) => {
    await request('/user/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        email: userData.email || '',
        phone: userData.phone || '',
      }),
    });
    return { success: true, message: '注册成功' };
  },

  // 用户登录
  // POST /api/user/login
  // LoginVO: { token, userId, username }
  login: async (username, password) => {
    const data = await request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return {
      success: true,
      data: {
        token: data.data.token,
        user: {
          id: data.data.userId,
          username: data.data.username,
        },
      },
    };
  },

  // 获取任务列表
  // GET /api/task/list?page=1&size=10&category=xxx
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    params.set('page', filters.page || 1);
    params.set('size', filters.size || 10);
    if (filters.category && filters.category !== '全部') {
      params.set('category', filters.category);
    }

    const data = await request(`/task/list?${params.toString()}`);
    return {
      success: true,
      data: data.data.records || [],
    };
  },

  // 发布任务
  // POST /api/task/create
  publishTask: async (taskData) => {
    const data = await request('/task/create', {
      method: 'POST',
      body: JSON.stringify({
        title: taskData.title,
        category: taskData.category,
        description: taskData.description,
        reward: taskData.reward,
        pickupLocation: taskData.pickupLocation,
        deliveryLocation: taskData.deliveryLocation,
        deadline: taskData.deadline,
      }),
    });
    return {
      success: true,
      message: '任务发布成功',
      data: data.data,
    };
  },

  // 任务详情（develop: 返回裸 Task，不含发布者/接单人信息）
  // GET /api/task/{id}
  getTaskDetail: async (taskId) => {
    const data = await request(`/task/${taskId}`);
    return {
      success: true,
      data: data.data,
    };
  },

  // 接单
  // POST /api/order/accept  body: { taskId }
  // 返回 orderId
  acceptTask: async (taskId) => {
    const data = await request('/order/accept', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
    return { success: true, orderId: data.data };
  },

  // 完成任务（发布者操作，需传 orderId 不是 taskId）
  // POST /api/order/{orderId}/complete
  completeOrder: async (orderId) => {
    await request(`/order/${orderId}/complete`, { method: 'POST' });
    return { success: true };
  },

  // 取消订单
  // POST /api/order/{orderId}/cancel
  cancelOrder: async (orderId) => {
    await request(`/order/${orderId}/cancel`, { method: 'POST' });
    return { success: true };
  },

  // 我接的单：返回 [{ id, taskId, status, ... }]
  // GET /api/order/my-orders
  myAcceptedOrders: async () => {
    const data = await request('/order/my-orders');
    return { success: true, data: data.data || [] };
  },

  // 我发布的任务对应的订单：返回 [{ id, taskId, helperId, helperName, status, ... }]
  // GET /api/order/my-published
  myPublishedOrders: async () => {
    const data = await request('/order/my-published');
    return { success: true, data: data.data || [] };
  },

  // 取消任务（仅发布者，状态=待接单）
  // POST /api/task/{id}/cancel
  cancelTask: async (taskId) => {
    await request(`/task/${taskId}/cancel`, { method: 'POST' });
    return { success: true };
  },

  // AI 智能问答
  // POST /api/ai/chat
  aiChat: async (message) => {
    const data = await request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return {
      success: true,
      data: data.data,
    };
  },

  // 我的资料（含余额、评分）
  // GET /api/review/profile/me
  getMyProfile: async () => {
    const data = await request('/review/profile/me');
    return { success: true, data: data.data };
  },

  // 他人资料
  // GET /api/review/profile/{userId}
  getUserProfile: async (userId) => {
    const data = await request(`/review/profile/${userId}`);
    return { success: true, data: data.data };
  },

  // 某用户收到的评价
  // GET /api/review/user/{userId}
  getUserReviews: async (userId) => {
    const data = await request(`/review/user/${userId}`);
    return { success: true, data: data.data || [] };
  },

  // 提交评价
  // POST /api/review/submit  body: { orderId, score, content }
  submitReview: async ({ orderId, score, content }) => {
    await request('/review/submit', {
      method: 'POST',
      body: JSON.stringify({ orderId, score, content: content || '' }),
    });
    return { success: true };
  },

  // 钱包余额
  // GET /api/wallet/balance
  getWalletBalance: async () => {
    const data = await request('/wallet/balance');
    return { success: true, data: data.data };
  },

  // 消息列表（最近 50 条）
  // GET /api/notification/list
  getNotifications: async () => {
    const data = await request('/notification/list');
    return { success: true, data: data.data || [] };
  },

  // 标记单条已读
  markNotificationRead: async (id) => {
    await request(`/notification/${id}/read`, { method: 'POST' });
    return { success: true };
  },

  // 全部已读
  markAllNotificationsRead: async () => {
    await request('/notification/read-all', { method: 'POST' });
    return { success: true };
  },

  // 充值功能
  // POST /api/wallet/recharge
  recharge: async ({ amount }) => {
    const data = await request('/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return { success: true, data: data.data };
  },
};

// 订阅 SSE 实时通知。注意：EventSource 不支持自定义 header，
// 通过 query 把 token 传给后端是常见做法；但 develop 后端要求 Authorization header，
// 因此用 fetch + ReadableStream 自行实现兼容方案。
export const subscribeNotifications = (onMessage, onError) => {
  const token = localStorage.getItem('helpmate_token');
  const controller = new AbortController();

  fetch('/api/notification/subscribe', {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'text/event-stream',
    },
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok || !response.body) {
      throw new Error(`SSE failed: ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    // 标准 SSE 帧格式：data: ...\n\n
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      for (const frame of frames) {
        const line = frame.split('\n').find(l => l.startsWith('data:'));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === 'connected') continue;
        try { onMessage(JSON.parse(payload)); }
        catch { onMessage(payload); }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError' && onError) onError(err);
  });

  return () => controller.abort();
};

export default api;