import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import '../styles/modernPage.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      // Show success message for 3 seconds then redirect
      setSuccess('Registration successful! Please check your email to verify your account before logging in.');
      setLoading(false);
      
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
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
          <h1 className="login-title">Sign Up</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
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
              marginBottom: '24px',
              animation: 'slideUp 0.4s ease-out'
            }}>
              <span style={{fontSize: '1.2rem'}}>✅</span>
              <div>
                <div>{success}</div>
                <div style={{fontSize: '0.8rem', marginTop: '5px', opacity: 0.8}}>
                  📧 Check your inbox (and spam folder!)
                </div>
              </div>
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
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="form-input form-input-username"
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <div className="icon-capsule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="form-input form-input-username"
                disabled={loading || success}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="form-input form-input-password"
                disabled={loading || success}
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
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="form-input form-input-password"
                disabled={loading || success}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || success}
          >
            <span style={{ opacity: loading || success ? 0 : 1, transition: 'opacity 0.3s' }}>
              SIGN UP
            </span>
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Already have account?{' '}
            <Link to="/login" className="signup-link">
              Sign in!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
