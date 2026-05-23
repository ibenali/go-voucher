'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', token);
      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">Login</button>
      </form>
      <a href="/register">No account? Register</a>
    </main>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif', padding: '0 16px' },
  form: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 },
  input: { padding: '10px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 6 },
  button: { padding: '10px 12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  error: { color: 'red', fontSize: 13, margin: 0 },
};
