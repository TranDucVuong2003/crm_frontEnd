import React, { useState, useEffect, useRef } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../Service/ApiService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import NotificationDetailModal from "./NotificationDetailModal";

const NotificationDropdown = ({ isOpen, onClose, anchorRef }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getMyNotifications({
        page: 1,
        pageSize: 10,
      });

      if (response.data.success) {
        const mappedNotifications = response.data.data.map((notif) => ({
          id: notif.id,
          notificationId: notif.notificationId,
          title: notif.title,
          message: notif.content,
          isRead: notif.isRead,
          createdAt: new Date(notif.createdAt),
        }));
        setNotifications(mappedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mở modal chi tiết
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Cập nhật state local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );

      // Cập nhật selectedNotification nếu đang mở modal của nó
      if (selectedNotification?.notificationId === notificationId) {
        setSelectedNotification((prev) => ({
          ...prev,
          isRead: true,
          readAt: new Date(),
        }));
      }

      // Trigger event để cập nhật unread count
      window.dispatchEvent(new CustomEvent("notification-read"));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      // Trigger event để cập nhật unread count
      window.dispatchEvent(new CustomEvent("notification-read"));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  const formatTimeAgo = (date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      return "";
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === "success") {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform transition-all duration-200 ease-out origin-top-right"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
        <div className="flex items-center space-x-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <BellIcon className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.notificationId}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p
                        className={`text-sm font-medium text-gray-900 ${
                          !notification.isRead ? "font-semibold" : ""
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="ml-2 flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleViewAll}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNotification(null);
          onClose(); // Đóng dropdown sau khi đóng modal
        }}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NotificationDropdown;
