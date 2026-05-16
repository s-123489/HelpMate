// 用户认证工具函数

const TOKEN_KEY = 'helpmate_token';
const USER_KEY = 'helpmate_user';

// 保存 token
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 获取 token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// 移除 token
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// 保存用户信息
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// 获取用户信息
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// 移除用户信息
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getToken();
};

// 登出
export const logout = () => {
  removeToken();
  removeUser();
};
