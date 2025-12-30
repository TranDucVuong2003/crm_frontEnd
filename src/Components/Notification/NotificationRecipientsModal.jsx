import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getNotificationReadStatus } from "../../Service/ApiService";

const NotificationRecipientsModal = ({ notification, isOpen, onClose }) => {
  const [readStatusData, setReadStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, read, unread

  useEffect(() => {
    if (isOpen && notification) {
      fetchReadStatus();
    }
  }, [isOpen, notification]);

  const fetchReadStatus = async () => {
    try {
      setLoading(true);
      const response = await getNotificationReadStatus(notification.id);

      if (response.data.success) {
        setReadStatusData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching read status:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (!isOpen || !notification) return null;

  // Combine read and unread users for filtering
  const allRecipients = readStatusData
    ? [...readStatusData.readUsers, ...readStatusData.unreadUsers]
    : [];

  const filteredRecipients = allRecipients.filter((recipient) => {
    if (filter === "read") return recipient.isRead;
    if (filter === "unread") return !recipient.isRead;
    return true;
  });

  const totalRecipients = readStatusData?.totalRecipients || 0;
  const readCount = readStatusData?.readCount || 0;
  const unreadCount = readStatusData?.unreadCount || 0;

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
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Danh sách người nhận
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Statistics */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Tổng số</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalRecipients}
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Đã đọc</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {readCount}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Chưa đọc</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {unreadCount}
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  filter === "all"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Tất cả ({totalRecipients})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  filter === "read"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Đã đọc ({readCount})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  filter === "unread"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
          </div>

          {/* Recipients List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRecipients.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Không có người nhận
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người nhận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chức vụ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian đọc
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecipients.map((recipient) => (
                      <tr key={recipient.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {recipient.userName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {recipient.positionName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {recipient.isRead ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Đã đọc
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Chưa đọc
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(recipient.readAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationRecipientsModal;
