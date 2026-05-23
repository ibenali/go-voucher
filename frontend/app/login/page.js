'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', token);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo / Brand */}
        <div style={s.brand}>
          <div style={s.logoMark}>🎟</div>
          <h1 style={s.brandName}>Go Voucher</h1>
          <p style={s.brandSub}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>!</span>
              {error}
            </div>
          )}

          <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <a href="/register" style={s.link}>Create one</a>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 16,
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  brand: {
    textAlign: 'center',
    marginBottom: 36,
  },
  logoMark: {
    fontSize: 40,
    marginBottom: 12,
  },
  brandName: {
    margin: '0 0 6px',
    fontSize: 26,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  brandSub: {
    margin: 0,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '12px 16px',
    fontSize: 15,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10,
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#fca5a5',
  },
  errorIcon: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '50%',
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  btn: {
    marginTop: 4,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
    transition: 'opacity 0.2s',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
  },
  link: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
