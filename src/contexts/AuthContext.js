import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is not configured, skip Firebase auth
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Get Firebase ID token
          const idToken = await user.getIdToken();
          setToken(idToken);
          // Store token in localStorage
          localStorage.setItem('firebaseToken', idToken);
        } catch (error) {
          console.error('Error getting token:', error);
          setToken(null);
          localStorage.removeItem('firebaseToken');
        }
      } else {
        setToken(null);
        localStorage.removeItem('firebaseToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically
  useEffect(() => {
    if (user) {
      const refreshToken = setInterval(async () => {
        try {
          const idToken = await user.getIdToken(true); // Force refresh
          setToken(idToken);
          localStorage.setItem('firebaseToken', idToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }, 50 * 60 * 1000); // Refresh every 50 minutes

      return () => clearInterval(refreshToken);
    }
  }, [user]);

  const signOut = async () => {
    if (!auth) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('firebaseToken');
      return;
    }
    
    try {
      await firebaseSignOut(auth);
      setToken(null);
      localStorage.removeItem('firebaseToken');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

