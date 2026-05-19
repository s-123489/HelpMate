import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { getUser, logout } from '../../utils/auth';
import './UserCenter.css';

const getStatusMeta = (status) => {
  const statusNum = Number(status);
  if (statusNum === 0) {
    return { text: '待接单', color: 'orange' };
  }
  if (statusNum === 1) {
    return { text: '进行中', color: 'blue' };
  }
  if (statusNum === 2) {
    return { text: '已完成', color: 'green' };
  }
  if (statusNum === 3) {
    return { text: '已取消', color: 'gray' };
  }
  return { text: '未知', color: 'gray' };
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [prof, pub, acc] = await Promise.all([
          api.getMyProfile().catch(() => ({ data: null })),
          api.myPublishedOrders().catch(() => ({ data: [] })),
          api.myAcceptedOrders().catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;

        console.log('我发布的订单:', pub.data);
        console.log('我接取的订单:', acc.data);

        // 为每个订单获取任务的真实状态
        const enrichOrdersWithTaskStatus = async (orders) => {
          const enriched = await Promise.all(
            orders.map(async (order) => {
              try {
                const taskRes = await api.getTaskDetail(order.taskId);
                console.log('任务详情数据:', taskRes);
                return {
                  ...order,
                  taskStatus: taskRes.data?.status
                };
              } catch (e) {
                console.log('获取任务详情失败:', e);
                return order;
              }
            })
          );
          return enriched;
        };

        const enrichedPub = await enrichOrdersWithTaskStatus(pub.data || []);
        const enrichedAcc = await enrichOrdersWithTaskStatus(acc.data || []);

        console.log('处理后的发布订单:', enrichedPub);
        console.log('处理后的接取订单:', enrichedAcc);

        const fallback = getUser();
        setProfile(prof.data || {
          username: fallback?.username || '未登录',
          phone: '未绑定',
          balance: 0,
          avgScore: null,
          reviewCount: 0,
          avatarUrl: null,
        });
        setPublishedOrders(enrichedPub);
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

  const handleGoHome = () => navigate('/');

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      alert('请输入有效的充值金额');
      return;
    }
    try {
      console.log('充值请求:', { amount: parseFloat(rechargeAmount) });
      const result = await api.recharge({ amount: parseFloat(rechargeAmount) });
      console.log('充值结果:', result);
      alert('充值成功！');
      setShowRechargeModal(false);
      setRechargeAmount('');
      const prof = await api.getMyProfile().catch(() => ({ data: null }));
      setProfile(prof.data || profile);
    } catch (error) {
      console.error('充值失败:', error);
      alert('充值失败：' + (error.message || '未知错误'));
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  const currentList = activeTab === 'published' ? publishedOrders : acceptedOrders;

  return (
    <div className="user-center-container">
      <button className="go-home-btn" onClick={handleGoHome}>
        ← 返回主页
      </button>

      <div className="user-profile-card">
        <div className="profile-content">
          <img
            src={profile?.avatarUrl || 'https://via.placeholder.com/100'}
            alt={profile?.username}
            className="avatar"
          />
          <div className="profile-info">
            <h2 className="user-name">{profile?.username}</h2>
            <p className="user-phone">{profile?.phone || '未绑定手机号'}</p>
            <div className="user-rating">
              <span className="star-icon">★</span>
              <span className="rating-value">
                {profile?.avgScore != null ? Number(profile.avgScore).toFixed(1) : '5.0'}
              </span>
              {profile?.reviewCount > 0 && (
                <span className="review-count">（{profile.reviewCount} 条评价）</span>
              )}
            </div>
            <div className="user-balance-row">
              <span className="user-balance">
                💰 钱包余额：¥{profile?.balance != null ? Number(profile.balance).toFixed(2) : '0.00'}
              </span>
              <button className="recharge-btn" onClick={() => setShowRechargeModal(true)}>
                充值
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          我发布的（{publishedOrders.length}）
        </button>
        <button
          className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          我接取的（{acceptedOrders.length}）
        </button>
      </div>

      <div className="tasks-section">
        {currentList.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'published' ? '还没有发布过任务' : '还没有接取过任务'}
          </div>
        ) : (
          currentList.map((order) => {
            console.log('订单数据:', order);
            const displayStatus = order.taskStatus !== undefined ? order.taskStatus : order.status;
            const meta = getStatusMeta(displayStatus);
            console.log('显示状态:', displayStatus, '映射结果:', meta);
            return (
              <div key={order.id} className="task-item">
                <div className="task-header">
                  <h3 className="task-title">{order.taskTitle || `任务 #${order.taskId}`}</h3>
                  <span className={`status-badge ${meta.color}`}>{meta.text}</span>
                </div>
                <div className="task-reward">赏金：¥{order.reward}</div>
                {activeTab === 'published' && order.helperName && (
                  <div className="task-accepter">接单人：{order.helperName}</div>
                )}
                <div className="task-actions">
                  <button className="detail-btn" onClick={() => handleViewDetails(order.taskId)}>
                    查看详情
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        退出登录
      </button>

      {showRechargeModal && (
        <div className="modal-overlay" onClick={() => setShowRechargeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>充值</h3>
            <div className="recharge-form">
              <label>充值金额：</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="请输入充值金额"
                className="recharge-input"
              />
              <div className="quick-amounts">
                <button
                  className="quick-btn"
                  onClick={() => setRechargeAmount('10')}
                >
                  10元
                </button>
                <button
                  className="quick-btn"
                  onClick={() => setRechargeAmount('50')}
                >
                  50元
                </button>
                <button
                  className="quick-btn"
                  onClick={() => setRechargeAmount('100')}
                >
                  100元
                </button>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowRechargeModal(false)}>
                  取消
                </button>
                <button className="confirm-btn" onClick={handleRecharge}>
                  确认充值
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCenter;
