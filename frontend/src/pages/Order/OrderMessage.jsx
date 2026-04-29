import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderMessage.css';

const OrderMessage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'messages'
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);

  useEffect(() => {
    // 模拟获取订单数据
    setOrders([
      {
        id: 1,
        title: '帮我取快递',
        status: '进行中',
        publisher: '李明',
        accepter: '王五',
        reward: 5,
        createTime: '2026.4.12'
      },
      {
        id: 2,
        title: '代买午餐',
        status: '待接取',
        publisher: '李明',
        accepter: null,
        reward: 5,
        createTime: '2026.4.12'
      },
      {
        id: 3,
        title: '打印文件',
        status: '已完成',
        publisher: '李明',
        accepter: '张三',
        reward: 5,
        createTime: '2026.4.12'
      }
    ]);
  }, []);

  useEffect(() => {
    // 模拟获取消息数据
    if (activeTab === 'messages') {
      setMessages([
        {
          id: 1,
          title: '任务已被接取',
          content: '您发布的任务"帮我取快递"已被王五接取',
          time: '2026.4.12 14:30',
          read: false
        },
        {
          id: 2,
          title: '任务已完成',
          content: '您发布的任务"打印文件"已完成',
          time: '2026.4.12 13:20',
          read: false
        },
        {
          id: 3,
          title: '系统通知',
          content: '欢迎使用HelpMate，您的账号已成功注册',
          time: '2026.4.12 10:00',
          read: true
        }
      ]);
      setUnreadCount(2);
    }
  }, [activeTab]);

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
    <div className="order-message-container">
      <header className="order-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
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
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'orders' && (
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>暂无订单</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="card-header">
                  <h3 className="order-title">{order.title}</h3>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">发布者</span>
                    <span className="detail-value">{order.publisher}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">接单人</span>
                    <span className="detail-value">
                      {order.accepter || '-'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">赏金</span>
                    <span className="detail-value reward">¥{order.reward}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">创建时间</span>
                    <span className="detail-value">{order.createTime}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="messages-content">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>暂无消息</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className="message-card">
                <div className="message-header">
                  <h4 className="message-title">{message.title}</h4>
                  {!message.read && (
                    <span className="unread-dot"></span>
                  )}
                </div>
                <p className="message-content">{message.content}</p>
                <div className="message-footer">
                  <span className="message-time">{message.time}</span>
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
