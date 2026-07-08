import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await api('/auth/profile');
        setUser(userData);
      } catch (err) {
        console.error("Session expirée ou invalide", err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('token', data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      bio: data.bio,
      subjects: data.subjects,
      levels: data.levels,
    });
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    localStorage.setItem('token', data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      bio: data.bio,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const data = await api('/auth/profile', {
      method: 'PUT',
      body: formData, // FormData pour l'avatar
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      bio: data.bio,
      subjects: data.subjects,
      levels: data.levels,
    });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
