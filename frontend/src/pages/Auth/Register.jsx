import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { api } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.register({
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        email: formData.email,
      });

      if (response.success) {
        alert('注册成功，请登录！');
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo-text">HelpMate</h1>
          <p className="subtitle">校园跑腿 / 互助平台</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="用户名："
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="手机号（选填）："
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="邮箱（选填）："
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="密码："
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="确认密码："
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="register-link">
          <span className="link-text">已有账号？</span>
          <button className="register-btn" onClick={handleLogin}>
            立即登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;