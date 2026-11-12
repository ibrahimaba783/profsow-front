import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

const pickUserState = (data) => ({
  _id: data._id,
  name: data.name,
  email: data.email,
  role: data.role,
  isActive: data.isActive !== false,
  phone: data.phone || '',
  title: data.title || '',
  avatar: data.avatar,
  bio: data.bio || '',
  subjects: data.subjects || [],
  levels: data.levels || [],
  preferences: data.preferences || {
    emailNotifications: true,
    liveReminders: true,
    newsletter: false,
  },
  createdAt: data.createdAt,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Réveiller le serveur Render en arrière-plan dès l'arrivée sur le site
        api('/health').catch(() => {});
        setLoading(false);
        return;
      }

      try {
        const userData = await api('/auth/profile');
        setUser(pickUserState(userData));
      } catch (err) {
        console.error('Session expirée ou invalide', err);
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
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    localStorage.setItem('token', data.token);
    setUser(pickUserState(data));
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      }),
    });

    localStorage.setItem('token', data.token);
    setUser(pickUserState(data));
    return data;
  };

  const googleLogin = async (credential) => {
    const data = await api('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    localStorage.setItem('token', data.token);
    setUser(pickUserState(data));
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

    setUser(pickUserState(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
