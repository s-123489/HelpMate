import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIChat.css';

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 快捷问题
  const quickQuestions = [
    '如何发布任务？',
    '如何接取任务？',
    '任务奖励如何结算？',
    '如何联系发布者？'
  ];

  useEffect(() => {
    // 初始欢迎消息
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

  const handleSendMessage = () => {
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

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
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

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('发布') || lowerQuestion.includes('任务')) {
      return '发布任务很简单！\n\n1. 点击首页右下角的"+ 发布任务"按钮\n2. 填写任务标题和详细描述\n3. 选择任务类型（跑腿/代购/代拿/代办）\n4. 设置取货地点和送达地点\n5. 填写任务奖励金额\n6. 点击发布即可\n\n发布后，其他用户就可以看到并接取你的任务了！';
    }

    if (lowerQuestion.includes('接取') || lowerQuestion.includes('接单')) {
      return '接取任务的步骤：\n\n1. 在首页浏览任务列表\n2. 可以通过分类筛选感兴趣的任务\n3. 点击任务卡片查看详情\n4. 确认任务信息和奖励金额\n5. 点击"接取任务"按钮\n\n接取成功后，你可以在"订单"页面查看任务进度，并与发布者沟通任务细节。';
    }

    if (lowerQuestion.includes('奖励') || lowerQuestion.includes('结算') || lowerQuestion.includes('钱')) {
      return '关于任务奖励结算：\n\n💰 结算规则：\n• 任务完成后，发布者确认完成\n• 系统自动将奖励转入接单者账户\n• 通常在确认后1-3个工作日到账\n\n💳 提现方式：\n• 在"我的"页面查看余额\n• 满足最低提现金额即可申请提现\n• 支持支付宝、微信等多种方式\n\n如有疑问，可以联系客服处理。';
    }

    if (lowerQuestion.includes('联系') || lowerQuestion.includes('沟通')) {
      return '联系发布者的方式：\n\n1. 在任务详情页面，可以看到发布者信息\n2. 接取任务后，在"订单"页面的"消息"标签中\n3. 可以直接发送消息与发布者沟通\n4. 讨论任务细节、确认地点等信息\n\n💡 温馨提示：\n• 保持礼貌友好的沟通\n• 及时回复消息\n• 如遇纠纷可联系平台客服';
    }

    return '感谢你的提问！\n\n我已经记录了你的问题。如果你需要更详细的帮助，可以：\n\n1. 查看平台使用指南\n2. 联系人工客服\n3. 在"我的"页面查看常见问题\n\n还有其他问题吗？我随时为你服务！';
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <div className="chat-title">
          <span className="ai-icon">🤖</span>
          <span>智能客服</span>
        </div>
        <div className="header-placeholder"></div>
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
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="quick-questions">
            <div className="quick-title">💡 常见问题</div>
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

      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            placeholder="输入你的问题..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
