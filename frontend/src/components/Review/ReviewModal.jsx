import { useState } from 'react';
import { api } from '../../services/api';
import './ReviewModal.css';

const ReviewModal = ({ orderId, onClose, onSuccess }) => {
  const [score, setScore] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!score || score < 1 || score > 5) {
      alert('请选择 1-5 星评分');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReview({ orderId, score, content });
      alert('评价成功，感谢你的反馈！');
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || '评价失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="review-modal-title">评价此次服务</h3>

        <div className="star-row">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              className={`star-btn ${s <= score ? 'active' : ''}`}
              onClick={() => setScore(s)}
            >
              ★
            </button>
          ))}
          <span className="score-text">{score} 星</span>
        </div>

        <textarea
          className="review-textarea"
          rows="4"
          maxLength="500"
          placeholder="说说你的真实感受（可选，最多 500 字）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="review-actions">
          <button className="btn-cancel" onClick={onClose} disabled={submitting}>
            取消
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : '提交评价'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
