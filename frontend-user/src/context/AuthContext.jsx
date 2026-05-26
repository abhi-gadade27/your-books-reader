import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Dynamically resolve API URL to support testing from mobile phones on the same network
export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `http://${window.location.hostname}:5000/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yb_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [rememberMe, setRememberMe] = useState(true);

  // Auto-fetch profile if token is present
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          fetchNotifications(token);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const fetchNotifications = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${authToken || token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (rememberMe) {
      localStorage.setItem('yb_token', data.token);
    }
    setToken(data.token);
    setUser(data.user);
    fetchNotifications(data.token);
    return data.user;
  };

  const signup = async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    if (rememberMe) {
      localStorage.setItem('yb_token', data.token);
    }
    setToken(data.token);
    setUser(data.user);
    fetchNotifications(data.token);
    return data.user;
  };

  const sendPhoneOtp = async (phoneNumber) => {
    const res = await fetch(`${API_URL}/auth/phone-send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  };

  const verifyPhoneOtp = async (phoneNumber, otp, username) => {
    const res = await fetch(`${API_URL}/auth/phone-verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, otp, username })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }
    
    if (data.isNewUser) {
      return data;
    }
    
    if (rememberMe && data.token) {
      localStorage.setItem('yb_token', data.token);
    }
    setToken(data.token);
    setUser(data.user);
    fetchNotifications(data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('yb_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    setUser(data.user);
    return data.user;
  };

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserFieldsLocally = (fields) => {
    setUser(prev => prev ? { ...prev, ...fields } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      notifications,
      rememberMe,
      setRememberMe,
      login,
      signup,
      sendPhoneOtp,
      verifyPhoneOtp,
      logout,
      updateProfile,
      refreshUserData,
      updateUserFieldsLocally,
      fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
