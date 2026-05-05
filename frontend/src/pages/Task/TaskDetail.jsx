import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetail.css';
import { mockApi } from '../../services/mockApi';
import { getUser } from '../../utils/auth';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();

  const loadTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mockApi.getTaskDetail(id);
      if (response.success) {
        setTask(response.data);
      }
    } catch (err) {
      alert(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  const handleAcceptTask = async () => {
    if (!currentUser) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    try {
      const response = await mockApi.acceptTask(task.id, currentUser.id);
      if (response.success) {
        alert('接单成功！');
        loadTaskDetail(); // 重新加载任务详情
      }
    } catch (err) {
      alert(err.message || '接单失败');
    }
  };

  const handleCompleteTask = async () => {
    try {
      const response = await mockApi.completeTask(task.id);
      if (response.success) {
        alert('任务已完成！');
        loadTaskDetail();
      }
    } catch (err) {
      alert(err.message || '操作失败');
    }
  };

  const handleContact = () => {
    const contactPerson = task.status === 'pending' ? task.publisher : task.accepter;
    if (contactPerson && contactPerson.phone) {
      alert(`联系电话：${contactPerson.phone}`);
    } else {
      alert('联系方式不可用');
    }
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
      {task.status === '进行中' && currentUser && task.accepterId === currentUser.id && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleCompleteTask}>
            完成任务
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
