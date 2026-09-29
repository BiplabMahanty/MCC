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

  const refreshSession = useCallback(async () => {
    try {
      const storedRefreshToken = await getRefreshToken();

      if (!storedRefreshToken) {
        return false;
      }

      const session = await authApi.refreshSession(storedRefreshToken);
      await applySession(session);
      return true;
    } catch {
      await clearSession();
      return false;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    setRefreshHandler(refreshSession);
    let active = true;

    async function initializeSession() {
      await refreshSession();

      if (active) {
        setInitializing(false);
      }
    }

    initializeSession();

    return () => {
      active = false;
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
