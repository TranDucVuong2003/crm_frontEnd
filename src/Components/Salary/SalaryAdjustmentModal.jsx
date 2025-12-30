import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createSalaryComponent,
  updateSalaryComponent,
  getAllUsers,
} from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";

const SalaryAdjustmentModal = ({ component, month, year, onClose }) => {
  const [formData, setFormData] = useState({
    userId: "",
    month: month,
    year: year,
    amount: "",
    type: "in",
    reason: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (component) {
      setFormData({
        userId: component.userId || "",
        month: component.month || month,
        year: component.year || year,
        amount: component.amount || "",
        type: component.type || "in",
        reason: component.reason || "",
      });
    }
  }, [component, month, year]);

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
      [name]:
        name === "amount"
          ? value === ""
            ? ""
            : parseFloat(value) || ""
          : name === "month" || name === "year"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      showErrorAlert("Lỗi", "Vui lòng chọn nhân viên");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      showErrorAlert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!formData.reason.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập lý do");
      return;
    }

    setLoading(true);
    showLoading(component ? "Đang cập nhật..." : "Đang tạo mới...");

    try {
      if (component && component.id) {
        await updateSalaryComponent(component.id, formData);
        closeLoading();
        await showSuccessAlert("Thành công", "Đã cập nhật điều chỉnh lương");
        onClose();
      } else {
        await createSalaryComponent(formData);
        closeLoading();
        await showSuccessAlert("Thành công", "Đã tạo điều chỉnh lương mới");
        onClose();
      }
    } catch (error) {
      closeLoading();
      console.error("Error saving component:", error);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message ||
          `Không thể ${
            component && component.id ? "cập nhật" : "tạo"
          } điều chỉnh lương`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {component && component.id
              ? "Cập nhật điều chỉnh lương"
              : "Thêm điều chỉnh lương mới"}
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
              disabled={!!(component && component.id)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            >
              <option value="">Chọn nhân viên</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.name} - {user.email}
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

          {/* Type and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="in">Cộng thêm (+)</option>
                <option value="out">Khấu trừ (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Nhập số tiền"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Thưởng dự án, Phạt đi muộn, Phụ cấp xăng xe..."
              required
            />
          </div>

          {/* Preview */}
          {formData.amount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Xem trước:
              </p>
              <p className="text-lg font-bold">
                <span
                  className={
                    formData.type === "in" ? "text-green-600" : "text-red-600"
                  }
                >
                  {formData.type === "in" ? "+" : "-"}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(formData.amount)}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">{formData.reason}</p>
            </div>
          )}

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
              {loading
                ? "Đang xử lý..."
                : component && component.id
                ? "Cập nhật"
                : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryAdjustmentModal;
