import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Login.css';
import '../styles/modernPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const hasVerified = useRef(false);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    // Prevent double call in React StrictMode
    if (hasVerified.current) return;
    
    if (token) {
      hasVerified.current = true;
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      console.log('Verifying email with token...');
      
      const response = await fetch(`${API_URL}/auth/verify-email/${verificationToken}`);
      const data = await response.json();

      console.log('Verification response:', data);

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        
        // Countdown timer
        let timeLeft = 5;
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            navigate('/login');
          }
        }, 1000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const email = prompt('Please enter your email address:');
      if (!email) {
        setResending(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="avatar-circle">
            {status === 'verifying' && (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" fill="none">
                  <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="2s" repeatCount="indefinite"/>
                </circle>
              </svg>
            )}
            {status === 'success' && (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.2"/>
                <path d="M15 20L18 23L25 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {status === 'error' && (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.2"/>
                <path d="M15 15L25 25M25 15L15 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <h1 className="login-title">Email Verification</h1>
        </div>

        <div className="login-form" style={{textAlign: 'center'}}>
          <div style={{
            padding: '20px',
            background: status === 'success' ? 'rgba(212, 237, 218, 0.9)' : status === 'error' ? 'rgba(248, 215, 218, 0.9)' : 'rgba(255, 243, 205, 0.9)',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `2px solid ${status === 'success' ? '#28a745' : status === 'error' ? '#dc3545' : '#ffc107'}`
          }}>
            <p style={{
              margin: 0,
              color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#856404',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {message}
            </p>
          </div>

          {status === 'success' && (
            <div>
              <p style={{color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px'}}>
                ✅ Verification Successful!
              </p>
              <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem'}}>
                Redirecting to login page in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <Link 
                to="/login" 
                className="signup-link" 
                style={{marginTop: '15px', display: 'inline-block'}}
              >
                Or click here to login now
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{marginTop: '20px'}}>
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="login-button"
                style={{marginBottom: '10px'}}
              >
                <span style={{ opacity: resending ? 0 : 1, transition: 'opacity 0.3s' }}>
                  RESEND VERIFICATION EMAIL
                </span>
              </button>
              
              <p style={{margin: '10px 0', color: 'rgba(255, 255, 255, 0.8)'}}>or</p>
              
              <Link to="/login" className="signup-link">
                Back to Login
              </Link>
            </div>
          )}

          {status === 'verifying' && (
            <div style={{marginTop: '20px'}}>
              <div style={{
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
