import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import Button from '../components/Button';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!email) {
      return setError('Please enter your email');
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMsg(result.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-blue-200">P</div>
          <h1 className="text-2xl font-bold text-blue-900">Forgot Password</h1>
          <p className="text-blue-600 text-sm mt-1">Enter your email to reset</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-xl p-6 shadow-lg shadow-blue-100">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-lg mb-4">{msg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>

        <p className="text-center text-blue-600 text-sm mt-6">
          <Link to="/login" className="text-blue-700 font-medium hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
