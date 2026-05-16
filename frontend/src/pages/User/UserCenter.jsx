import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCenter.css';

const UserCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('published'); // 'published' or 'accepted'
  const [userInfo, setUserInfo] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // 模拟获取用户信息
    setTimeout(() => {
      setUserInfo({
        id: 1,
        name: '李明',
        phone: '136****1234',
        avatar: 'https://via.placeholder.com/100',
        rating: 4.9
      });
    }, 500);
  }, []);

  useEffect(() => {
    // 模拟获取任务数据
    setTasks([
      {
        id: 1,
        title: '帮我拿快递',
        reward: 5,
        status: '进行中',
        statusColor: 'blue',
        accepter: '王五',
        showContact: true
      },
      {
        id: 2,
        title: '代买午餐',
        reward: 8,
        status: '待接单',
        statusColor: 'orange',
        accepter: null,
        showContact: false
      },
      {
        id: 3,
        title: '打印文件',
        reward: 3,
        status: '已完成',
        statusColor: 'green',
        accepter: '张三',
        showContact: false
      }
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleViewDetails = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  const handleContact = (accepter) => {
    alert(`联系接单人：${accepter}`);
  };

  const handleSettings = () => {
    alert('设置功能开发中');
  };

  if (!userInfo) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="user-center-container">
      <div className="user-profile-card">
        <div className="profile-content">
          <img src={userInfo.avatar} alt={userInfo.name} className="avatar" />
          <div className="profile-info">
            <h2 className="user-name">{userInfo.name}</h2>
            <p className="user-phone">{userInfo.phone}</p>
            <div className="user-rating">
              <span className="star-icon">★</span>
              <span className="rating-value">{userInfo.rating}</span>
            </div>
          </div>
          <button className="settings-btn" onClick={handleSettings}>
            ⚙️ 设置
          </button>
        </div>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          我发布的
        </button>
        <button
          className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          我接取的
        </button>
      </div>

      <div className="tasks-section">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <span className={`status-badge ${task.statusColor}`}>
                {task.status}
              </span>
            </div>
            <div className="task-reward">
              赏金：¥{task.reward}
            </div>
            {task.accepter && (
              <div className="task-accepter">
                接单人：{task.accepter}
              </div>
            )}
            <div className="task-actions">
              <button 
                className="detail-btn" 
                onClick={() => handleViewDetails(task.id)}
              >
                查看详情
              </button>
              {task.showContact && (
                <button 
                  className="contact-btn" 
                  onClick={() => handleContact(task.accepter)}
                >
                  联系接单人
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        退出登录
      </button>
    </div>
  );
};

export default UserCenter;
