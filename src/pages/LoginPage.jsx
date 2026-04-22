import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Recruiter',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = response.data;
        onLogin(user, token);
      } else {
        await axios.post(`${API_BASE}/api/auth/register`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });

        // Auto-login after registration
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = loginResponse.data;
        onLogin(user, token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 HR Post-Selection Manager</h1>
          <p>Streamline your post-selection HR processes</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Recruiter">Recruiter</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Interviewer">Interviewer</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="login-footer">
          <p className="demo-info">
            Demo Credentials:
            <br />
            Email: admin@hr.com
            <br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
