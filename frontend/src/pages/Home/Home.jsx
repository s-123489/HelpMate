import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { api } from '../../services/api';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  return `${Math.floor(hrs / 24)}天前`;
};

const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0);
};

const Home = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['全部', '跑腿', '代购', '代拿', '代办'];

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleTaskClick = (taskId) => navigate(`/task/${taskId}`);
  const handlePublishTask = () => navigate('/task/publish');
  const handleViewOrders = () => navigate('/order/message');
  const handleViewProfile = () => navigate('/user/center');

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="app-title">HelpMate</h1>
        <nav className="header-nav">
          <button className="header-nav-btn" onClick={() => navigate('/ai/chat')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>AI客服</span>
          </button>
          <button className="header-nav-btn" onClick={handleViewOrders}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            <span>订单</span>
          </button>
          <button className="header-nav-btn" onClick={() => navigate('/chat')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1l-3 3v-3H9a2 2 0 0 1-2-2v-1"/>
              <path d="M3 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-3 3V6z"/>
            </svg>
            <span>聊天</span>
          </button>
          <button className="header-nav-btn" onClick={handleViewProfile}>
            <span className="header-nav-avatar">👤</span>
            <span>我的</span>
          </button>
        </nav>
      </header>

      <div className="home-content">
        <div className="search-bar">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state"><p>暂无任务</p></div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="task-card" onClick={() => handleTaskClick(task.id)}>
                <div className="task-header">
                  <span className="task-category">{task.category}</span>
                  <span className="task-reward">¥{task.reward}</span>
                </div>
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <div className="task-locations">
                  <div className="location-item">
                    <span className="location-icon">📍</span>
                    <span>{task.pickupLocation || task.location || '未知地点'}</span>
                  </div>
                  <span className="location-arrow">→</span>
                  <div className="location-item">
                    <span className="location-icon">🚚</span>
                    <span>{task.deliveryLocation || ''}</span>
                  </div>
                </div>
                <div className="task-footer">
                  <div className="publisher-info">
                    <div className="publisher-avatar">{getInitial(task.publisherName)}</div>
                    <span className="publisher-name">{task.publisherName || '未知用户'}</span>
                    {task.publisherRating != null && (
                      <span className="publisher-rating">★{Number(task.publisherRating).toFixed(1)}</span>
                    )}
                  </div>
                  <span className="task-time">{timeAgo(task.publishTime)}</span>
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