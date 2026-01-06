import React from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const SalaryContractRow = ({ contract, onEdit, onDelete, onView }) => {
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
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get contract type badge
  const getContractTypeBadge = (type) => {
    const badges = {
      OFFICIAL: {
        label: "Chính thức",
        className: "bg-green-100 text-green-800",
      },
      FREELANCE: {
        label: "Freelance",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const badge = badges[type] || badges.OFFICIAL;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  // Get file icon and handle download
  const handleDownloadAttachment = () => {
    if (contract.attachmentPath) {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const fileUrl = `${baseUrl}${contract.attachmentPath}`;
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          #{contract.id}
        </span>
      </td>

      {/* Employee Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {contract.userName || "N/A"}
          </span>
          <span className="text-xs text-gray-500">{contract.userEmail}</span>
          <span className="text-xs text-gray-400">ID: {contract.userId}</span>
        </div>
      </td>

      {/* Base Salary */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-blue-600">
          {formatCurrency(contract.baseSalary)}
        </span>
      </td>

      {/* Insurance Salary */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">
          {formatCurrency(contract.insuranceSalary)}
        </span>
      </td>

      {/* Contract Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        {getContractTypeBadge(contract.contractType)}
      </td>

      {/* Dependents Count */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className="text-sm font-medium text-gray-900">
          {contract.dependentsCount}
        </span>
      </td>

      {/* Has Commitment 08 */}
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {contract.hasCommitment08 ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-gray-300 mx-auto" />
        )}
      </td>

      {/* Created Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-600">
          {formatDate(contract.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* View Button */}
          <button
            onClick={() => onView(contract)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          {/* Download Attachment */}
          {contract.attachmentPath && (
            <button
              onClick={handleDownloadAttachment}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Tải file đính kèm"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={() => onEdit(contract)}
            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(contract.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SalaryContractRow;
