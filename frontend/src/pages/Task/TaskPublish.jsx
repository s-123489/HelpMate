import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskPublish.css';
import { api } from '../../services/api';

const TaskPublish = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '跑腿',
    title: '',
    description: '',
    pickupLocation: '',
    pickupDetails: '',
    deliveryLocation: '',
    deliveryDetails: '',
    deadline: '',
    reward: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: '跑腿', label: '跑腿', icon: '🏃' },
    { id: '代购', label: '代购', icon: '🛍️' },
    { id: '代拿', label: '代拿', icon: '📦' },
    { id: '代办', label: '代办', icon: '📋' }
  ];

  const quickRewards = [1, 3, 5, 10];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleQuickReward = (amount) => {
    setFormData(prev => ({
      ...prev,
      reward: prev.reward ? (parseFloat(prev.reward) + amount).toString() : amount.toString()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 把取件和送达地点合并成 location
      const location = [
        formData.pickupLocation,
        formData.pickupDetails,
        '→',
        formData.deliveryLocation,
        formData.deliveryDetails
      ].filter(Boolean).join(' ');

      const response = await api.publishTask({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        reward: parseFloat(formData.reward),
        location,
        deadline: formData.deadline,
      });

      if (response.success) {
        alert('任务发布成功！');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-publish-container">
      <header className="publish-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 发布任务
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form className="publish-form" onSubmit={handleSubmit}>
        <div className="category-section">
          <div className="category-buttons">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="section-title">任务详情</label>
          <input
            type="text"
            name="title"
            className="form-input title-input"
            placeholder="任务标题（必填）"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <div className="textarea-wrapper">
            <textarea
              name="description"
              className="form-textarea"
              placeholder="描述任务详情，越详细越容易接单"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={200}
              rows={4}
            />
            <span className="char-count">{formData.description.length}/200</span>
          </div>
        </div>

        <div className="form-section">
          <div className="location-field">
            <span className="location-icon">📍</span>
            <input
              type="text"
              name="pickupLocation"
              className="form-input location-input"
              placeholder="取件地点"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="text"
            name="pickupDetails"
            className="form-input detail-input"
            placeholder="详细"
            value={formData.pickupDetails}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-section">
          <div className="location-field">
            <span className="location-icon">🚚</span>
            <input
              type="text"
              name="deliveryLocation"
              className="form-input location-input"
              placeholder="送达地点"
              value={formData.deliveryLocation}
              onChange={handleInputChange}
              required
            />
          </div>
          <input
            type="text"
            name="deliveryDetails"
            className="form-input detail-input"
            placeholder="详细"
            value={formData.deliveryDetails}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-section">
          <label className="section-title">期望完成时间</label>
          <div className="deadline-field">
            <span className="deadline-icon">⏰</span>
            <input
              type="datetime-local"
              name="deadline"
              className="form-input deadline-input"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <label className="section-title">悬赏金额</label>
          <div className="reward-input-wrapper">
            <span className="currency-symbol">¥</span>
            <input
              type="number"
              name="reward"
              className="form-input reward-input"
              placeholder="输入金额"
              value={formData.reward}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="quick-rewards">
            {quickRewards.map(amount => (
              <button
                key={amount}
                type="button"
                className="quick-reward-btn"
                onClick={() => handleQuickReward(amount)}
              >
                +¥{amount}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="publish-btn" disabled={loading}>
          {loading ? '发布中...' : '发布任务'}
        </button>
      </form>
    </div>
  );
};

export default TaskPublish;