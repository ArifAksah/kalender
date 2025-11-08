import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import './Login.css';
import '../styles/modernPage.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      setMessage(result.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="avatar-circle">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z" fill="currentColor"/>
              <path d="M20 22C14.4772 22 10 25.4772 10 31V32H30V31C30 25.4772 25.5228 22 20 22Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="login-title">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#d4edda',
              border: '2px solid #28a745',
              borderRadius: '12px',
              color: '#155724',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              <span style={{fontSize: '1.2rem'}}>✓</span>
              <div>
                <div>{message}</div>
                <div style={{fontSize: '0.8rem', marginTop: '5px', opacity: 0.8}}>
                  Redirecting to login...
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-capsule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9V7C5 4.23858 7.23858 2 10 2C12.7614 2 15 4.23858 15 7V9M5 9H15M5 9H4C3.44772 9 3 9.44772 3 10V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44772 16.5523 9 16 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="form-input form-input-password"
                disabled={loading || !!message}
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
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="form-input form-input-password"
                disabled={loading || !!message}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !!message || !token}
          >
            <span style={{ opacity: loading || message ? 0 : 1, transition: 'opacity 0.3s' }}>
              RESET PASSWORD
            </span>
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            <Link to="/login" className="signup-link">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
