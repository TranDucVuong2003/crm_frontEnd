import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getAllNotificationsAdmin,
  deleteNotification,
} from "../../Service/ApiService";
import Swal from "sweetalert2";
import NotificationRecipientsModal from "./NotificationRecipientsModal";

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotificationsAdmin({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách thông báo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      html: `Bạn có chắc chắn muốn xóa thông báo:<br/><strong>"${title}"</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteNotification(id);

        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          text: "Thông báo đã được xóa thành công",
          timer: 1500,
          showConfirmButton: false,
        });

        // Refresh list
        fetchNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Không thể xóa thông báo",
        });
      }
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadPercentage = (readCount, totalRecipients) => {
    if (totalRecipients === 0) return 0;
    return Math.round((readCount / totalRecipients) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý thông báo đã tạo
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số {pagination.totalCount} thông báo
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người nhận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã đọc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-500">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <p className="text-gray-500">Chưa có thông báo nào</p>
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => {
                  const readPercentage = getReadPercentage(
                    notification.readCount,
                    notification.totalRecipients
                  );

                  return (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate mt-1">
                            {notification.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {notification.createdByUserName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDateTime(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setShowRecipientsModal(true);
                          }}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {notification.totalRecipients}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>
                                {notification.readCount}/
                                {notification.totalRecipients}
                              </span>
                              <span className="font-medium">
                                {readPercentage}%
                              </span>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  readPercentage === 100
                                    ? "bg-green-500"
                                    : readPercentage >= 50
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                                style={{ width: `${readPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Đã xóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              Swal.fire({
                                title: notification.title,
                                html: `
                                  <div class="text-left">
                                    <p class="text-gray-700 mb-4">${
                                      notification.content
                                    }</p>
                                    <div class="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span class="text-gray-500">Người tạo:</span>
                                        <p class="font-medium">${
                                          notification.createdByUserName
                                        }</p>
                                      </div>
                                      <div>
                                        <span class="text-gray-500">Ngày tạo:</span>
                                        <p class="font-medium">${formatDateTime(
                                          notification.createdAt
                                        )}</p>
                                      </div>
                                      <div>
                                        <span class="text-gray-500">Người nhận:</span>
                                        <p class="font-medium">${
                                          notification.totalRecipients
                                        } người</p>
                                      </div>
                                      <div>
                                        <span class="text-gray-500">Đã đọc:</span>
                                        <p class="font-medium">${
                                          notification.readCount
                                        } người (${readPercentage}%)</p>
                                      </div>
                                    </div>
                                  </div>
                                `,
                                confirmButtonText: "Đóng",
                                width: 600,
                              })
                            }
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {notification.isActive && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  notification.id,
                                  notification.title
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Xóa"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
      <NotificationRecipientsModal
        notification={selectedNotification}
        isOpen={showRecipientsModal}
        onClose={() => {
          setShowRecipientsModal(false);
          setSelectedNotification(null);
        }}
      />{" "}
    </div>
  );
};

export default NotificationManagement;
