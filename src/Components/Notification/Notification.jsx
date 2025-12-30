import React, { useState, useEffect } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  PlusIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAPI,
} from "../../Service/ApiService";
import { useAuth } from "../../Context/AuthContext";
import Swal from "sweetalert2";
import NotificationCreateModal from "./NotificationCreateModal";
import NotificationManagement from "./NotificationManagement";
import NotificationDetailModal from "./NotificationDetailModal";

function Notification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications"); // notifications, management
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });

  // Fetch notifications từ API
  useEffect(() => {
    fetchNotifications();
  }, [filter, pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        unreadOnly: filter === "unread",
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      const response = await getMyNotifications(params);

      if (response.data.success) {
        // Map dữ liệu từ API sang format component
        const mappedNotifications = response.data.data.map((notif) => ({
          id: notif.id,
          notificationId: notif.notificationId,
          title: notif.title,
          message: notif.content,
          type: "info", // Có thể thêm type từ backend nếu cần
          isRead: notif.isRead,
          createdAt: new Date(notif.createdAt),
          readAt: notif.readAt ? new Date(notif.readAt) : null,
        }));

        setNotifications(mappedNotifications);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải thông báo. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );

      // Trigger event để cập nhật unread count
      window.dispatchEvent(new CustomEvent("notification-read"));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể đánh dấu đã đọc. Vui lòng thử lại.",
      });
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
      );

      // Trigger event để cập nhật unread count
      window.dispatchEvent(new CustomEvent("notification-read"));

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Đã đánh dấu tất cả thông báo là đã đọc",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.",
      });
    }
  };

  // Xóa thông báo
  const deleteNotification = async (notificationId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa thông báo này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteNotificationAPI(notificationId);

        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );

        // Trigger event để cập nhật unread count
        window.dispatchEvent(new CustomEvent("notification-deleted"));

        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          text: "Thông báo đã được xóa",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa thông báo. Vui lòng thử lại.",
        });
      }
    }
  };

  // Lọc thông báo theo trạng thái (không cần nữa vì API đã lọc)
  const filteredNotifications = notifications;

  // Format thời gian
  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Icon theo loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
        );
      case "warning":
        return (
          <ExclamationCircleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
        );
      case "error":
        return (
          <ExclamationCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
        );
      default:
        return (
          <InformationCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1 khi đổi filter
  };

  const handleCreateSuccess = () => {
    // Refresh notifications list
    fetchNotifications();
    // Trigger event to update unread count
    window.dispatchEvent(new CustomEvent("notifications-updated"));
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <BellAlertIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-sm text-gray-500">
                {filter === "all"
                  ? `Tổng số ${pagination.totalCount} thông báo`
                  : filter === "unread"
                  ? `${pagination.totalCount} thông báo chưa đọc`
                  : `${pagination.totalCount} thông báo đã đọc`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Tạo thông báo</span>
              </button>
            )}

            {unreadCount > 0 && filter !== "read" && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Đánh dấu tất cả là đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Main Tabs - Admin có thêm tab Quản lý */}
        {isAdmin && (
          <div className="mt-6 flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "notifications"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <BellIcon className="h-4 w-4" />
              <span>Thông báo của tôi</span>
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "management"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span>Quản lý thông báo</span>
            </button>
          </div>
        )}

        {/* Filter tabs - Chỉ hiển thị khi tab notifications */}
        {activeTab === "notifications" && (
          <div className="mt-6 flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleFilterChange("unread")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === "unread"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => handleFilterChange("read")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === "read"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Đã đọc
            </button>
          </div>
        )}
      </div>

      {/* Content - Hiển thị theo tab */}
      {activeTab === "management" ? (
        <NotificationManagement />
      ) : (
        <>
          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không có thông báo
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo"
                  : "Chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative flex items-start p-4 rounded-lg border transition-all hover:shadow-md ${
                    notification.isRead
                      ? "bg-white border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  {/* Dot indicator for unread */}
                  {!notification.isRead && (
                    <div className="absolute top-2 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}

                  {/* Icon */}
                  <div className="ml-3 mr-4">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`text-sm font-semibold ${
                            notification.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`mt-1 text-sm ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!notification.isRead && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => markAsRead(notification.notificationId)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Notification Modal */}
      <NotificationCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNotification(null);
        }}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}

export default Notification;
