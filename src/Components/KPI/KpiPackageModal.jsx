import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createKpiPackage, updateKpiPackage } from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const KpiPackageModal = ({ package: pkg, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetAmount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name || "",
        month: pkg.month || new Date().getMonth() + 1,
        year: pkg.year || new Date().getFullYear(),
        targetAmount: pkg.targetAmount || "",
        description: pkg.description || "",
      });
    }
  }, [pkg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "targetAmount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError("Vui lòng nhập tên gói KPI");
      return;
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      showError("Vui lòng nhập target amount hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description.trim(),
      };

      if (pkg?.id) {
        await updateKpiPackage(pkg.id, payload);
        showSuccess("Cập nhật gói KPI thành công");
      } else {
        // Thêm status khi tạo mới
        payload.status = "Pending";
        await createKpiPackage(payload);
        showSuccess("Tạo gói KPI thành công");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving KPI package:", error);
      showError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {pkg ? "Cập nhật gói KPI" : "Tạo gói KPI mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Tên gói KPI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gói KPI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: KPI Sale Tháng 12/2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Tháng và Năm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tháng <span className="text-red-500">*</span>
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chỉ tiêu doanh số (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="VD: 50000000"
                min="0"
                step="1000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {formData.targetAmount && (
                <p className="mt-1 text-sm text-gray-500">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(formData.targetAmount)}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Ghi chú về gói KPI này..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : pkg ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KpiPackageModal;
