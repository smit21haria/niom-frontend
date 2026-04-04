import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, setToken } from '../lib/api';

const inputStyle = {
  width: '100%', padding: '12px 16px',
  border: '1.5px solid var(--border)', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em',
  color: 'var(--gold)', fontWeight: 600, display: 'block', marginBottom: '8px',
};

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('admin');   // 'admin' | 'partner'
  const [password, setPassword] = useState('');
  const [email, setEmail]       = useState('');
  const [partnerPw, setPartnerPw] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const fi = e => (e.target.style.borderColor = 'var(--green)');
  const fb = e => (e.target.style.borderColor = 'var(--border)');

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await auth.login(password);
      if (res?.token) {
        setToken(res.token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePartnerSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !partnerPw) { setError('Email and password are required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await auth.partnerLogin(email.trim(), partnerPw);
      if (res?.token) {
        setToken(res.token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const switchTab = (t) => { setTab(t); setError(''); setPassword(''); setEmail(''); setPartnerPw(''); };

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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'var(--display-font)', fontSize: '36px',
            fontWeight: 600, color: 'var(--green)', marginBottom: '8px',
          }}>Niom</div>
          <span style={{
            fontFamily: 'var(--body-font)', fontSize: '11px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--gold)', padding: '3px 12px',
            border: '1px solid rgba(184,150,90,0.5)', borderRadius: '100px',
          }}>
            {tab === 'admin' ? 'Admin Portal' : 'Partner Portal'}
          </span>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--sage)', borderRadius: '10px',
          padding: '4px', marginBottom: '28px', gap: '4px',
        }}>
          {['admin', 'partner'].map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: '8px', borderRadius: '7px', border: 'none',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'capitalize', cursor: 'pointer',
                fontFamily: 'var(--body-font)',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? 'var(--green)' : '#8a9e96',
                boxShadow: tab === t ? '0 1px 4px rgba(44,74,62,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'admin' ? 'Admin' : 'Partner'}
            </button>
          ))}
        </div>

        {/* Admin form */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
                style={inputStyle}
                onFocus={fi} onBlur={fb}
              />
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            <SubmitButton loading={loading} disabled={loading || !password}>
              Sign In
            </SubmitButton>
          </form>
        )}

        {/* Partner form */}
        {tab === 'partner' && (
          <form onSubmit={handlePartnerSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                required
                style={inputStyle}
                onFocus={fi} onBlur={fb}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={partnerPw}
                onChange={e => setPartnerPw(e.target.value)}
                placeholder="Enter your password"
                required
                style={inputStyle}
                onFocus={fi} onBlur={fb}
              />
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            <SubmitButton loading={loading} disabled={loading || !email || !partnerPw}>
              Sign In
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div style={{
      fontSize: '13px', color: '#c0392b',
      background: 'rgba(192,57,43,0.06)',
      border: '1px solid rgba(192,57,43,0.2)',
      borderRadius: '8px', padding: '10px 14px',
      marginBottom: '16px',
    }}>
      {children}
    </div>
  );
}

function SubmitButton({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        width: '100%', padding: '13px',
        borderRadius: '10px', border: 'none',
        background: disabled ? '#c4d4d0' : 'var(--green)',
        color: 'var(--ivory)',
        fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        fontFamily: 'var(--body-font)',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--gold)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = disabled ? '#c4d4d0' : 'var(--green)'; }}
    >
      {loading ? 'Signing in...' : children}
    </button>
  );
}
