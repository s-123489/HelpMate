import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { getUser } from '../../utils/auth';
import './ChatRoom.css';

const formatTime = (t) => {
  if (!t) return '';
  return new Date(t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const ChatRoom = () => {
  const navigate = useNavigate();
  const { userId: otherIdStr } = useParams();
  const otherId = Number(otherIdStr);
  const location = useLocation();
  const { username: otherName = '对方', taskTitle } = location.state || {};

  const currentUser = getUser();
  const myId = currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const pollingRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.getConversation(otherId);
      setMessages(res.data || []);
    } catch {
      // 静默失败，不打断用户
    }
  }, [otherId]);

  // 首次加载
  useEffect(() => {
    loadMessages().finally(() => setLoading(false));
  }, [loadMessages]);

  // 轮询（每3秒刷新一次，等待后端 SSE 推送通知时也能及时更新）
  useEffect(() => {
    pollingRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollingRef.current);
  }, [loadMessages]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || sending) return;

    // 乐观更新：先在本地显示
    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      senderId: myId,
      receiverId: otherId,
      content: text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputValue('');
    setSending(true);

    try {
      await api.sendMessage({ receiverId: otherId, content: text });
      // 发送成功后拉一次最新记录，替换乐观消息
      await loadMessages();
    } catch {
      // 失败则移除乐观消息
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInputValue(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatroom-container">
      <header className="chatroom-header">
        <button className="chatroom-back" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="chatroom-header-info">
          <span className="chatroom-header-name">{otherName}</span>
          {taskTitle && <span className="chatroom-header-task">📋 {taskTitle}</span>}
        </div>
        <div style={{ width: 36 }} />
      </header>

      <div className="chatroom-messages">
        {loading ? (
          <div className="chatroom-loading">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="chatroom-empty">发送消息开始对话吧 👋</div>
        ) : (
          messages.map((msg) => {
            const isMine = String(msg.senderId) === String(myId);
            return (
              <div key={msg.id} className={`chatroom-msg ${isMine ? 'mine' : 'theirs'}`}>
                {isMine ? (
                  <div className="chatroom-avatar mine-avatar">{getInitial(currentUser?.username)}</div>
                ) : (
                  <div className="chatroom-avatar">{getInitial(otherName)}</div>
                )}
                <div className="chatroom-msg-body">
                  <div className="chatroom-bubble">{msg.content}</div>
                  <div className="chatroom-time">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatroom-input-area">
        <textarea
          ref={inputRef}
          className="chatroom-input"
          placeholder="输入消息..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={500}
        />
        <button
          className="chatroom-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || sending}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;