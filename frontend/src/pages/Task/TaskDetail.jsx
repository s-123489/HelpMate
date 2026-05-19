import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetail.css';
import { api } from '../../services/api';
import { getUser } from '../../utils/auth';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = getUser();

  const loadTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getTaskDetail(id);
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
    setSubmitting(true);
    try {
      await api.acceptTask(task.id);
      alert('接单成功！');
      loadTaskDetail();
    } catch (err) {
      alert(err.message || '接单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    setSubmitting(true);
    try {
      await api.completeTask(task.id);
      alert('任务已完成！');
      loadTaskDetail();
    } catch (err) {
      alert(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContact = () => {
    const phone = task.status === 0 ? task.publisherPhone : task.accepterPhone;
    if (phone) {
      alert(`联系电话：${phone}`);
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

  const statusClassMap = {
    0: 'pending',
    1: 'in-progress',
    2: 'completed',
    3: 'cancelled',
  };

  const isPublisher = currentUser && currentUser.id === task.publisherId;
  const isAccepter = currentUser && currentUser.id === task.accepterId;

  return (
    <div className="task-detail-container">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 任务详情
        </button>
      </header>

      <div className="time-status-section">
        <span className={`status-badge ${statusClassMap[task.status] || 'pending'}`}>
          {task.statusText}
        </span>
        <div className="time-info">
          <div className="time-row">
            <span className="time-label">发布时间：</span>
            <span className="time-value">
              {task.createdAt ? task.createdAt.replace('T', ' ').slice(0, 16) : '-'}
            </span>
          </div>
          <div className="time-row">
            <span className="time-label">截止时间：</span>
            <span className="time-value">{task.deadline || '-'}</span>
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
          <div className="info-content description">{task.description || '无'}</div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <span className="icon">📍</span>
            <span>取件地点：</span>
          </div>
          <div className="info-content">{task.pickupLocation || '-'}</div>
        </div>

        <div className="info-item">
          <div className="info-label">
            <span className="icon">🚚</span>
            <span>送达地点：</span>
          </div>
          <div className="info-content">{task.deliveryLocation || '-'}</div>
        </div>
      </div>

      <div className="publisher-section">
        <div className="section-header">
          <span className="icon">👤</span>
          <span className="section-title">发布者信息：</span>
        </div>

        <div className="publisher-card">
          <img
            src={task.publisherAvatar || 'https://via.placeholder.com/60'}
            alt={task.publisherName}
            className="publisher-avatar"
          />
          <div className="publisher-info">
            <div className="publisher-name">{task.publisherName || '匿名用户'}</div>
            <div className="publisher-rating">⭐ 5.0</div>
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

      {task.status === 0 && !isPublisher && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleAcceptTask} disabled={submitting}>
            {submitting ? '处理中...' : '接取任务'}
          </button>
        </div>
      )}
      {task.status === 0 && isPublisher && (
        <div className="action-section">
          <button className="accept-btn" disabled>
            这是你发布的任务
          </button>
        </div>
      )}
      {task.status === 1 && isAccepter && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleCompleteTask} disabled={submitting}>
            {submitting ? '处理中...' : '完成任务'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
