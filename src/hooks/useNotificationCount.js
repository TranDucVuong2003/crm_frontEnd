import { useState, useEffect, useCallback } from "react";
import { getUnreadNotificationCount } from "../Service/ApiService";

/**
 * Custom hook để lấy và quản lý số lượng thông báo chưa đọc
 * @param {number} refreshInterval - Thời gian refresh tự động (ms), default: 60000 (1 phút)
 * @returns {Object} { unreadCount, loading, error, refresh }
 */
export const useNotificationCount = (refreshInterval = 60000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUnreadNotificationCount();

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lần đầu
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Auto refresh theo interval
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchUnreadCount]);

  // Listen for custom events to refresh count
  useEffect(() => {
    const handleRefresh = () => fetchUnreadCount();

    window.addEventListener("notification-read", handleRefresh);
    window.addEventListener("notification-deleted", handleRefresh);
    window.addEventListener("notifications-updated", handleRefresh);

    return () => {
      window.removeEventListener("notification-read", handleRefresh);
      window.removeEventListener("notification-deleted", handleRefresh);
      window.removeEventListener("notifications-updated", handleRefresh);
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refresh: fetchUnreadCount,
  };
};

export default useNotificationCount;
