/**
 * Cookie utilities for secure authentication storage
 */

// Set cookie with options
export const setCookie = (name, value, options = {}) => {
  const defaults = {
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'Strict',
    ...options
  };

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  // Add expiration
  if (defaults.expires) {
    if (defaults.expires instanceof Date) {
      cookieString += `; expires=${defaults.expires.toUTCString()}`;
    } else if (typeof defaults.expires === 'number') {
      // expires in days
      const date = new Date();
      date.setTime(date.getTime() + (defaults.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
  }

  // Add maxAge (in seconds)
  if (defaults.maxAge) {
    cookieString += `; max-age=${defaults.maxAge}`;
  }

  // Add path
  if (defaults.path) {
    cookieString += `; path=${defaults.path}`;
  }

  // Add domain
  if (defaults.domain) {
    cookieString += `; domain=${defaults.domain}`;
  }

  // Add secure flag
  if (defaults.secure) {
    cookieString += `; secure`;
  }

  // Add sameSite
  if (defaults.sameSite) {
    cookieString += `; samesite=${defaults.sameSite}`;
  }

  // Add httpOnly flag (Note: this can only be set from server-side)
  if (defaults.httpOnly) {
    cookieString += `; httponly`;
  }

  document.cookie = cookieString;
};

// Get cookie value by name
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift();
    try {
      return decodeURIComponent(cookieValue);
    } catch (error) {
      console.error('Error decoding cookie:', error);
      return null;
    }
  }
  
  return null;
};

// Remove cookie
export const removeCookie = (name, options = {}) => {
  const defaults = {
    path: '/',
    ...options
  };

  // Set cookie with past expiration date
  setCookie(name, '', {
    ...defaults,
    expires: new Date(0)
  });
};

// Check if cookie exists
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

// Get all cookies as object
export const getAllCookies = () => {
  const cookies = {};
  
  if (document.cookie) {
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        try {
          cookies[name] = decodeURIComponent(value);
        } catch (error) {
          console.error('Error decoding cookie:', error);
        }
      }
    });
  }
  
  return cookies;
};

// Clear all cookies (best effort - can only clear cookies from current domain/path)
export const clearAllCookies = () => {
  const cookies = getAllCookies();
  
  Object.keys(cookies).forEach(name => {
    removeCookie(name);
    // Try to remove from root path as well
    removeCookie(name, { path: '/' });
  });
};

/**
 * Authentication-specific cookie utilities
 */
export const AuthCookies = {
  // Cookie names
  TOKEN_COOKIE: 'auth_token',
  USER_COOKIE: 'user_data',
  AUTH_STATUS_COOKIE: 'auth_status',

  // Default cookie options for auth data
  getDefaultOptions: () => ({
    expires: 7, // 7 days
    secure: window.location.protocol === 'https:',
    sameSite: 'Strict',
    path: '/'
  }),

  // Set authentication token
  setToken: (token) => {
    setCookie(AuthCookies.TOKEN_COOKIE, token, {
      ...AuthCookies.getDefaultOptions(),
      expires: 1 // Token expires in 1 day
    });
  },

  // Get authentication token
  getToken: () => {
    return getCookie(AuthCookies.TOKEN_COOKIE);
  },

  // Set user data (non-sensitive info only)
  setUser: (userData) => {
    // Only store non-sensitive user information
    const safeUserData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      // Add other non-sensitive fields as needed
    };
    
    setCookie(AuthCookies.USER_COOKIE, JSON.stringify(safeUserData), AuthCookies.getDefaultOptions());
  },

  // Get user data
  getUser: () => {
    const userData = getCookie(AuthCookies.USER_COOKIE);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        return null;
      }
    }
    return null;
  },

  // Set authentication status
  setAuthStatus: (isAuthenticated) => {
    setCookie(AuthCookies.AUTH_STATUS_COOKIE, isAuthenticated.toString(), AuthCookies.getDefaultOptions());
  },

  // Get authentication status
  getAuthStatus: () => {
    const status = getCookie(AuthCookies.AUTH_STATUS_COOKIE);
    return status === 'true';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = AuthCookies.getToken();
    const status = AuthCookies.getAuthStatus();
    return !!(token && status);
  },

  // Clear all authentication cookies
  clearAuth: () => {
    removeCookie(AuthCookies.TOKEN_COOKIE);
    removeCookie(AuthCookies.USER_COOKIE);
    removeCookie(AuthCookies.AUTH_STATUS_COOKIE);
  },

  // Set complete auth data
  setAuthData: (token, userData) => {
    AuthCookies.setToken(token);
    AuthCookies.setUser(userData);
    AuthCookies.setAuthStatus(true);
  }
};