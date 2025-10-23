import React, { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon, 
  DevicePhoneMobileIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  getSessions, 
  revokeSession, 
  revokeAllSessions 
} from '../Service/ApiService';
import { 
  showLoading, 
  closeLoading, 
  showSuccessAlert, 
  showErrorAlert,
  showConfirmDialog 
} from '../utils/sweetAlert';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getSessions();
      if (response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      showErrorAlert('Lỗi', 'Không thể tải danh sách phiên đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleRevokeSession = async (sessionId) => {
    const result = await showConfirmDialog(
      'Xác nhận thu hồi phiên',
      'Bạn có chắc muốn thu hồi phiên đăng nhập này?',
      'warning'
    );

    if (result.isConfirmed) {
      try {
        showLoading('Đang thu hồi phiên...', 'Vui lòng đợi');
        await revokeSession(sessionId);
        closeLoading();
        showSuccessAlert('Thành công', 'Đã thu hồi phiên đăng nhập');
        loadSessions();
      } catch (error) {
        console.error('Error revoking session:', error);
        closeLoading();
        showErrorAlert('Lỗi', 'Không thể thu hồi phiên đăng nhập');
      }
    }
  };

  const handleRevokeAllSessions = async () => {
    const result = await showConfirmDialog(
      'Xác nhận thu hồi tất cả phiên',
      'Bạn có chắc muốn thu hồi TẤT CẢ phiên đăng nhập? Bạn sẽ cần đăng nhập lại.',
      'warning'
    );

    if (result.isConfirmed) {
      try {
        showLoading('Đang thu hồi tất cả phiên...', 'Vui lòng đợi');
        await revokeAllSessions();
        closeLoading();
        showSuccessAlert('Thành công', 'Đã thu hồi tất cả phiên đăng nhập');
        // Reload page to force re-login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (error) {
        console.error('Error revoking all sessions:', error);
        closeLoading();
        showErrorAlert('Lỗi', 'Không thể thu hồi tất cả phiên đăng nhập');
      }
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <ComputerDesktopIcon className="h-6 w-6" />;
    
    const lowerInfo = deviceInfo.toLowerCase();
    if (lowerInfo.includes('mobile') || lowerInfo.includes('android') || lowerInfo.includes('ios')) {
      return <DevicePhoneMobileIcon className="h-6 w-6" />;
    }
    return <ComputerDesktopIcon className="h-6 w-6" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý phiên đăng nhập</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllSessions}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thu hồi tất cả
            </button>
          )}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có phiên đăng nhập nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-gray-400">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.deviceInfo || 'Unknown Device'}
                      </h3>
                      {session.isCurrentSession && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircleIcon className="h-3 w-3" />
                          Phiên hiện tại
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {session.ipAddress && (
                        <p>
                          <span className="font-medium">IP:</span> {session.ipAddress}
                        </p>
                      )}
                      {session.location && (
                        <p>
                          <span className="font-medium">Vị trí:</span> {session.location}
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span className="font-medium">Đăng nhập lần cuối:</span> {formatDate(session.lastActivity || session.createdAt)}
                      </p>
                      {session.expiresAt && (
                        <p>
                          <span className="font-medium">Hết hạn:</span> {formatDate(session.expiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {!session.isCurrentSession && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Thu hồi phiên này"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Thu hồi một phiên đăng nhập sẽ đăng xuất thiết bị đó ngay lập tức. 
          Nếu thu hồi tất cả phiên, bạn sẽ cần đăng nhập lại trên tất cả thiết bị.
        </p>
      </div>
    </div>
  );
};

export default SessionManagement;

