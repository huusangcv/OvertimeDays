// src/context/AuthContext.jsx
// Quản lý trạng thái đăng nhập, xác thực và phân quyền Admin
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeToAuthState,
  loginWithEmail,
  logoutUser,
  getUserProfile,
  hasAnyAdmin,
  bootstrapFirstAdmin,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  // Tải profile người dùng và kiểm tra quyền admin
  const reloadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUserProfile(null);
      setNeedsBootstrap(false);
      return;
    }

    try {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
        setNeedsBootstrap(false);
      } else {
        // Kiểm tra xem hệ thống đã có admin nào chưa
        const anyAdmin = await hasAnyAdmin();
        setUserProfile(null);
        setNeedsBootstrap(!anyAdmin);
      }
    } catch (err) {
      console.error('Lỗi khi tải user profile:', err);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (currentUser) => {
      setUser(currentUser);
      await reloadProfile(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reloadProfile]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await loginWithEmail(email, password);
      await reloadProfile(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, [reloadProfile]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setNeedsBootstrap(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBootstrap = useCallback(async (extraData = {}) => {
    if (!user) throw new Error('Cần đăng nhập trước khi thiết lập Admin');
    setLoading(true);
    try {
      const profile = await bootstrapFirstAdmin(user, extraData);
      setUserProfile(profile);
      setNeedsBootstrap(false);
      return profile;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!userProfile) return false;
    return userProfile.role === 'admin' && userProfile.active !== false;
  }, [userProfile]);

  const value = useMemo(() => ({
    user,
    userProfile,
    isAdmin,
    loading,
    needsBootstrap,
    login,
    logout,
    bootstrapAdmin: handleBootstrap,
    refreshProfile: () => reloadProfile(user),
  }), [user, userProfile, isAdmin, loading, needsBootstrap, login, logout, handleBootstrap, reloadProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong <AuthProvider>');
  }
  return context;
}
