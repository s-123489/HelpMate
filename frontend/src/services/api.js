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
  // LoginVO: { token, username }
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
};

export default api;