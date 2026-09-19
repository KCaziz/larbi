import { useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../lib/api.js';
import { AuthContext } from './auth-context.js';

// The frontend never decides who the user is: it only mirrors what the server
// says (GET /auth/me, backed by the httpOnly session cookie). Hiding a page
// here is a UX convenience — every real check happens on the API.
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });

  // Bumped by retry() to re-run the session check.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/auth/me', { signal: controller.signal })
      .then(({ user }) => setState({ status: 'authenticated', user }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({
          status: err instanceof ApiError && err.status === 401 ? 'anonymous' : 'error',
          user: null,
        });
      });
    return () => controller.abort();
  }, [attempt]);

  const value = useMemo(
    () => ({
      ...state,
      retry: () => {
        setState({ status: 'loading', user: null });
        setAttempt((n) => n + 1);
      },
      async login(credentials) {
        const { user } = await api.post('/auth/login', credentials);
        setState({ status: 'authenticated', user });
      },
      async register(data) {
        const { user } = await api.post('/auth/register', data);
        setState({ status: 'authenticated', user });
      },
      async logout() {
        // Only clear local state once the server confirmed: otherwise the UI
        // would claim "logged out" while the cookie is still valid.
        await api.post('/auth/logout');
        setState({ status: 'anonymous', user: null });
      },
      async updateAccountType(accountType) {
        try {
          const { user } = await api.patch('/auth/me', { accountType });
          setState({ status: 'authenticated', user });
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            setState({ status: 'anonymous', user: null });
          }
          throw err;
        }
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
