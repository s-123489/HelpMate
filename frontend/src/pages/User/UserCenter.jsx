import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { getUser, logout } from '../../utils/auth';
import './UserCenter.css';

const getStatusMeta = (status) => {
  // 兼容真实API（数字）和Mock（字符串）两种格式
  const s = String(status);
  if (s === '0' || s === 'pending')   return { text: '待接单', color: 'orange' };
  if (s === '1' || s === 'accepted')  return { text: '进行中', color: 'blue' };
  if (s === '2' || s === 'completed') return { text: '已完成', color: 'green' };
  if (s === '3' || s === 'cancelled') return { text: '已取消', color: 'gray' };
  return { text: '未知', color: 'gray' };
};

const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const UserCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('published');
  const [profile, setProfile] = useState(null);
  const [publishedOrders, setPublishedOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [prof, pub, acc] = await Promise.all([
          api.getMyProfile().catch(() => ({ data: null })),
          api.getMyPublishedTasks().catch(() => ({ data: [] })),  // 直接查任务表，含待接单
          api.myAcceptedOrders().catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;

        // 我发布的：后端已返回 TaskListVO，字段直接可用（id/title/status 等）
        const pubList = (pub.data || []).map(task => ({
          id: task.id,
          taskId: task.id,
          taskTitle: task.title,
          reward: task.reward,
          status: task.status,
          helperName: null,
        }));

        // 我接取的：仍需从订单数据补充任务状态
        const enrichOrdersWithTaskStatus = async (orders) => {
          const enriched = await Promise.all(
            orders.map(async (order) => {
              try {
                const taskRes = await api.getTaskDetail(order.taskId);
                return { ...order, taskStatus: taskRes.data?.status };
              } catch {
                return order;
              }
            })
          );
          return enriched;
        };
        const enrichedAcc = await enrichOrdersWithTaskStatus(acc.data || []);

        const fallback = getUser();
        setProfile(prof.data || {
          username: fallback?.username || '未登录',
          phone: '未绑定',
          balance: 0,
          avgScore: null,
          reviewCount: 0,
        });
        setPublishedOrders(pubList);
        setAcceptedOrders(enrichedAcc);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewDetails = (taskId) => navigate(`/task/${taskId}`);

  const handleOpenReviews = async () => {
    setShowReviewsModal(true);
    setReviewsLoading(true);
    try {
      const currentUser = getUser();
      const res = await api.getUserReviews(currentUser?.id || profile?.id);
      setReviews(res.data || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      alert('请输入有效的充值金额');
      return;
    }
    try {
      await api.recharge({ amount: parseFloat(rechargeAmount) });
      alert('充值成功！');
      setShowRechargeModal(false);
      setRechargeAmount('');
      const prof = await api.getMyProfile().catch(() => ({ data: null }));
      setProfile(prof.data || profile);
    } catch (error) {
      alert('充值失败：' + (error.message || '未知错误'));
    }
  };

  const maskPhone = (phone) => {
    if (!phone || phone === '未绑定') return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  if (loading) return <div className="uc-loading">加载中...</div>;

  const currentList = activeTab === 'published' ? publishedOrders : acceptedOrders;
  const rating = profile?.avgScore != null ? Number(profile.avgScore).toFixed(1) : '5.0';
  const ratingNum = parseFloat(rating);

  return (
    <div className="uc-container">
      {/* Back Button */}
      <button className="uc-back-btn" onClick={() => navigate('/')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        返回主页
      </button>

      {/* Profile Card */}
      <div className="uc-profile-card">
        {/* Avatar + Info */}
        <div className="uc-profile-top">
          <div className="uc-avatar">
            {getInitial(profile?.username)}
          </div>
          <div className="uc-profile-info">
            <h2 className="uc-name">{profile?.username}</h2>
            <p className="uc-phone">{maskPhone(profile?.phone) || '未绑定手机号'}</p>
            <div className="uc-stars" onClick={handleOpenReviews} style={{ cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`uc-star ${s <= Math.round(ratingNum) ? 'filled' : ''}`}>★</span>
              ))}
              <span className="uc-rating-val">{rating}</span>
              <span className="uc-rating-hint">查看评价 ›</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="uc-stats-row">
          <button className="uc-stat-item" onClick={() => setShowRechargeModal(true)}>
            <span className="uc-stat-value">
              ¥{profile?.balance != null ? Number(profile.balance).toFixed(2) : '0.00'}
            </span>
            <span className="uc-stat-label">钱包余额</span>
          </button>
          <div className="uc-stat-divider" />
          <div className="uc-stat-item">
            <span className="uc-stat-value">{publishedOrders.length}</span>
            <span className="uc-stat-label">发布任务</span>
          </div>
          <div className="uc-stat-divider" />
          <div className="uc-stat-item">
            <span className="uc-stat-value">{acceptedOrders.length}</span>
            <span className="uc-stat-label">接取任务</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="uc-tabs">
        <button
          className={`uc-tab ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          我发布的（{publishedOrders.length}）
        </button>
        <button
          className={`uc-tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          我接取的（{acceptedOrders.length}）
        </button>
      </div>

      {/* Task List */}
      <div className="uc-task-list">
        {currentList.length === 0 ? (
          <div className="uc-empty">
            {activeTab === 'published' ? '还没有发布过任务' : '还没有接取过任务'}
          </div>
        ) : (
          currentList.map((order) => {
            const displayStatus = order.taskStatus !== undefined ? order.taskStatus : order.status;
            const meta = getStatusMeta(displayStatus);
            return (
              <div key={order.id} className="uc-task-item">
                <div className="uc-task-header">
                  <h3 className="uc-task-title">{order.taskTitle || `任务 #${order.taskId}`}</h3>
                  <span className={`uc-badge ${meta.color}`}>{meta.text}</span>
                </div>
                <p className="uc-task-reward">赏金：¥{Number(order.reward).toFixed(2)}</p>
                {activeTab === 'published' && order.helperName && (
                  <p className="uc-task-accepter">接单人：{order.helperName}</p>
                )}
                <button
                  className="uc-detail-btn"
                  onClick={() => handleViewDetails(order.taskId)}
                >
                  查看详情
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Logout */}
      <button className="uc-logout-btn" onClick={handleLogout}>
        退出登录
      </button>

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="uc-modal-overlay" onClick={() => setShowReviewsModal(false)}>
          <div className="uc-modal uc-reviews-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="uc-modal-title">我收到的评价</h3>
            {reviewsLoading ? (
              <div className="uc-reviews-loading">加载中...</div>
            ) : reviews.length === 0 ? (
              <div className="uc-reviews-empty">暂无评价</div>
            ) : (
              <div className="uc-reviews-list">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="uc-review-item">
                    <div className="uc-review-header">
                      <div className="uc-review-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`uc-review-star ${s <= r.score ? 'filled' : ''}`}>★</span>
                        ))}
                      </div>
                      <span className="uc-review-date">
                        {r.createdAt ? String(r.createdAt).replace('T', ' ').slice(0, 16) : ''}
                      </span>
                    </div>
                    {r.content && <p className="uc-review-content">{r.content}</p>}
                    {r.reviewerName && (
                      <p className="uc-review-author">— {r.reviewerName}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="uc-cancel-btn" style={{ marginTop: 16, width: '100%' }} onClick={() => setShowReviewsModal(false)}>
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="uc-modal-overlay" onClick={() => setShowRechargeModal(false)}>
          <div className="uc-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="uc-modal-title">充值</h3>
            <div className="uc-modal-body">
              <label className="uc-modal-label">充值金额</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="请输入充值金额"
                className="uc-recharge-input"
              />
              <div className="uc-quick-amounts">
                {['10', '50', '100'].map((amt) => (
                  <button key={amt} className="uc-quick-btn" onClick={() => setRechargeAmount(amt)}>
                    {amt}元
                  </button>
                ))}
              </div>
              <div className="uc-modal-actions">
                <button className="uc-cancel-btn" onClick={() => setShowRechargeModal(false)}>取消</button>
                <button className="uc-confirm-btn" onClick={handleRecharge}>确认充值</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCenter;