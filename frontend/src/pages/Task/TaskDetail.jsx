import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetail.css';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取任务详情
    setTimeout(() => {
      setTask({
        id: id || 1,
        title: '帮我取快递',
        category: '快递代取',
        reward: 5,
        description: '帮我去菜鸟驿站取一个快递，取件码：1234。快递是一个小包裹，不是很重。',
        pickupLocation: '南门菜鸟驿站',
        deliveryLocation: '东区宿舍楼 3-201',
        status: '待接取',
        publishTime: '2026.4.12',
        deadline: '2026.4.15',
        publisher: {
          id: 1,
          name: '张三',
          avatar: 'https://via.placeholder.com/50',
          rating: 4.8,
          completedTasks: 23
        }
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAcceptTask = () => {
    alert('接单成功！');
  };

  const handleContact = () => {
    alert('联系功能开发中');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!task) {
    return <div className="error">任务不存在</div>;
  }

  const getStatusClass = (status) => {
    const statusMap = {
      '待接取': 'pending',
      '进行中': 'in-progress',
      '已完成': 'completed',
      '已取消': 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="task-detail-container">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 任务详情
        </button>
      </header>

      <div className="time-status-section">
        <span className={`status-badge ${getStatusClass(task.status)}`}>
          {task.status}
        </span>
        <div className="time-info">
          <div className="time-row">
            <span className="time-label">发布时间：</span>
            <span className="time-value">{task.publishTime}</span>
          </div>
          <div className="time-row">
            <span className="time-label">截止时间：</span>
            <span className="time-value">{task.deadline}</span>
          </div>
        </div>
      </div>

      <div className="task-info-card">
        <div className="info-item">
          <div className="info-label">
            <span className="icon">📋</span>
            <span>任务名：</span>
          </div>
          <div className="info-content">{task.title}</div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <span className="icon">📝</span>
            <span>任务描述：</span>
          </div>
          <div className="info-content description">{task.description}</div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <span className="icon">📍</span>
            <span>取件地点：</span>
          </div>
          <div className="info-content">{task.pickupLocation}</div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <span className="icon">🚚</span>
            <span>送达地点：</span>
          </div>
          <div className="info-content">{task.deliveryLocation}</div>
        </div>
      </div>

      <div className="publisher-section">
        <div className="section-header">
          <span className="icon">👤</span>
          <span className="section-title">发布者信息：</span>
        </div>

        <div className="publisher-card">
          <img
            src={task.publisher.avatar}
            alt={task.publisher.name}
            className="publisher-avatar"
          />
          <div className="publisher-info">
            <div className="publisher-name">{task.publisher.name}</div>
            <div className="publisher-rating">
              ⭐ {task.publisher.rating}
            </div>
          </div>
          <button className="contact-btn" onClick={handleContact}>
            私信
          </button>
        </div>
      </div>

      <div className="reward-display">
        <div className="reward-badge">
          <span className="reward-symbol">¥</span>
          <span className="reward-amount">{task.reward}</span>
        </div>
        <div className="reward-label">赏金</div>
      </div>

      {task.status === '待接取' && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleAcceptTask}>
            接取任务
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
