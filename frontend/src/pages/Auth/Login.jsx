import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { mockApi } from '../../services/mockApi';
import { setToken, setUser } from '../../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    try {
      const response = await mockApi.login(formData.studentId, formData.password);

      if (response.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="logo-text">HelpMate</h1>
          <p className="subtitle">校园跑腿 / 互助平台</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <input
              type="text"
              name="studentId"
              className="form-input"
              placeholder="学号："
              value={formData.studentId}
              onChange={handleInputChange}
              required
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '登录中...' : '登入'}
          </button>

          <div className="demo-hint">
            <p>测试账号：2021001 密码：123456</p>
            <p>测试账号：2021002 密码：123456</p>
          </div>
        </form>

        <div className="register-link">
          <span className="link-text">还没有账号？</span>
          <button className="register-btn" onClick={handleRegister}>
            立即注册
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
