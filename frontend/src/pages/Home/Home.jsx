import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { api } from '../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['全部', '跑腿', '代购', '代拿', '代办'];

  useEffect(() => {
    fetchTasks();
  }, [activeCategory]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getTasks({ category: activeCategory });
      if (response.success) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('获取任务列表失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

        {error && <div className="error-message">{error}</div>}

        <div className="tasks-grid">
          {loading ? (
            <div className="empty-state"><p>加载中...</p></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state"><p>暂无任务</p></div>
          ) : (
            tasks.map(task => (
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
                    <span className="publisher-name">
                      {task.publisher?.name || task.publisherName || '未知用户'}
                    </span>
                    <span className="publisher-rating">
                      ⭐ {task.publisher?.rating || '-'}
                    </span>
                  </div>
                  <span className="publish-time">
                    {task.publishTime ? task.publishTime.slice(0, 10) : ''}
                  </span>
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