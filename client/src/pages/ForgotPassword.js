import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import './Login.css';
import '../styles/modernPage.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message || 'If the email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
          <h1 className="login-title">Forgot Password</h1>
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
              {message}
            </div>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-capsule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="form-input form-input-username"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            <span style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }}>
              SEND RESET LINK
            </span>
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Remember your password?{' '}
            <Link to="/login" className="signup-link">
              Sign in!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
