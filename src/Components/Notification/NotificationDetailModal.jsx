import React from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const NotificationDetailModal = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
}) => {
  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case "warning":
        return <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />;
      case "error":
        return <ExclamationCircleIcon className="h-8 w-8 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-8 w-8 text-blue-500" />;
    }
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết thông báo
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Icon and Status */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Chưa đọc
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Read Status */}
            {notification.isRead && notification.readAt && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Đã đọc lúc {formatDateTime(notification.readAt)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            {!notification.isRead && (
              <button
                onClick={() => {
                  onMarkAsRead(notification.notificationId);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Đánh dấu đã đọc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
