import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './Login.css'; // Reusing login aesthetics

const EvaluatorLogin = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/evaluator/login`, 
        { email, pin },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        // Store basic info for header
        localStorage.setItem('evaluatorInfo', JSON.stringify(res.data.evaluator));
        navigate('/evaluator/portal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Spectrum Jury Portal</h1>
        <p className="login-subtitle">Enter your evaluator credentials to access your scoring dashboard.</p>
        
        {error && <div className="error-message" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              placeholder="evaluator@example.com"
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>6-Digit PIN</label>
            <input 
              type="password" 
              required
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', letterSpacing: '3px' }}
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            className="google-btn" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </form>

        <p className="terms-text" style={{ marginTop: '20px' }}>
          By logging in, you agree to submit fair and unbiased evaluations in accordance with event guidelines.
        </p>
      </div>
    </div>
  );
};

export default EvaluatorLogin;
