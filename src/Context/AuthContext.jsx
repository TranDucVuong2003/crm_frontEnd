import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthCookies } from '../utils/cookieUtils';
import { migrateAuthDataToCookies, isMigrationNeeded } from '../utils/authMigration';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    // Migrate data from localStorage to cookies if needed
    if (isMigrationNeeded()) {
      console.log('Migration needed, starting migration process...');
      migrateAuthDataToCookies();
    }
    
    checkAuthStatus();
    
    // Listen for logout events from ApiService
    const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = AuthCookies.getToken();
      const userData = AuthCookies.getUser();
      const isAuth = AuthCookies.getAuthStatus();
      
      console.log('Checking auth status:');
      console.log('Token from cookies:', token ? '***' : 'null');
      console.log('User data from cookies:', userData);
      console.log('Auth status from cookies:', isAuth);
      
      if (token && userData && isAuth) {
        setIsAuthenticated(true);
        setUser(userData);
        console.log('User authenticated successfully');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.log('User not authenticated');
        // Clear any partial auth data
        AuthCookies.clearAuth();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      AuthCookies.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    try {
      console.log('AuthContext login called with:');
      console.log('Token:', token ? '***' : 'null');
      console.log('User data:', userData);
      
      // Store auth data in cookies
      AuthCookies.setAuthData(token, userData);
      
      // Update state
      setIsAuthenticated(true);
      setUser(userData);
      
      console.log('Login successful, auth data stored in cookies');
      
      // Clear browser history to prevent going back to login
      window.history.pushState(null, null, window.location.href);
    } catch (error) {
      console.error('Error during login:', error);
      // Clear any partial data on error
      AuthCookies.clearAuth();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = () => {
    try {
      // Clear auth cookies
      AuthCookies.clearAuth();
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      
      console.log('Logout successful, auth cookies cleared');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};