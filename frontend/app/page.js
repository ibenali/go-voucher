'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [value, setValue] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      const data = await apiFetch('/vouchers');
      setVouchers(data);
    } catch {
      router.push('/login');
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setCreating(true);
    try {
      await apiFetch('/vouchers', { method: 'POST', body: JSON.stringify({ value: parseFloat(value) }) });
      setValue('');
      setMessage('Voucher created successfully.');
      loadVouchers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRedeem(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setRedeeming(true);
    try {
      const res = await apiFetch('/vouchers/redeem', { method: 'POST', body: JSON.stringify({ code: redeemCode }) });
      setRedeemCode('');
      setMessage(res.message);
      loadVouchers();
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeeming(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const activeCount = vouchers.filter(v => v.status === 'active').length;
  const redeemedCount = vouchers.filter(v => v.status === 'redeemed').length;
  const totalValue = vouchers.filter(v => v.status === 'active').reduce((s, v) => s + v.value, 0);

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <span style={s.navIcon}>🎟</span>
          <span style={s.navTitle}>Go Voucher</span>
        </div>
        <button onClick={logout} style={s.logoutBtn}>Sign out</button>
      </nav>

      <div style={s.content}>
        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { label: 'Active Vouchers', value: activeCount, color: '#a78bfa' },
            { label: 'Redeemed', value: redeemedCount, color: '#6366f1' },
            { label: 'Total Active Value', value: `$${totalValue.toFixed(2)}`, color: '#8b5cf6' },
          ].map(stat => (
            <div key={stat.label} style={s.statCard}>
              <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {message && (
          <div style={s.successBox}>
            <span>✓</span> {message}
          </div>
        )}
        {error && (
          <div style={s.errorBox}>
            <span style={s.errorIcon}>!</span> {error}
          </div>
        )}

        {/* Action cards */}
        <div style={s.actionRow}>
          {/* Create */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Create Voucher</h2>
            <p style={s.cardSub}>Generate a new voucher code with a set value.</p>
            <form onSubmit={handleCreate} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Value ($)</label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="e.g. 25"
                  min="0.01"
                  step="0.01"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  required
                />
              </div>
              <button style={{ ...s.btn, ...(creating ? s.btnDisabled : {}) }} type="submit" disabled={creating}>
                {creating ? 'Creating…' : '+ Create Voucher'}
              </button>
            </form>
          </div>

          {/* Redeem */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Redeem Voucher</h2>
            <p style={s.cardSub}>Enter a voucher code to mark it as redeemed.</p>
            <form onSubmit={handleRedeem} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Voucher Code</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g. A1B2C3D4"
                  value={redeemCode}
                  onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <button style={{ ...s.btn, ...s.btnSecondary, ...(redeeming ? s.btnDisabled : {}) }} type="submit" disabled={redeeming}>
                {redeeming ? 'Redeeming…' : 'Redeem'}
              </button>
            </form>
          </div>
        </div>

        {/* Voucher table */}
        <div style={s.tableCard}>
          <h2 style={s.cardTitle}>My Vouchers</h2>
          {vouchers.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyIcon}>🎟</p>
              <p style={s.emptyText}>No vouchers yet. Create your first one above.</p>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Code', 'Value', 'Status', 'Created'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map(v => (
                    <tr key={v.id} style={s.tr}>
                      <td style={s.td}>
                        <code style={s.code}>{v.code}</code>
                      </td>
                      <td style={s.td}><span style={s.valueChip}>${v.value.toFixed(2)}</span></td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...s.badgeColor[v.status] }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'rgba(15,12,41,0.7)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10 },
  navIcon: { fontSize: 22 },
  navTitle: { fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' },
  logoutBtn: {
    padding: '7px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  content: { maxWidth: 900, margin: '0 auto', padding: '32px 24px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '20px 24px',
    backdropFilter: 'blur(10px)',
  },
  statValue: { margin: '0 0 4px', fontSize: 28, fontWeight: 700 },
  statLabel: { margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  successBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.35)',
    borderRadius: 10, padding: '10px 16px',
    fontSize: 14, color: '#6ee7b7', marginBottom: 20,
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10, padding: '10px 16px',
    fontSize: 14, color: '#fca5a5', marginBottom: 20,
  },
  errorIcon: {
    background: '#ef4444', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '28px 28px',
    backdropFilter: 'blur(10px)',
  },
  tableCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '28px',
    backdropFilter: 'blur(10px)',
  },
  cardTitle: { margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#fff' },
  cardSub: { margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.3px' },
  input: {
    padding: '11px 14px', fontSize: 14,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 9, color: '#fff', outline: 'none',
    fontFamily: 'inherit',
  },
  btn: {
    padding: '11px', fontSize: 14, fontWeight: 600,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', border: 'none', borderRadius: 9,
    cursor: 'pointer', letterSpacing: '0.2px',
    boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    boxShadow: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyIcon: { fontSize: 36, margin: '0 0 10px' },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '10px 14px',
    fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.5px', textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '13px 14px', fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  code: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '3px 8px',
    fontSize: 13, fontFamily: 'monospace', letterSpacing: '1px',
  },
  valueChip: { fontWeight: 600, color: '#a78bfa' },
  badge: {
    padding: '3px 10px', borderRadius: 20, fontSize: 12,
    fontWeight: 600, letterSpacing: '0.3px',
  },
  badgeColor: {
    active: { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' },
    redeemed: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
    expired: { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
  },
};
