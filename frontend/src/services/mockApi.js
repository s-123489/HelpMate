// Mock API 服务 - 模拟后端接口

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据库
let users = [
  {
    id: 1,
    studentId: '2021001',
    name: '张三',
    password: '123456',
    phone: '13800138000',
    points: 100,
    creditScore: 4.8,
    avatar: '👤'
  },
  {
    id: 2,
    studentId: '2021002',
    name: '李四',
    password: '123456',
    phone: '13800138001',
    points: 150,
    creditScore: 4.9,
    avatar: '👤'
  }
];

// 模拟任务数据库
let tasks = [
  {
    id: 1,
    title: '帮我取快递',
    category: '跑腿',
    description: '帮我去菜鸟驿站取一个快递，取件码：1234',
    reward: 5,
    pickupLocation: '南门菜鸟驿站',
    pickupDetails: '菜鸟驿站3号窗口',
    deliveryLocation: '东区宿舍楼 3-201',
    deliveryDetails: '宿舍门口即可',
    deadline: '2026-04-23T18:00',
    publishTime: '2026-04-22T10:00',
    status: 'pending', // pending, accepted, completed, cancelled
    publisherId: 1,
    accepterId: null,
    images: []
  },
  {
    id: 2,
    title: '代买午餐',
    category: '代购',
    description: '帮我买一份食堂的午餐，要米饭和红烧肉',
    reward: 8,
    pickupLocation: '学生食堂',
    pickupDetails: '二楼窗口',
    deliveryLocation: '图书馆3楼',
    deliveryDetails: '自习区A区',
    deadline: '2026-04-22T12:30',
    publishTime: '2026-04-22T11:00',
    status: 'accepted',
    publisherId: 2,
    accepterId: 1,
    images: []
  },
  {
    id: 3,
    title: '打印文件',
    category: '代办',
    description: '帮我打印20页文件，黑白即可',
    reward: 3,
    pickupLocation: '教学楼打印店',
    pickupDetails: '一楼打印店',
    deliveryLocation: '宿舍4号楼',
    deliveryDetails: '4-305',
    deadline: '2026-04-23T16:00',
    publishTime: '2026-04-22T09:00',
    status: 'pending',
    publisherId: 1,
    accepterId: null,
    images: []
  },
  {
    id: 4,
    title: '帮拿教材',
    category: '代拿',
    description: '帮我从图书馆拿两本教材',
    reward: 4,
    pickupLocation: '图书馆',
    pickupDetails: '二楼借阅处',
    deliveryLocation: '西区教学楼 201',
    deliveryDetails: '教室门口',
    deadline: '2026-04-23T14:00',
    publishTime: '2026-04-22T08:30',
    status: 'completed',
    publisherId: 2,
    accepterId: 1,
    images: []
  }
];

// 模拟评价数据库
let reviews = [
  {
    id: 1,
    taskId: 4,
    reviewerId: 2,
    revieweeId: 1,
    rating: 5,
    comment: '非常准时，服务态度好！',
    createTime: '2026-04-22T15:00'
  }
];

// 模拟消息数据库
let messages = [
  {
    id: 1,
    userId: 1,
    type: 'task_accepted',
    title: '任务被接受',
    content: '你发布的任务"代买午餐"已被李四接受',
    taskId: 2,
    isRead: false,
    createTime: '2026-04-22T11:30'
  },
  {
    id: 2,
    userId: 1,
    type: 'task_completed',
    title: '任务已完成',
    content: '你接受的任务"帮拿教材"已完成，请评价',
    taskId: 4,
    isRead: false,
    createTime: '2026-04-22T14:30'
  }
];

// 用户认证相关
export const mockApi = {
  // 用户注册
  register: async (userData) => {
    await delay();

    // 检查学号是否已存在
    if (users.find(u => u.studentId === userData.studentId)) {
      throw new Error('该学号已被注册');
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      points: 100,
      creditScore: 5.0,
      avatar: '👤'
    };

    users.push(newUser);

    return {
      success: true,
      message: '注册成功',
      data: {
        token: `mock_token_${newUser.id}`,
        user: { ...newUser, password: undefined }
      }
    };
  },

  // 用户登录
  login: async (studentId, password) => {
    await delay();

    const user = users.find(u => u.studentId === studentId);

    if (!user) {
      throw new Error('学号不存在');
    }

    if (user.password !== password) {
      throw new Error('密码错误');
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        token: `mock_token_${user.id}`,
        user: { ...user, password: undefined }
      }
    };
  },

  // 获取当前用户信息
  getCurrentUser: async (token) => {
    await delay(200);

    const userId = parseInt(token.replace('mock_token_', ''));
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      success: true,
      data: { ...user, password: undefined }
    };
  },

  // 任务相关
  // 获取任务列表
  getTasks: async (filters = {}) => {
    await delay(300);

    let filteredTasks = [...tasks];

    // 按分类筛选
    if (filters.category && filters.category !== '全部') {
      filteredTasks = filteredTasks.filter(t => t.category === filters.category);
    }

    // 按状态筛选
    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filters.status);
    }

    // 搜索
    if (filters.keyword) {
      filteredTasks = filteredTasks.filter(t =>
        t.title.includes(filters.keyword) ||
        t.description.includes(filters.keyword)
      );
    }

    // 添加发布者信息
    const tasksWithPublisher = filteredTasks.map(task => {
      const publisher = users.find(u => u.id === task.publisherId);
      return {
        ...task,
        publisher: publisher ? {
          id: publisher.id,
          name: publisher.name,
          rating: publisher.creditScore,
          avatar: publisher.avatar
        } : null
      };
    });

    return {
      success: true,
      data: tasksWithPublisher
    };
  },

  // 获取任务详情
  getTaskDetail: async (taskId) => {
    await delay(300);

    const task = tasks.find(t => t.id === parseInt(taskId));

    if (!task) {
      throw new Error('任务不存在');
    }

    const publisher = users.find(u => u.id === task.publisherId);
    const accepter = task.accepterId ? users.find(u => u.id === task.accepterId) : null;

    return {
      success: true,
      data: {
        ...task,
        publisher: publisher ? {
          id: publisher.id,
          name: publisher.name,
          rating: publisher.creditScore,
          avatar: publisher.avatar,
          phone: publisher.phone
        } : null,
        accepter: accepter ? {
          id: accepter.id,
          name: accepter.name,
          rating: accepter.creditScore,
          avatar: accepter.avatar,
          phone: accepter.phone
        } : null
      }
    };
  },

  // 发布任务
  publishTask: async (taskData, userId) => {
    await delay();

    const newTask = {
      id: tasks.length + 1,
      ...taskData,
      publishTime: new Date().toISOString(),
      status: 'pending',
      publisherId: userId,
      accepterId: null,
      images: taskData.images || []
    };

    tasks.push(newTask);

    return {
      success: true,
      message: '任务发布成功',
      data: newTask
    };
  },

  // 接受任务
  acceptTask: async (taskId, userId) => {
    await delay();

    const task = tasks.find(t => t.id === parseInt(taskId));

    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.status !== 'pending') {
      throw new Error('任务已被接受或已完成');
    }

    if (task.publisherId === userId) {
      throw new Error('不能接受自己发布的任务');
    }

    task.status = 'accepted';
    task.accepterId = userId;

    // 添加消息通知
    const accepter = users.find(u => u.id === userId);

    messages.push({
      id: messages.length + 1,
      userId: task.publisherId,
      type: 'task_accepted',
      title: '任务被接受',
      content: `你发布的任务"${task.title}"已被${accepter.name}接受`,
      taskId: task.id,
      isRead: false,
      createTime: new Date().toISOString()
    });

    return {
      success: true,
      message: '接受任务成功',
      data: task
    };
  },

  // 完成任务
  completeTask: async (taskId) => {
    await delay();

    const task = tasks.find(t => t.id === parseInt(taskId));

    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.status !== 'accepted') {
      throw new Error('任务状态不正确');
    }

    task.status = 'completed';

    // 添加消息通知
    messages.push({
      id: messages.length + 1,
      userId: task.accepterId,
      type: 'task_completed',
      title: '任务已完成',
      content: `你接受的任务"${task.title}"已完成，请评价`,
      taskId: task.id,
      isRead: false,
      createTime: new Date().toISOString()
    });

    return {
      success: true,
      message: '任务已完成',
      data: task
    };
  },

  // 取消任务
  cancelTask: async (taskId) => {
    await delay();

    const task = tasks.find(t => t.id === parseInt(taskId));

    if (!task) {
      throw new Error('任务不存在');
    }

    task.status = 'cancelled';

    return {
      success: true,
      message: '任务已取消',
      data: task
    };
  },

  // 评价相关
  // 提交评价
  submitReview: async (reviewData) => {
    await delay();

    const newReview = {
      id: reviews.length + 1,
      ...reviewData,
      createTime: new Date().toISOString()
    };

    reviews.push(newReview);

    // 更新被评价用户的信用分
    const user = users.find(u => u.id === reviewData.revieweeId);
    if (user) {
      const userReviews = reviews.filter(r => r.revieweeId === user.id);
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      user.creditScore = Math.round(avgRating * 10) / 10;
    }

    return {
      success: true,
      message: '评价成功',
      data: newReview
    };
  },

  // 获取用户评价列表
  getUserReviews: async (userId) => {
    await delay(200);

    const userReviews = reviews.filter(r => r.revieweeId === userId);

    const reviewsWithReviewer = userReviews.map(review => {
      const reviewer = users.find(u => u.id === review.reviewerId);
      const task = tasks.find(t => t.id === review.taskId);
      return {
        ...review,
        reviewer: reviewer ? {
          name: reviewer.name,
          avatar: reviewer.avatar
        } : null,
        task: task ? {
          title: task.title
        } : null
      };
    });

    return {
      success: true,
      data: reviewsWithReviewer
    };
  },

  // 消息相关
  // 获取消息列表
  getMessages: async (userId) => {
    await delay(200);

    const userMessages = messages.filter(m => m.userId === userId);

    return {
      success: true,
      data: userMessages.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    };
  },

  // 标记消息已读
  markMessageRead: async (messageId) => {
    await delay(100);

    const message = messages.find(m => m.id === messageId);

    if (message) {
      message.isRead = true;
    }

    return {
      success: true,
      data: message
    };
  },

  // 获取用户发布的任务
  getUserPublishedTasks: async (userId) => {
    await delay(200);

    const userTasks = tasks.filter(t => t.publisherId === userId);

    return {
      success: true,
      data: userTasks
    };
  },

  // 获取用户接受的任务
  getUserAcceptedTasks: async (userId) => {
    await delay(200);

    const userTasks = tasks.filter(t => t.accepterId === userId);

    return {
      success: true,
      data: userTasks
    };
  }
};

export default mockApi;
