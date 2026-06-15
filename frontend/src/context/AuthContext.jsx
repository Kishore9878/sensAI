import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token and user exist in local storage on load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile on startup:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // Login Method
  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profileCompleted: res.data.profileCompleted,
      });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  // Register Method
  const signup = async (name, email, password) => {
    try {
      const res = await axiosInstance.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profileCompleted: res.data.profileCompleted,
      });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed';
      return { success: false, error: msg };
    }
  };

  // Logout Method
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile status locally
  const setProfileCompleted = (status) => {
    setUser(prevUser => prevUser ? { ...prevUser, profileCompleted: status } : null);
  };

  // Update user profile details locally
  const updateUser = (data) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        setProfileCompleted,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
