import { FormEvent, useState } from 'react';
import { login, type LoginResponse } from '../api/client';

type LoginPageProps = {
  onLogin: (session: LoginResponse) => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      onLogin(await login(username, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <p className="eyebrow">Hotel Banquet Management</p>
        <h1>Plan enquiries, bookings, halls, and payments from one calm workspace.</h1>
        <p>Built for front office, banquet sales, and management teams.</p>
      </section>
      <section className="login-card" aria-labelledby="login-title">
        <h2 id="login-title">Sign in</h2>
        <p>Use your assigned username and password.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" />
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
