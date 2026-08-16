import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  isAuthenticated, 
  verifyOTP as apiVerifyOTP,
  getCurrentUser as apiGetCurrentUser
} from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // hasFetched ref — prevents duplicate calls if component re-renders before cleanup
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const initAuth = async () => {
      // Restore user from cache immediately (avoids flicker)
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      // Validate session with server using httpOnly cookie
      try {
        const freshUser = await apiGetCurrentUser();
        if (freshUser) {
          const normalizedUser = { _id: freshUser._id, name: freshUser.name, email: freshUser.email, isAdmin: freshUser.isAdmin };
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Session validation failed:', e);
        // Keep cached user on network error — might be offline
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    const userData = { _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('auth-change'));
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const data = await apiVerifyOTP(email, otp);
    // After verification, we fetch the full user object
    try {
      const userData = await apiGetCurrentUser();
      if (userData) {
        const normalizedUser = { _id: userData._id, name: userData.name, email: userData.email, isAdmin: userData.isAdmin };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    } catch (e) {
      console.error("Failed to fetch user after OTP verification", e);
    }
    window.dispatchEvent(new Event('auth-change'));
    return data;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('current_resume_v1');
    window.dispatchEvent(new Event('auth-change'));
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyOTP, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
