import React from "react";
import {
  XMarkIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const UserDetailModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadgeColor = (role) => {
    const roleName = typeof role === "string" ? role : role?.name;
    switch (roleName) {
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "User":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                  <span
                    className={`inline-flex mt-2 px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role?.name || user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Thông tin liên hệ
                </h4>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Email chính</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.secondaryEmail && (
                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Email phụ</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.secondaryEmail}
                      </p>
                    </div>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Số điện thoại</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Địa chỉ</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Thông tin công việc
                </h4>

                {user.position && (
                  <div className="flex items-start space-x-3">
                    <BriefcaseIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Vị trí</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.position?.positionName || user.position}
                      </p>
                      {user.position?.level && (
                        <p className="text-xs text-slate-500">
                          Cấp bậc: {user.position.level}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold">🏢</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Phòng ban</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.department.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">Vai trò</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user.role?.name || user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 font-bold">#</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500">User ID</p>
                    <p className="text-sm font-medium text-slate-900">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">
                Thời gian
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                {user.updatedAt && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500 mb-1">
                      Cập nhật lần cuối
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Chỉnh sửa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
