'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
    });
    setLoading(false);
    if (res.ok) router.push('/admin');
    else setError('Invalid credentials');
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <p className="login-title">Admin Login</p>
        {error && <div className="admin-msg error">{error}</div>}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Username</label>
            <input name="username" type="text" required autoFocus />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
