import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, subscribeNotifications } from '../../services/api';
import './OrderMessage.css';

const statusMeta = {
  0: { text: '待接单', className: 'pending' },
  1: { text: '进行中', className: 'in-progress' },
  2: { text: '已完成', className: 'completed' },
  3: { text: '已取消', className: 'cancelled' },
};

const formatTime = (t) => (t ? String(t).replace('T', ' ').slice(0, 16) : '-');

const OrderMessage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [pub, acc] = await Promise.all([
        api.myPublishedOrders().catch(() => ({ data: [] })),
        api.myAcceptedOrders().catch(() => ({ data: [] })),
      ]);
      // 合并两个列表，标记角色，按创建时间倒序
      const merged = [
        ...(pub.data || []).map((o) => ({ ...o, role: 'publisher' })),
        ...(acc.data || []).map((o) => ({ ...o, role: 'helper' })),
      ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setOrders(merged);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await api.getNotifications();
      setMessages(res.data);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadMessages();
  }, [loadOrders, loadMessages]);

  // 订阅 SSE，新消息直接 prepend 到列表
  useEffect(() => {
    const unsubscribe = subscribeNotifications(
      (payload) => {
        // 后端推送结构未严格定义，尽量兼容：可能是完整 Notification，也可能是片段
        const msg = typeof payload === 'object' && payload !== null ? payload : { content: String(payload) };
        setMessages((prev) => [
          {
            id: msg.id || Date.now(),
            title: msg.title || '新通知',
            content: msg.content || '',
            isRead: 0,
            createdAt: msg.createdAt || new Date().toISOString(),
            type: msg.type,
          },
          ...prev,
        ]);
      },
      (err) => {
        console.warn('SSE 连接异常', err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleMarkRead = async (id) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: 1 } : m)));
    try { await api.markNotificationRead(id); } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: 1 })));
    try { await api.markAllNotificationsRead(); } catch { /* ignore */ }
  };

  return (
    <div className="order-message-container">
      <header className="order-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="header-tabs">
          <button
            className={`header-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            订单进度
          </button>
          <button
            className={`header-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            消息列表
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
        </div>
      </header>

      {activeTab === 'orders' && (
        <div className="orders-content">
          {loadingOrders ? (
            <div className="empty-state"><p>加载中...</p></div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><p>暂无订单</p></div>
          ) : (
            orders.map((order) => {
              const meta = statusMeta[order.status] || { text: '未知', className: 'pending' };
              return (
                <div
                  key={`${order.role}-${order.id}`}
                  className="order-card"
                  onClick={() => navigate(`/task/${order.taskId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-header">
                    <h3 className="order-title">{order.taskTitle || `任务 #${order.taskId}`}</h3>
                    <span className={`status-badge ${meta.className}`}>{meta.text}</span>
                  </div>
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">我的角色</span>
                      <span className="detail-value">
                        {order.role === 'publisher' ? '发布者' : '接单人'}
                      </span>
                    </div>
                    {order.role === 'publisher' && order.helperName && (
                      <div className="detail-row">
                        <span className="detail-label">接单人</span>
                        <span className="detail-value">{order.helperName}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">赏金</span>
                      <span className="detail-value reward">¥{order.reward}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">创建时间</span>
                      <span className="detail-value">{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-content">
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllRead}>
              全部已读
            </button>
          )}
          {loadingMessages ? (
            <div className="empty-state"><p>加载中...</p></div>
          ) : messages.length === 0 ? (
            <div className="empty-state"><p>暂无消息</p></div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-card ${!message.isRead ? 'unread' : ''}`}
                onClick={() => !message.isRead && handleMarkRead(message.id)}
                style={{ cursor: !message.isRead ? 'pointer' : 'default' }}
              >
                <div className="message-header">
                  <h4 className="message-title">{message.title || '通知'}</h4>
                  {!message.isRead && <span className="unread-dot"></span>}
                </div>
                <p className="message-content">{message.content}</p>
                <div className="message-footer">
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrderMessage;
