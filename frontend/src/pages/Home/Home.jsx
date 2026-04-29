import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('全部');

  const categories = ['全部', '跑腿', '代购', '代拿', '代办'];

  useEffect(() => {
    // 模拟获取任务列表
    setTasks([
      {
        id: 1,
        title: '帮我取快递',
        category: '跑腿',
        description: '帮我去菜鸟驿站取一个快递，取件码：1234',
        reward: 5,
        pickupLocation: '南门菜鸟驿站',
        deliveryLocation: '东区宿舍楼 3-201',
        publishTime: '2026.4.12',
        publisher: {
          name: '张三',
          rating: 4.8
        }
      },
      {
        id: 2,
        title: '代买午餐',
        category: '代购',
        description: '帮我买一份食堂的午餐，要米饭和红烧肉',
        reward: 8,
        pickupLocation: '学生食堂',
        deliveryLocation: '图书馆3楼',
        publishTime: '2026.4.12',
        publisher: {
          name: '李四',
          rating: 4.9
        }
      },
      {
        id: 3,
        title: '打印文件',
        category: '代办',
        description: '帮我打印20页文件，黑白即可',
        reward: 3,
        pickupLocation: '教学楼打印店',
        deliveryLocation: '宿舍4号楼',
        publishTime: '2026.4.12',
        publisher: {
          name: '王五',
          rating: 4.7
        }
      },
      {
        id: 4,
        title: '帮拿 textbooks',
        category: '代拿',
        description: '帮我从图书馆拿两本教材',
        reward: 4,
        pickupLocation: '图书馆',
        deliveryLocation: '西区教学楼 201',
        publishTime: '2026.4.12',
        publisher: {
          name: '赵六',
          rating: 4.6
        }
      }
    ]);
  }, []);

  const filteredTasks = activeCategory === '全部'
    ? tasks
    : tasks.filter(task => task.category === activeCategory);

  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  const handlePublishTask = () => {
    navigate('/task/publish');
  };

  const handleViewOrders = () => {
    navigate('/order/message');
  };

  const handleViewProfile = () => {
    navigate('/user/center');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1 className="app-title">HelpMate</h1>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => navigate('/ai/chat')}>
            🤖 客服
          </button>
          <button className="header-btn" onClick={handleViewOrders}>
            📋 订单
          </button>
          <button className="header-btn" onClick={handleViewProfile}>
            👤 我的
          </button>
        </div>
      </header>

      <div className="home-content">
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>暂无任务</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="task-card"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="task-header">
                  <span className="task-category">{task.category}</span>
                  <span className="task-reward">¥{task.reward}</span>
                </div>
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <div className="task-locations">
                  <div className="location-item">
                    <span className="location-icon">📍</span>
                    <span>{task.pickupLocation}</span>
                  </div>
                  <span className="location-arrow">→</span>
                  <div className="location-item">
                    <span className="location-icon">🚚</span>
                    <span>{task.deliveryLocation}</span>
                  </div>
                </div>
                <div className="task-footer">
                  <div className="publisher-info">
                    <span className="publisher-name">{task.publisher.name}</span>
                    <span className="publisher-rating">⭐ {task.publisher.rating}</span>
                  </div>
                  <span className="publish-time">{task.publishTime}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="floating-btn" onClick={handlePublishTask}>
        + 发布任务
      </button>
    </div>
  );
};

export default Home;
