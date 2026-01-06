import React from "react";
import {
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

const SalaryContractDetailModal = ({ isOpen, onClose, contract }) => {
  if (!isOpen || !contract) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
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

  // Get contract type display
  const getContractTypeDisplay = (type) => {
    const types = {
      OFFICIAL: {
        label: "Chính thức",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleIcon className="h-5 w-5" />,
      },
      FREELANCE: {
        label: "Freelance",
        className: "bg-purple-100 text-purple-800",
        icon: <UserIcon className="h-5 w-5" />,
      },
    };
    return types[type] || types.OFFICIAL;
  };

  const contractTypeDisplay = getContractTypeDisplay(contract.contractType);

  // Handle download attachment
  const handleDownloadAttachment = () => {
    if (contract.attachmentPath) {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const fileUrl = `${baseUrl}${contract.attachmentPath}`;
      window.open(fileUrl, "_blank");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6" />
            Chi tiết cấu hình lương
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <IdentificationIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">ID nhân viên</p>
                  <p className="text-base font-medium text-gray-900">
                    #{contract.userId}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="text-base font-medium text-gray-900">
                    {contract.userName || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {contract.userEmail || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              Thông tin lương
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Lương cơ bản</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(contract.baseSalary)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">
                  Lương đóng bảo hiểm
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(contract.insuranceSalary)}
                </p>
                {contract.insuranceSalary === 5682000 && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Tự động tính theo mức tối thiểu)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              Chi tiết hợp đồng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Type */}
              <div className="flex items-start gap-3">
                {contractTypeDisplay.icon}
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Loại hợp đồng</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${contractTypeDisplay.className}`}
                  >
                    {contractTypeDisplay.label}
                  </span>
                </div>
              </div>

              {/* Dependents Count */}
              <div className="flex items-start gap-3">
                <UsersIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Số người phụ thuộc
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {contract.dependentsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Giảm trừ thuế:{" "}
                    {formatCurrency(contract.dependentsCount * 4400000)}
                  </p>
                </div>
              </div>

              {/* Has Commitment 08 */}
              <div className="flex items-start gap-3">
                {contract.hasCommitment08 ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-gray-300 mt-1" />
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cam kết 08</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      contract.hasCommitment08
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {contract.hasCommitment08 ? "Có" : "Không"}
                  </span>
                  {contract.hasCommitment08 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Miễn thuế TNCN (thu nhập dưới 11tr/tháng)
                    </p>
                  )}
                </div>
              </div>

              {/* Attachment */}
              <div className="flex items-start gap-3">
                <DocumentArrowDownIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">File đính kèm</p>
                  {contract.attachmentPath ? (
                    <button
                      onClick={handleDownloadAttachment}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      {contract.attachmentFileName || "Tải file"}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Không có file đính kèm
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-gray-600" />
              Lịch sử cập nhật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(contract.createdAt)}
                  </p>
                </div>
              </div>
              {contract.updatedAt && (
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(contract.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salary Calculation Summary */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Tổng quan tính lương
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Lương cơ bản:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(contract.baseSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lương BHXH (Đóng BHXH):</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(contract.insuranceSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Giảm trừ gia cảnh bản thân:
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(11000000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Giảm trừ người phụ thuộc ({contract.dependentsCount} người):
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(contract.dependentsCount * 4400000)}
                </span>
              </div>
              <div className="border-t border-yellow-300 pt-2 mt-2 flex justify-between">
                <span className="text-gray-700 font-semibold">
                  Tổng giảm trừ:
                </span>
                <span className="font-bold text-green-600">
                  {formatCurrency(
                    11000000 + contract.dependentsCount * 4400000
                  )}
                </span>
              </div>
            </div>
            {contract.hasCommitment08 && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Có cam kết 08:</strong> Miễn thuế TNCN nếu thu nhập
                  dưới 11 triệu/tháng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryContractDetailModal;
