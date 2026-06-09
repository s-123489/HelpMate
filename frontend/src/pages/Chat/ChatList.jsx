import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './ChatList.css';

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const formatTime = (t) => {
  if (!t) return '';
  const d = new Date(t);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
};

const ChatList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations()
      .then(res => setConversations(res.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="chatlist-container">
      <header className="chatlist-header">
        <button className="chatlist-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="chatlist-title">消息</h1>
        <div style={{ width: 36 }} />
      </header>

      <div className="chatlist-body">
        {loading ? (
          <div className="chatlist-empty">加载中...</div>
        ) : conversations.length === 0 ? (
          <div className="chatlist-empty">
            <div className="chatlist-empty-icon">💬</div>
            <p>暂无消息</p>
            <span>接单或发布任务后可与对方联系</span>
          </div>
        ) : (
          <ul className="chatlist-list">
            {conversations.map((conv) => (
              <li
                key={conv.userId}
                className="chatlist-item"
                onClick={() => navigate(`/chat/${conv.userId}`, {
                  state: { username: conv.username, taskId: conv.taskId, taskTitle: conv.taskTitle }
                })}
              >
                <div className="chatlist-avatar">
                  {getInitial(conv.username)}
                  {conv.unreadCount > 0 && (
                    <span className="chatlist-badge">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="chatlist-info">
                  <div className="chatlist-row">
                    <span className="chatlist-name">{conv.username}</span>
                    <span className="chatlist-time">{formatTime(conv.lastTime)}</span>
                  </div>
                  <div className="chatlist-row">
                    <span className="chatlist-preview">{conv.lastMessage}</span>
                    {conv.taskTitle && (
                      <span className="chatlist-tag">{conv.taskTitle}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;