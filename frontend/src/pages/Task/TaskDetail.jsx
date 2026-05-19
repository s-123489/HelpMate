import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetail.css';
import { api } from '../../services/api';
import { getUser } from '../../utils/auth';
import ReviewModal from '../../components/Review/ReviewModal';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [publisher, setPublisher] = useState(null); // 发布者 profile（含评分）
  const [myOrder, setMyOrder] = useState(null);      // 我作为接单人
  const [publishedOrder, setPublishedOrder] = useState(null); // 我作为发布者
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

      // 并行：发布者资料、我接的单、我发布的订单
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

  if (loading) return <div className="loading">加载中...</div>;
  if (!task) return <div className="error">任务不存在</div>;

  const statusTextMap = { 0: '待接取', 1: '进行中', 2: '已完成', 3: '已取消' };
  const statusClassMap = { 0: 'pending', 1: 'in-progress', 2: 'completed', 3: 'cancelled' };

  const isPublisher = currentUser && currentUser.id === task.publisherId;
  const isAccepter = myOrder != null;
  // 仅接单人在订单完成后可评价发布者；评价是否做过这里无法直接判断，简单允许"重试"由后端拦
  const canReview = isAccepter && myOrder.status === 1;

  let pickup = task.location;
  let delivery = '';
  if (task.location && task.location.includes('→')) {
    const parts = task.location.split('→');
    pickup = parts[0].trim();
    delivery = parts.slice(1).join('→').trim();
  }

  return (
    <div className="task-detail-container">
      <header className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 任务详情
        </button>
      </header>

      <div className="time-status-section">
        <span className={`status-badge ${statusClassMap[task.status] || 'pending'}`}>
          {statusTextMap[task.status] || '未知'}
        </span>
        <div className="time-info">
          <div className="time-row">
            <span className="time-label">发布时间：</span>
            <span className="time-value">
              {task.createdAt ? String(task.createdAt).replace('T', ' ').slice(0, 16) : '-'}
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
          <div className="info-label"><span className="icon">📋</span><span>任务名：</span></div>
          <div className="info-content">{task.title}</div>
        </div>
        <div className="info-item">
          <div className="info-label"><span className="icon">📝</span><span>任务描述：</span></div>
          <div className="info-content description">{task.description || '无'}</div>
        </div>
        <div className="info-item">
          <div className="info-label"><span className="icon">📍</span><span>取件地点：</span></div>
          <div className="info-content">{pickup || '-'}</div>
        </div>
        {delivery && (
          <div className="info-item">
            <div className="info-label"><span className="icon">🚚</span><span>送达地点：</span></div>
            <div className="info-content">{delivery}</div>
          </div>
        )}
      </div>

      <div className="publisher-section">
        <div className="section-header">
          <span className="icon">👤</span>
          <span className="section-title">发布者：</span>
        </div>
        <div className="publisher-card">
          <img
            src={publisher?.avatarUrl || 'https://via.placeholder.com/60'}
            alt={publisher?.username || ''}
            className="publisher-avatar"
          />
          <div className="publisher-info">
            <div className="publisher-name">
              {publisher?.username || `用户 #${task.publisherId}`}
            </div>
            <div className="publisher-rating">
              ⭐ {publisher?.avgScore != null ? Number(publisher.avgScore).toFixed(1) : '暂无评分'}
              {publisher?.reviewCount > 0 && (
                <span className="review-count">（{publisher.reviewCount} 条评价）</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="reward-display">
        <div className="reward-badge">
          <span className="reward-symbol">¥</span>
          <span className="reward-amount">{task.reward}</span>
        </div>
        <div className="reward-label">赏金</div>
      </div>

      {/* 待接取 + 路人 → 接取按钮 */}
      {task.status === 0 && !isPublisher && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleAcceptTask} disabled={submitting}>
            {submitting ? '处理中...' : '接取任务'}
          </button>
        </div>
      )}

      {/* 待接取 + 发布者 → 取消按钮 */}
      {task.status === 0 && isPublisher && (
        <div className="action-section">
          <button className="accept-btn cancel-btn" onClick={handleCancelTask} disabled={submitting}>
            {submitting ? '处理中...' : '取消任务（退还赏金）'}
          </button>
        </div>
      )}

      {/* 进行中 + 发布者 → 确认完成 */}
      {task.status === 1 && isPublisher && publishedOrder && (
        <div className="action-section">
          <button className="accept-btn" onClick={handleCompleteTask} disabled={submitting}>
            {submitting ? '处理中...' : '确认完成（发放赏金）'}
          </button>
        </div>
      )}

      {/* 进行中 + 接单人 → 等待 */}
      {task.status === 1 && isAccepter && (
        <div className="action-section">
          <button className="accept-btn" disabled>等待发布者确认完成</button>
        </div>
      )}

      {/* 已完成 + 接单人 → 评价 */}
      {task.status === 2 && canReview && (
        <div className="action-section">
          <button className="accept-btn" onClick={() => setReviewing(true)}>
            评价发布者
          </button>
        </div>
      )}

      {reviewing && (
        <ReviewModal
          orderId={myOrder.id}
          onClose={() => setReviewing(false)}
          onSuccess={loadAll}
        />
      )}
    </div>
  );
};

export default TaskDetail;
