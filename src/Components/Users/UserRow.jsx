import React from "react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const UserRow = ({ user, onEdit, onDelete, onView }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-slate-900">
              {user.name}
            </div>
            <div className="text-xs text-slate-500">ID: {user.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900">{user.email}</div>
        {user.secondaryEmail && (
          <div className="text-xs text-slate-500">{user.secondaryEmail}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900">
          {user.position?.positionName || "-"}
        </div>
        {user.department?.name && (
          <div className="text-xs text-slate-500">{user.department.name}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
            user.role
          )}`}
        >
          {user.role?.name || user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900">{user.phoneNumber || "-"}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onView(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(user.id)}
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

export default UserRow;
