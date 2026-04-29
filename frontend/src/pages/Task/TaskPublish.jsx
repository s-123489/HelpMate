import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskPublish.css';

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
    images: []
  });

  const categories = [
    { id: '跑腿', label: '跑腿', icon: '🏃' },
    { id: '代购', label: '代购', icon: '🛍️' },
    { id: '代拿', label: '代拿', icon: '📦' },
    { id: '代办', label: '代办', icon: '📋' }
  ];

  const quickRewards = [1, 3, 5, 10];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleQuickReward = (amount) => {
    setFormData(prev => ({
      ...prev,
      reward: prev.reward ? (parseFloat(prev.reward) + amount).toString() : amount.toString()
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('上传图片', files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('发布任务', formData);
    alert('任务发布成功！');
    navigate('/');
  };

  const handleSaveDraft = () => {
    console.log('保存草稿', formData);
    alert('已保存至草稿箱');
  };

  return (
    <div className="task-publish-container">
      <header className="publish-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 发布任务
        </button>
        <button className="draft-btn" onClick={handleSaveDraft}>
          草稿📝
        </button>
      </header>

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
              placeholder="取件地点（点击选择）"
              value={formData.pickupLocation}
              onChange={handleInputChange}
              required
            />
            <span className="arrow-icon">›</span>
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
              placeholder="送达地点（点击选择）"
              value={formData.deliveryLocation}
              onChange={handleInputChange}
              required
            />
            <span className="arrow-icon">›</span>
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
              placeholder="选择截止时间"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />
            <span className="arrow-icon">›</span>
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
              min="1"
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

        <div className="form-section">
          <label className="section-title">补充图片（选填）</label>
          <div className="image-upload-area">
            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                hidden
              />
              <div className="upload-icon">📷</div>
              <div className="upload-text">上传图片</div>
            </label>
            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                hidden
              />
              <div className="upload-icon">➕</div>
              <div className="upload-text">添加图片</div>
            </label>
          </div>
        </div>

        <button type="submit" className="publish-btn">
          发布任务
        </button>
      </form>
    </div>
  );
};

export default TaskPublish;
