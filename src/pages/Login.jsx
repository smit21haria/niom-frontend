import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, setToken } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(password);
      if (res?.token) {
        setToken(res.token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch(err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--footer-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--body-font)',
    }}>
      <div style={{
        background: 'var(--ivory)',
        borderRadius: '20px',
        padding: '48px 44px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.32)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: 'var(--display-font)', fontSize: '36px',
            fontWeight: 600, color: 'var(--green)', marginBottom: '8px',
          }}>Niom</div>
          <span style={{
            fontFamily: 'var(--body-font)', fontSize: '11px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--gold)', padding: '3px 12px',
            border: '1px solid rgba(184,150,90,0.5)', borderRadius: '100px',
          }}>Admin Portal</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em',
              color: 'var(--gold)', fontWeight: 600, display: 'block', marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              required
              style={{
                width: '100%', padding: '12px 16px',
                border: '1.5px solid var(--border)', borderRadius: '10px',
                fontSize: '14px', fontFamily: 'var(--body-font)',
                color: 'var(--charcoal)', background: '#fff', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '13px', color: '#c0392b',
              background: 'rgba(192,57,43,0.06)',
              border: '1px solid rgba(192,57,43,0.2)',
              borderRadius: '8px', padding: '10px 14px',
              marginBottom: '16px',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '10px', border: 'none',
              background: loading || !password ? '#c4d4d0' : 'var(--green)',
              color: 'var(--ivory)',
              fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'var(--body-font)',
            }}
            onMouseEnter={e => { if (!loading && password) e.currentTarget.style.background = 'var(--gold)'; }}
            onMouseLeave={e => { if (!loading && password) e.currentTarget.style.background = 'var(--green)'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
