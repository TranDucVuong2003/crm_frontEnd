import React, { useState, useEffect } from 'react';
import { AuthCookies } from '../utils/cookieUtils';
import { getAuthStorageSummary, forceCleanupLocalStorage, migrateAuthDataToCookies } from '../utils/authMigration';
import { useAuth } from '../Context/AuthContext';

const AuthDebugPanel = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const refreshStorageInfo = () => {
    setStorageInfo(getAuthStorageSummary());
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const handleForceCleanup = () => {
    forceCleanupLocalStorage();
    refreshStorageInfo();
  };

  const handleForceMigration = () => {
    migrateAuthDataToCookies();
    refreshStorageInfo();
  };

  const handleClearCookies = () => {
    AuthCookies.clearAuth();
    refreshStorageInfo();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs opacity-50 hover:opacity-100"
        style={{ zIndex: 9999 }}
      >
        Auth Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 text-xs" style={{ zIndex: 9999 }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Auth Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Current Auth State */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1">Current State:</h4>
        <div className="bg-gray-50 p-2 rounded">
          <div>Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? 'Yes' : 'No'}
          </span></div>
          <div>User: {user ? user.username || user.email : 'None'}</div>
        </div>
      </div>

      {/* Storage Info */}
      {storageInfo && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-700 mb-1">Storage Status:</h4>
          <div className="bg-gray-50 p-2 rounded space-y-1">
            <div className="flex justify-between">
              <span>LocalStorage:</span>
              <span className={storageInfo.localStorage.token ? 'text-orange-600' : 'text-green-600'}>
                {storageInfo.localStorage.token ? 'Has Data' : 'Clean'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cookies:</span>
              <span className={storageInfo.cookies.token ? 'text-green-600' : 'text-red-600'}>
                {storageInfo.cookies.token ? 'Has Data' : 'Empty'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Migration Needed:</span>
              <span className={storageInfo.migrationNeeded ? 'text-orange-600' : 'text-green-600'}>
                {storageInfo.migrationNeeded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Details */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-1">Cookie Details:</h4>
        <div className="bg-gray-50 p-2 rounded space-y-1 text-xs">
          <div>Token: {AuthCookies.getToken() ? '***' : 'None'}</div>
          <div>User: {AuthCookies.getUser()?.username || 'None'}</div>
          <div>Status: {AuthCookies.getAuthStatus() ? 'True' : 'False'}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={refreshStorageInfo}
          className="w-full bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
        >
          Refresh Info
        </button>
        
        <button
          onClick={handleForceMigration}
          className="w-full bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
        >
          Force Migration
        </button>
        
        <button
          onClick={handleForceCleanup}
          className="w-full bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600"
        >
          Clean LocalStorage
        </button>
        
        <button
          onClick={handleClearCookies}
          className="w-full bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
        >
          Clear Cookies
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        * Remove this component in production
      </div>
    </div>
  );
};

export default AuthDebugPanel;