import React, { useEffect, useState } from 'react';
import {
  checkHouseholdAccess, onAuthChange, signInWithGoogleAuth, signInWithPasswordAuth, signOutAuth,
} from '../../lib/supabase';
import { LoginView } from './LoginView';

export function FinanceAccess({ children }) {
  const [session, setSession] = useState(undefined);
  const [access, setAccess] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const userId = session?.user.id;

  useEffect(() => onAuthChange((next) => {
    if (!next) setAccess(null);
    setSession(next);
  }), []);

  useEffect(() => {
    if (!userId) return;
    let current = true;
    checkHouseholdAccess()
      .then((allowed) => {
        if (current) setAccess({ userId, allowed });
      })
      .catch(() => {
        if (current) setAccess({ userId, failed: true });
      });
    return () => { current = false; };
  }, [userId, attempt]);

  async function authenticate(action, errorMessage) {
    setError('');
    setPending(true);
    try {
      const { error } = await action();
      if (error) throw error;
    } catch {
      setError(errorMessage);
    } finally {
      setPending(false);
    }
  }

  async function logOut() {
    await authenticate(signOutAuth, 'Não foi possível encerrar a sessão. Tente novamente.');
  }

  if (session === undefined) return <p className="finance-status" role="status">Verificando sessão…</p>;

  if (!session) {
    return <LoginView
      loading={pending}
      error={error}
      onPasswordLogin={(email, password) => authenticate(
        () => signInWithPasswordAuth(email, password),
        'Não foi possível entrar. Confira o e-mail e a senha e tente novamente.',
      )}
      onGoogleLogin={() => authenticate(
        signInWithGoogleAuth,
        'Não foi possível iniciar a sessão com o Google. Tente novamente.',
      )}
    />;
  }

  if (access?.userId === userId && access.allowed) return children({ userId, logOut, error });

  const checked = access?.userId === userId;
  return (
    <main className="finance-status">
      {checked ? (
        <p role="alert">{access.failed
          ? 'Não foi possível verificar seu acesso. Verifique a conexão e tente novamente.'
          : 'Sua conta ainda não tem acesso a esta base financeira.'}</p>
      ) : <p role="status">Verificando acesso à base financeira…</p>}
      {checked && <button onClick={() => { setAccess(null); setAttempt((value) => value + 1); }}>Verificar acesso novamente</button>}
      <button onClick={logOut} disabled={pending}>Sair</button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
