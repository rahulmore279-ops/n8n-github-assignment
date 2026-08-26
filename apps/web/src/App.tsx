import { useEffect, useState } from 'react';
import { getCurrentUser, logout, type LoginResponse } from './api/client';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';

const SESSION_STORAGE_KEY = 'bms-session';

export function App() {
  const [session, setSession] = useState<LoginResponse | null>(() => {
    const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) as LoginResponse : null;
  });
  const [isVerifyingSession, setIsVerifyingSession] = useState(Boolean(session));

  useEffect(() => {
    if (!session) {
      setIsVerifyingSession(false);
      return;
    }

    getCurrentUser(session.token)
      .then(({ user }) => {
        const refreshedSession = { ...session, user };
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(refreshedSession));
        setSession(refreshedSession);
      })
      .catch(() => {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setSession(null);
      })
      .finally(() => setIsVerifyingSession(false));
  }, []);

  function handleLogin(nextSession: LoginResponse) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  async function handleLogout() {
    if (session?.token) {
      await logout(session.token).catch(() => undefined);
    }
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }

  if (isVerifyingSession) {
    return <main className="loading-screen">Checking your secure session...</main>;
  }

  return session ? <Dashboard session={session} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />;
}
