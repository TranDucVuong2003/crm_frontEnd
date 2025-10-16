import { AuthCookies } from './cookieUtils';

/**
 * Migration utility to move authentication data from localStorage to cookies
 */
export const migrateAuthDataToCookies = () => {
  try {
    console.log('Starting migration from localStorage to cookies...');
    
    // Check if data exists in localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const authStatus = localStorage.getItem('auth');
    
    // Check if cookies already exist (avoid overwriting)
    const cookieToken = AuthCookies.getToken();
    const cookieUser = AuthCookies.getUser();
    
    if (cookieToken && cookieUser) {
      console.log('Auth data already exists in cookies, skipping migration');
      // Clean up localStorage
      cleanupLocalStorageAuth();
      return true;
    }
    
    if (token && userData && authStatus === 'true') {
      console.log('Found auth data in localStorage, migrating to cookies...');
      
      try {
        const parsedUserData = JSON.parse(userData);
        
        // Set data in cookies
        AuthCookies.setAuthData(token, parsedUserData);
        
        console.log('Migration successful!');
        
        // Clean up localStorage after successful migration
        cleanupLocalStorageAuth();
        
        return true;
      } catch (parseError) {
        console.error('Error parsing user data during migration:', parseError);
        return false;
      }
    } else {
      console.log('No valid auth data found in localStorage to migrate');
      // Clean up any partial localStorage data
      cleanupLocalStorageAuth();
      return true;
    }
  } catch (error) {
    console.error('Error during auth data migration:', error);
    return false;
  }
};

/**
 * Clean up authentication data from localStorage
 */
const cleanupLocalStorageAuth = () => {
  try {
    const authKeys = ['authToken', 'user', 'auth'];
    
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage`);
      }
    });
    
    console.log('localStorage cleanup completed');
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
  }
};

/**
 * Check if migration is needed
 */
export const isMigrationNeeded = () => {
  const hasLocalStorageAuth = !!(
    localStorage.getItem('authToken') && 
    localStorage.getItem('user') && 
    localStorage.getItem('auth')
  );
  
  const hasCookieAuth = AuthCookies.isAuthenticated();
  
  return hasLocalStorageAuth && !hasCookieAuth;
};

/**
 * Force cleanup of localStorage auth data (for development/debugging)
 */
export const forceCleanupLocalStorage = () => {
  console.log('Force cleaning up localStorage auth data...');
  cleanupLocalStorageAuth();
};

/**
 * Get current auth storage summary (for debugging)
 */
export const getAuthStorageSummary = () => {
  const localStorage = {
    token: !!window.localStorage.getItem('authToken'),
    user: !!window.localStorage.getItem('user'),
    auth: !!window.localStorage.getItem('auth')
  };
  
  const cookies = {
    token: !!AuthCookies.getToken(),
    user: !!AuthCookies.getUser(),
    auth: AuthCookies.getAuthStatus()
  };
  
  return {
    localStorage,
    cookies,
    migrationNeeded: isMigrationNeeded()
  };
};