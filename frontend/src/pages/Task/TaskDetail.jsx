import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetail.css';
import { api } from '../../services/api';
import { getUser } from '../../utils/auth';
import ReviewModal from '../../components/Review/ReviewModal';

const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [myOrder, setMyOrder] = useState(null);
  const [publishedOrder, setPublishedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const currentUser = getUser();

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const taskRes = await api.getTaskDetail(id);
      const t = taskRes.data;
      setTask(t);

      const tasks = [
        api.getUserProfile(t.publisherId).catch(() => ({ data: null })),
      ];
      if (currentUser) {
        tasks.push(
          api.myAcceptedOrders().catch(() => ({ data: [] })),
          api.myPublishedOrders().catch(() => ({ data: [] }))
        );
      }
      const [pub, accepted, published] = await Promise.all(tasks);
      setPublisher(pub.data || null);
      if (currentUser) {
        setMyOrder((accepted?.data || []).find(o => String(o.taskId) === String(id)) || null);
        setPublishedOrder((published?.data || []).find(o => String(o.taskId) === String(id)) || null);
      }
    } catch (err) {
      alert(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAcceptTask = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await api.acceptTask(task.id);
      alert('接单成功！等待发布者确认完成后赏金到账');
      loadAll();
    } catch (err) {
      alert(err.message || '接单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!publishedOrder) return;
    setSubmitting(true);
    try {
      await api.completeOrder(publishedOrder.id);
      alert('已确认完成，赏金已发放');
      loadAll();
    } catch (err) {
      alert(err.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTask = async () => {
    if (!window.confirm('确认取消此任务？赏金将退回钱包。')) return;
    setSubmitting(true);
    try {
      await api.cancelTask(task.id);
      alert('任务已取消，赏金已退还');
      loadAll();
    } catch (err) {
      alert(err.message || '取消失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactPublisher = () => {
    navigate(`/chat/${task.publisherId}`, {
      state: { username: publisherName, taskId: task.id, taskTitle: task.title }
    });
  };

  const handleContactAccepter = () => {
    navigate(`/chat/${publishedOrder.helperId}`, {
      state: { username: publishedOrder.helperName || '接单人', taskId: task.id, taskTitle: task.title }
    });
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!task) return <div className="error">任务不存在</div>;

  const statusTextMap  = { 0: '待接取', 1: '进行中', 2: '已完成', 3: '已取消' };
  const statusClassMap = { 0: 'pending', 1: 'in-progress', 2: 'completed', 3: 'cancelled' };

  const isPublisher = currentUser && currentUser.id === task.publisherId;
  const isAccepter  = myOrder != null;
  const canAccepterReview  = isAccepter && task.status === 2;
  const canPublisherReview = isPublisher && task.status === 2 && publishedOrder != null;

  // 拆分 location → pickup / delivery
  let pickup = task.location || '-';
  let delivery = '';
  if (task.location && task.location.includes('→')) {
    const parts = task.location.split('→');
    pickup   = parts[0].trim();
    delivery = parts.slice(1).join('→').trim();
  }

  const publisherName = publisher?.username || `用户 #${task.publisherId}`;

  return (
    <div className="task-detail-container">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回
        </button>
      </header>

      <div className="detail-content">

        {/* 状态 + 时间 */}
        <div className="time-status-section">
          <span className={`status-badge ${statusClassMap[task.status] || 'pending'}`}>
            {statusTextMap[task.status] || '未知'}
          </span>
          <div className="time-info">
            <div className="time-row">
              <span className="time-label">发布时间</span>
              <span className="time-value">
                {task.createdAt ? String(task.createdAt).replace('T', ' ').slice(0, 16) : '-'}
              </span>
            </div>
            <div className="time-row">
              <span className="time-label">截止时间</span>
              <span className="time-value">{task.deadline || '-'}</span>
            </div>
          </div>
        </div>

        {/* 任务信息 */}
        <div className="task-info-card">
          <h2 className="task-main-title">{task.title}</h2>
          <p className="task-main-desc">{task.description || '暂无描述'}</p>

          {/* 位置 */}
          <div className="location-block">
            <div className="location-row">
              <div className="location-icon-wrap pickup">📍</div>
              <div className="location-texts">
                <small>取件地点</small>
                <span>{pickup}</span>
              </div>
            </div>
            {delivery && (
              <>
                <div className="location-connector" />
                <div className="location-row" style={{ marginTop: 10 }}>
                  <div className="location-icon-wrap delivery">🚚</div>
                  <div className="location-texts">
                    <small>送达地点</small>
                    <span>{delivery}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 截止 + 分类 */}
          <div className="meta-grid">
            <div className="meta-item">
              <small>截止时间</small>
              <span>{task.deadline || '-'}</span>
            </div>
            <div className="meta-item">
              <small>任务分类</small>
              <span>{task.category || '-'}</span>
            </div>
          </div>
        </div>

        {/* 发布者 */}
        <div className="publisher-section">
          <div className="section-header">
            <span>👤</span> 发布者
          </div>
          <div className="publisher-card">
            <div className="publisher-avatar">
              {getInitial(publisherName)}
            </div>
            <div className="publisher-info">
              <div className="publisher-name">{publisherName}</div>
              <div className="publisher-rating">
                ★ {publisher?.avgScore != null
                  ? Number(publisher.avgScore).toFixed(1)
                  : '暂无评分'}
                {publisher?.reviewCount > 0 && (
                  <span className="review-count">（{publisher.reviewCount} 条评价）</span>
                )}
              </div>
            </div>
            {/* 接单人可联系发布者 */}
            {isAccepter && (task.status === 1 || task.status === 2) && (
              <button className="contact-btn" onClick={handleContactPublisher}>
                联系
              </button>
            )}
          </div>
        </div>

        {/* 赏金 */}
        <div className="reward-display">
          <div className="reward-left">
            <small>赏金</small>
            <div className="reward-badge">
              <span className="reward-symbol">¥</span>
              <span className="reward-amount">{task.reward}</span>
            </div>
          </div>
          <span className={`status-badge ${statusClassMap[task.status] || 'pending'}`}>
            {statusTextMap[task.status] || '未知'}
          </span>
        </div>

        {/* 操作按钮 */}
        {task.status === 0 && !isPublisher && (
          <div className="action-section">
            <button className="accept-btn" onClick={handleAcceptTask} disabled={submitting}>
              {submitting ? '处理中...' : '接取任务'}
            </button>
          </div>
        )}

        {task.status === 0 && isPublisher && (
          <div className="action-section">
            <button className="accept-btn cancel-btn" onClick={handleCancelTask} disabled={submitting}>
              {submitting ? '处理中...' : '取消任务（退还赏金）'}
            </button>
          </div>
        )}

        {task.status === 1 && isPublisher && publishedOrder && (
          <div className="action-section">
            <button className="accept-btn" onClick={handleCompleteTask} disabled={submitting}>
              {submitting ? '处理中...' : '确认完成（发放赏金）'}
            </button>
            <button className="contact-chat-btn" onClick={handleContactAccepter}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              联系接单人
            </button>
          </div>
        )}

        {task.status === 1 && isAccepter && (
          <div className="action-section">
            <button className="accept-btn" disabled>等待发布者确认完成</button>
          </div>
        )}

        {/* 接单人评价发布者 */}
        {canAccepterReview && (
          <div className="action-section">
            <button className="accept-btn" onClick={() => setReviewing('accepter')}>
              评价发布者
            </button>
          </div>
        )}

        {/* 发布者评价接单人 */}
        {canPublisherReview && (
          <div className="action-section">
            <button className="accept-btn" onClick={() => setReviewing('publisher')}>
              评价接单人
            </button>
          </div>
        )}
      </div>

      {reviewing === 'accepter' && (
        <ReviewModal
          orderId={myOrder.id}
          onClose={() => setReviewing(false)}
          onSuccess={loadAll}
        />
      )}

      {reviewing === 'publisher' && (
        <ReviewModal
          orderId={publishedOrder.id}
          onClose={() => setReviewing(false)}
          onSuccess={loadAll}
        />
      )}
    </div>
  );
};

export default TaskDetail;