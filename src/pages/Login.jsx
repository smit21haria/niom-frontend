import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, setToken } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await auth.login(password);
      if (data?.token) {
        setToken(data.token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch(e) {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--footer-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--body-font)',
    }}>
      <div style={{
        background: 'var(--ivory)', borderRadius: '16px',
        padding: '56px 48px 48px', width: '100%', maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--display-font)', fontSize: '36px',
          fontWeight: 600, color: 'var(--green)', marginBottom: '4px',
        }}>Niom</div>
        <div style={{
          fontSize: '11px', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '40px',
        }}>Wealth Management</div>

        <form onSubmit={handleLogin}>
          {/* Password */}
          <label style={{
            display: 'block', fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500,
            marginBottom: '8px', textAlign: 'left',
          }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter your password"
            autoFocus
            style={{
              width: '100%', border: '1.5px solid var(--border)',
              borderRadius: '8px', padding: '14px 16px',
              fontFamily: 'var(--body-font)', fontSize: '15px',
              color: 'var(--charcoal)', background: 'var(--ivory)',
              outline: 'none', marginBottom: '8px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
              borderColor: error ? '#c0392b' : 'var(--border)',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px rgba(44,74,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = error ? '#c0392b' : 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />

          {/* Error */}
          <div style={{
            fontSize: '12px', color: '#c0392b', textAlign: 'left',
            marginBottom: error ? '16px' : '24px',
            minHeight: '16px',
          }}>
            {error}
          </div>

          {/* Button */}
          <button type="submit" disabled={loading || !password.trim()} style={{
            width: '100%', background: loading || !password.trim() ? '#ccc' : 'var(--green)',
            color: 'var(--ivory)', fontFamily: 'var(--body-font)',
            fontSize: '13px', fontWeight: 500, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '16px',
            border: 'none', borderRadius: '8px',
            cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => { if (!loading && password.trim()) e.currentTarget.style.background = 'var(--gold)'; }}
            onMouseLeave={e => { if (!loading && password.trim()) e.currentTarget.style.background = 'var(--green)'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
