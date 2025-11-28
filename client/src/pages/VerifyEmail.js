import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../components/Button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasVerified = useRef(false);
  const [status, setStatus] = useState('verifying');
  const [msg, setMsg] = useState('Verifying your email...');
  const [countdown, setCountdown] = useState(5);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (hasVerified.current) return;
    if (token) {
      hasVerified.current = true;
      verify(token);
    } else {
      setStatus('error');
      setMsg('Invalid verification link');
    }
  }, [token]);

  const verify = async (t) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-email/${t}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMsg(data.message || 'Email verified successfully!');
        let n = 5;
        const int = setInterval(() => {
          n--;
          setCountdown(n);
          if (n <= 0) {
            clearInterval(int);
            navigate('/login');
          }
        }, 1000);
      } else {
        setStatus('error');
        setMsg(data.message || 'Verification failed');
      }
    } catch {
      setStatus('error');
      setMsg('Verification failed');
    }
  };

  const handleResend = async () => {
    const email = prompt('Enter your email:');
    if (!email) return;
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      alert(data.message);
    } catch {
      alert('Failed to resend');
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            {status === 'verifying' && '⏳'}
            {status === 'success' && '✓'}
            {status === 'error' && '✕'}
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Email Verification</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-xl p-6 shadow-lg shadow-blue-100 text-center">
          <div className={`p-4 rounded-lg mb-4 ${
            status === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' :
            status === 'error' ? 'bg-red-50 border border-red-200 text-red-600' :
            'bg-amber-50 border border-amber-200 text-amber-600'
          }`}>
            {msg}
          </div>

          {status === 'verifying' && (
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          )}

          {status === 'success' && (
            <p className="text-blue-600 text-sm">
              Redirecting in {countdown}s...{' '}
              <Link to="/login" className="text-blue-700 font-medium hover:underline">Go now</Link>
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleResend} disabled={resending} className="w-full">
                {resending ? 'Sending...' : 'Resend Email'}
              </Button>
              <Link to="/login" className="text-blue-700 font-medium hover:underline text-sm block">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
