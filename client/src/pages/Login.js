import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import exmineLogo from '../assets/exmine-logo.png';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed. Please try again.');
      
      // Show resend verification button if email not verified
      if (result.message && result.message.includes('verify your email')) {
        setShowResendVerification(true);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <img src={exmineLogo} alt="Exmine" className="login-logo" />
          </div>
          <p className="login-subtitle">Track your daily progress</p>
          <h1 className="login-title">Exmine Progres Tracker</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-capsule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z" fill="white"/>
                  <path d="M10 11C7.23858 11 5 12.7386 5 15.5V16H15V15.5C15 12.7386 12.7614 11 10 11Z" fill="white"/>
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="form-input form-input-username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-capsule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9V7C5 4.23858 7.23858 2 10 2C12.7614 2 15 4.23858 15 7V9M5 9H15M5 9H4C3.44772 9 3 9.44772 3 10V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44772 16.5523 9 16 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="form-input form-input-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4C6 4 3.27 6.11 1.82 9.5C3.27 12.89 6 15 10 15C14 15 16.73 12.89 18.18 9.5C16.73 6.11 14 4 10 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L19 19M10 4C6 4 3.27 6.11 1.82 9.5C2.42 10.87 3.31 12.11 4.41 13.11M10 15C10.96 15 11.89 14.84 12.76 14.55M15.18 12.89C16.23 12.11 17.14 11.11 17.82 9.5C16.73 6.11 14 4 10 4C9.58 4 9.17 4.03 8.77 4.08M6.53 6.53C5.75 7.31 5.25 8.32 5.09 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-label">Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <span style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}>
              LOGIN
            </span>
          </button>

          {showResendVerification && (
            <div style={{marginTop: '15px', textAlign: 'center'}}>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '10px'}}>
                Didn't receive the email?
              </p>
              <Link to="/verify-email" className="link">
                Resend verification email
              </Link>
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="register-link">
            Don't have account?{' '}
            <Link to="/register" className="signup-link">
              Sign up!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
