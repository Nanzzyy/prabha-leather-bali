'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { useSession } from '@/lib/admin/useSession';
import { signIn } from '@/lib/admin/queries';

export default function AdminLoginPage() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace('/admin/');
  }, [loading, session, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); setBusy(false); return; }
    if (!password) { setError('Enter your password.'); setBusy(false); return; }
    try {
      await signIn(email, password);
      router.replace('/admin/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" noValidate onSubmit={submit}>
        <h1>Praba CMS</h1>
        <p>Sign in to manage the catalog.</p>
        {error && <div className="admin-login__error">{error}</div>}
        <div className="admin-form">
          <label className="admin-field">
            <span className="admin-field__label">Email</span>
            <input type="text" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <button type="submit" className="admin-btn admin-btn--dark" disabled={busy}>
            <Icon>{busy ? 'progress_activity' : 'lock_open'}</Icon> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
