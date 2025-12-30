import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createMonthlyAttendance,
  updateMonthlyAttendance,
  getAllUsers,
} from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";

const AttendanceModal = ({
  attendance,
  month,
  year,
  preselectedUserId,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    userId: "",
    month: month,
    year: year,
    actualWorkDays: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (attendance) {
      setFormData({
        userId: attendance.userId || "",
        month: attendance.month || month,
        year: attendance.year || year,
        actualWorkDays: attendance.actualWorkDays || 0,
      });
    } else if (preselectedUserId) {
      // Nếu có preselectedUserId (khi bấm nút Nhập của nhân viên), tự động điền vào
      setFormData({
        userId: preselectedUserId,
        month: month,
        year: year,
        actualWorkDays: 0,
      });
    }
  }, [attendance, month, year, preselectedUserId]);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách nhân viên"
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "userId" ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      showErrorAlert("Lỗi", "Vui lòng chọn nhân viên");
      return;
    }

    setLoading(true);
    showLoading(attendance ? "Đang cập nhật..." : "Đang tạo mới...");

    try {
      if (attendance) {
        await updateMonthlyAttendance(attendance.id, formData);
        closeLoading();
        showSuccessAlert("Thành công", "Đã cập nhật ngày công");
      } else {
        await createMonthlyAttendance(formData);
        closeLoading();
        showSuccessAlert("Thành công", "Đã tạo ngày công mới");
      }
      onClose();
    } catch (error) {
      closeLoading();
      console.error("Error saving attendance:", error);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message ||
          `Không thể ${attendance ? "cập nhật" : "tạo"} ngày công`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Cấu hình ngày công
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              disabled={!!attendance}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            >
              <option value="">Chọn nhân viên</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="month"
                value={formData.month}
                onChange={handleChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2000"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Actual Work Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số ngày công thực tế <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="actualWorkDays"
              value={formData.actualWorkDays}
              onChange={handleChange}
              min="0"
              max="31"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Nhập số ngày công thực tế"
            />
            <p className="mt-1 text-sm text-gray-500">
              Nhập số ngày làm việc thực tế trong tháng (có thể là số lẻ, VD:
              22.5)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : attendance ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
