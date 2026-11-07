import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import * as authApi from '../features/auth/services/authApi';
import {
  getRefreshToken,
  removeRefreshToken,
  saveRefreshToken,
} from '../features/auth/services/tokenStorage';
import {
  setAccessToken as setApiAccessToken,
  setRefreshHandler,
} from '../services/apiClient';

export const AuthContext = createContext(null);

const STARTUP_SCREEN_MINIMUM_MS = 2000;
const STARTUP_SESSION_TIMEOUT_MS = 8000;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(async (session) => {
    await saveRefreshToken(session.refreshToken);
    setApiAccessToken(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const clearSession = useCallback(async () => {
    setApiAccessToken(null);
    setAccessToken(null);
    setUser(null);
    queryClient.clear();

    try {
      await removeRefreshToken();
    } catch {
      // Local auth state is still cleared if secure storage is unavailable.
    }
  }, [queryClient]);

  const refreshSession = useCallback(
    async ({ signal } = {}) => {
      try {
        const storedRefreshToken = await getRefreshToken();

        if (!storedRefreshToken) {
          return false;
        }

        const session = await authApi.refreshSession(storedRefreshToken, {
          signal,
        });
        await applySession(session);
        return true;
      } catch {
        await clearSession();
        return false;
      }
    },
    [applySession, clearSession],
  );

  useEffect(() => {
    setRefreshHandler(refreshSession);
    let active = true;
    const startupAbortController = new AbortController();

    async function initializeSession() {
      const minimumSplash = wait(STARTUP_SCREEN_MINIMUM_MS);
      const sessionRestore = refreshSession({
        signal: startupAbortController.signal,
      });
      const sessionTimeout = wait(STARTUP_SESSION_TIMEOUT_MS).then(() => {
        startupAbortController.abort();
      });

      await Promise.race([sessionRestore, sessionTimeout]);
      await minimumSplash;

      if (active) {
        setInitializing(false);
      }
    }

    initializeSession();

    return () => {
      active = false;
      startupAbortController.abort();
      setRefreshHandler(null);
    };
  }, [refreshSession]);

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials);
      await applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      const storedRefreshToken = await getRefreshToken();
      if (storedRefreshToken) {
        await authApi.logout(storedRefreshToken);
      }
    } catch {
      // A local logout still completes if the API is temporarily unreachable.
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      initializing,
      login,
      logout,
      refreshSession,
      updateUser,
      user,
    }),
    [
      accessToken,
      initializing,
      login,
      logout,
      refreshSession,
      updateUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
