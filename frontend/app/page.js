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
    try {
      await apiFetch('/vouchers', { method: 'POST', body: JSON.stringify({ value: parseFloat(value) }) });
      setValue('');
      setMessage('Voucher created.');
      loadVouchers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRedeem(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await apiFetch('/vouchers/redeem', { method: 'POST', body: JSON.stringify({ code: redeemCode }) });
      setRedeemCode('');
      setMessage(res.message);
      loadVouchers();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const statusColor = { active: '#16a34a', redeemed: '#6b7280', expired: '#dc2626' };

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>Go Voucher</h1>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.section}>
        <h2>Create Voucher</h2>
        <form onSubmit={handleCreate} style={styles.row}>
          <input style={styles.input} type="number" placeholder="Value (e.g. 10)" min="0.01" step="0.01"
            value={value} onChange={e => setValue(e.target.value)} required />
          <button style={styles.button} type="submit">Create</button>
        </form>
      </section>

      <section style={styles.section}>
        <h2>Redeem Voucher</h2>
        <form onSubmit={handleRedeem} style={styles.row}>
          <input style={styles.input} type="text" placeholder="Voucher code" value={redeemCode}
            onChange={e => setRedeemCode(e.target.value.toUpperCase())} required />
          <button style={styles.button} type="submit">Redeem</button>
        </form>
      </section>

      <section style={styles.section}>
        <h2>My Vouchers</h2>
        {vouchers.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No vouchers yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>{['Code', 'Value', 'Status', 'Created'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id}>
                  <td style={styles.td}><code>{v.code}</code></td>
                  <td style={styles.td}>{v.value}</td>
                  <td style={{ ...styles.td, color: statusColor[v.status], fontWeight: 600 }}>{v.status}</td>
                  <td style={styles.td}>{new Date(v.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: { maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  section: { marginBottom: 32 },
  row: { display: 'flex', gap: 8 },
  input: { flex: 1, padding: '10px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 6 },
  button: { padding: '10px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  logoutBtn: { padding: '6px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #e5e7eb', fontSize: 13 },
  td: { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  success: { color: '#16a34a', background: '#f0fdf4', padding: '8px 12px', borderRadius: 6 },
  error: { color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 6 },
};
