/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authRequest, ensureCsrfCookie } from '../utils/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const data = await authRequest('/api/auth/me');
    setUser(data.authenticated ? data.user : null);
    return data.user;
  }, []);

  useEffect(() => {
    Promise.all([ensureCsrfCookie(), refreshUser()])
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const signup = useCallback(async (formData) => {
    const data = await authRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (formData) => {
    const data = await authRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await authRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authRequest('/api/auth/logout', {
      method: 'POST',
      body: '{}'
    });
    setUser(null);
  }, []);

  const changePassword = useCallback(async (formData) => {
    return authRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }, []);

  const deleteAccount = useCallback(async (formData) => {
    const data = await authRequest('/api/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setUser(null);
    return data;
  }, []);

  const exportAccountData = useCallback(() => authRequest('/api/auth/data-export'), []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    signup,
    login,
    loginWithGoogle,
    logout,
    changePassword,
    deleteAccount,
    exportAccountData,
    refreshUser
  }), [user, isLoading, signup, login, loginWithGoogle, logout, changePassword, deleteAccount, exportAccountData, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
