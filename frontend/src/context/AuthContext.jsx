import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
      setAuthChecked(true);
    }
    loadUser();
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    const res = await api.login({ email, password });
    if (res.success && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
    }
    setLoading(false);
    return res;
  };

  const registerUser = async (username, email, password, avatar) => {
    setLoading(true);
    const res = await api.register({ username, email, password, avatar });
    if (res.success && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
    }
    setLoading(false);
    return res;
  };

  const updateUserProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authChecked,
      loginUser,
      registerUser,
      updateUserProfile,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
