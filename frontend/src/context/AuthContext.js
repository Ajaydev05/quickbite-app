import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, registerUser } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);
      const { data } = await getMe();
      setUser(data.user);
    } catch { localStorage.removeItem('token'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await registerUser(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
