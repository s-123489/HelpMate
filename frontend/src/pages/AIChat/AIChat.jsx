import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIChat.css';
import api from '../../services/api';

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ===== 原有逻辑不变 =====
  const quickQuestions = [
    '如何发布任务？',
    '如何接取任务？',
    '任务奖励如何结算？',
    '如何联系发布者？'
  ];

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: '你好！我是HelpMate智能客服助手 🤖\n\n我可以帮你解答关于平台使用的各种问题，比如：\n• 如何发布和接取任务\n• 任务奖励和结算规则\n• 平台功能使用指南\n\n有什么我可以帮助你的吗？',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.aiChat(inputValue);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <div className="chat-title">
          <div className="ai-avatar">🤖</div>
          <div className="chat-title-text">
            <span className="chat-title-name">智能客服</span>
            <span className="chat-title-status">
              <span className="status-dot" />
              在线
            </span>
          </div>
        </div>
        <div className="header-placeholder" />
      </header>

      <div className="chat-content">
        <div className="messages-list">
          {messages.map(message => (
            <div key={message.id} className={`message-item ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>
                <div className="message-time">{message.timestamp}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-item ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 仅首条消息时显示快捷问题，逻辑不变 */}
        {messages.length === 1 && (
          <div className="quick-questions">
            <div className="quick-title">⚡ 常见问题</div>
            <div className="quick-buttons">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            placeholder="输入你的问题..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            maxLength={500}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;