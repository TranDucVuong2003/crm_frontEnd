import React, { useState, useEffect } from "react";
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getAllSessionsAdmin, revokeSessionAdmin } from "../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
} from "../utils/sweetAlert";

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadSessions();
  }, [pagination.pageNumber]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await getAllSessionsAdmin();
      if (response.data) {
        // Nếu API trả về array, xử lý pagination ở frontend
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.sessions || [];
        const totalCount = response.data.totalCount || data.length;

        // Tính toán pagination
        const startIndex = (pagination.pageNumber - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = Array.isArray(response.data)
          ? data.slice(startIndex, endIndex)
          : data;

        setSessions(paginatedData);
        setPagination((prev) => ({
          ...prev,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / prev.pageSize),
        }));
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      showErrorAlert("Lỗi", "Không thể tải danh sách phiên đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleRevokeSession = async (sessionId, isCurrentSession) => {
    if (isCurrentSession) {
      showErrorAlert("Cảnh báo", "Không thể thu hồi phiên đăng nhập hiện tại");
      return;
    }

    const result = await showConfirmDialog(
      "Xác nhận thu hồi phiên",
      "Bạn có chắc muốn thu hồi phiên đăng nhập này? Thiết bị sẽ bị đăng xuất ngay lập tức.",
      "warning"
    );

    if (result) {
      try {
        showLoading("Đang thu hồi phiên...", "Vui lòng đợi");
        await revokeSessionAdmin(sessionId, "Manually revoked by admin");
        closeLoading();
        showSuccessAlert("Thành công", "Đã thu hồi phiên đăng nhập");
        loadSessions();
      } catch (error) {
        console.error("Error revoking session:", error);
        closeLoading();
        showErrorAlert("Lỗi", "Không thể thu hồi phiên đăng nhập");
      }
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo || deviceInfo === "Unknown Device") {
      return <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />;
    }

    const lowerInfo = deviceInfo.toLowerCase();
    if (
      lowerInfo.includes("mobile") ||
      lowerInfo.includes("android") ||
      lowerInfo.includes("iphone") ||
      lowerInfo.includes("ios")
    ) {
      return <DevicePhoneMobileIcon className="h-8 w-8 text-blue-500" />;
    }
    return <ComputerDesktopIcon className="h-8 w-8 text-gray-700" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (session) => {
    if (session.isRevoked) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XMarkIcon className="h-4 w-4 mr-1" />
          Đã thu hồi
        </span>
      );
    }

    if (session.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Đang hoạt động
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon className="h-4 w-4 mr-1" />
        Hết hạn
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.isActive && !s.isRevoked);
  const currentSession = sessions.find((s) => s.isCurrentSession);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="h-7 w-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Quản lý phiên đăng nhập
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Quản lý các thiết bị đã đăng nhập vào tài khoản của bạn
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tổng số phiên hoạt động:{" "}
            <span className="font-semibold text-gray-700">
              {activeSessions.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không có phiên đăng nhập nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                session.isCurrentSession
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.deviceInfo || "Unknown Device"}
                      </h3>
                      {session.isCurrentSession && (
                        <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          Phiên hiện tại
                        </span>
                      )}
                      {getStatusBadge(session)}
                    </div>

                    {/* User Info Section */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-700 font-medium text-sm">
                            {session.userName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {session.userName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {session.userEmail || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            session.userRole === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {session.userRole || "User"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <p className="mb-1">
                          <span className="font-medium text-gray-700">
                            IP Address:
                          </span>{" "}
                          {session.ipAddress}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium text-gray-700">
                            User Agent:
                          </span>
                          <span className="block text-xs text-gray-500 mt-1 break-all">
                            {session.userAgent}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 flex items-center gap-1">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            Đăng nhập:
                          </span>{" "}
                          {formatDate(session.createdAt)}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium text-gray-700">
                            Hết hạn:
                          </span>{" "}
                          {formatDate(session.expiresAt)}
                        </p>
                        {session.revokedAt && (
                          <p className="text-red-600">
                            <span className="font-medium">Thu hồi lúc:</span>{" "}
                            {formatDate(session.revokedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {session.resionRevoked && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <span className="font-medium">Lý do thu hồi:</span>{" "}
                        {session.resionRevoked}
                      </div>
                    )}
                  </div>
                </div>

                {!session.isCurrentSession &&
                  session.isActive &&
                  !session.isRevoked && (
                    <button
                      onClick={() =>
                        handleRevokeSession(
                          session.id,
                          session.isCurrentSession
                        )
                      }
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Thu hồi phiên này"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageNumber: Math.max(1, prev.pageNumber - 1),
                }))
              }
              disabled={pagination.pageNumber === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {pagination.pageNumber} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageNumber: Math.min(prev.totalPages, prev.pageNumber + 1),
                }))
              }
              disabled={pagination.pageNumber === pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(pagination.pageNumber - 1) * pagination.pageSize + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.pageNumber * pagination.pageSize,
                    pagination.totalCount
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{pagination.totalCount}</span>{" "}
                phiên
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageNumber: Math.max(1, prev.pageNumber - 1),
                    }))
                  }
                  disabled={pagination.pageNumber === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>‹
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map(
                  (_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (pagination.pageNumber <= 3) {
                      pageNum = idx + 1;
                    } else if (
                      pagination.pageNumber >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = pagination.pageNumber - 2 + idx;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: pageNum,
                          }))
                        }
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.pageNumber === pageNum
                            ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageNumber: Math.min(
                        prev.totalPages,
                        prev.pageNumber + 1
                      ),
                    }))
                  }
                  disabled={pagination.pageNumber === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Lưu ý bảo mật:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Thu hồi một phiên đăng nhập sẽ đăng xuất thiết bị đó ngay lập
                tức.
              </li>
              <li>Phiên hiện tại không thể bị thu hồi từ giao diện này.</li>
              <li>
                Nếu phát hiện phiên đăng nhập lạ, hãy thu hồi ngay và đổi mật
                khẩu.
              </li>
              <li>Chỉ đăng nhập trên các thiết bị và mạng đáng tin cậy.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
