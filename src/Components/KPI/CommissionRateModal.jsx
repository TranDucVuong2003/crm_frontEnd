import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createCommissionRate,
  updateCommissionRate,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const CommissionRateModal = ({ rate, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    commissionPercentage: "",
    tierLevel: "",
    description: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rate) {
      setFormData({
        minAmount: rate.minAmount || "",
        maxAmount: rate.maxAmount || "",
        commissionPercentage: rate.commissionPercentage || "",
        tierLevel: rate.tierLevel || "",
        description: rate.description || "",
        isActive: rate.isActive !== undefined ? rate.isActive : true,
      });
    }
  }, [rate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.minAmount || parseFloat(formData.minAmount) < 0) {
      showError("Vui lòng nhập giá trị tối thiểu hợp lệ");
      return;
    }

    if (
      formData.maxAmount &&
      parseFloat(formData.maxAmount) <= parseFloat(formData.minAmount)
    ) {
      showError("Giá trị tối đa phải lớn hơn giá trị tối thiểu");
      return;
    }

    if (
      !formData.commissionPercentage ||
      parseFloat(formData.commissionPercentage) <= 0 ||
      parseFloat(formData.commissionPercentage) > 100
    ) {
      showError("Tỷ lệ hoa hồng phải từ 0 đến 100%");
      return;
    }

    if (!formData.tierLevel || parseInt(formData.tierLevel) <= 0) {
      showError("Vui lòng nhập bậc hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        minAmount: parseFloat(formData.minAmount),
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
        commissionPercentage: parseFloat(formData.commissionPercentage),
        tierLevel: parseInt(formData.tierLevel),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (rate?.id) {
        // Thêm id vào payload khi update
        payload.id = rate.id;
        await updateCommissionRate(rate.id, payload);
        showSuccess("Cập nhật bậc hoa hồng thành công");
      } else {
        await createCommissionRate(payload);
        showSuccess("Tạo bậc hoa hồng thành công");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving commission rate:", error);
      showError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateExample = () => {
    if (!formData.minAmount || !formData.commissionPercentage) return null;
    const exampleAmount = parseFloat(formData.minAmount) + 10000000;
    const commission =
      (exampleAmount * parseFloat(formData.commissionPercentage)) / 100;
    return {
      amount: exampleAmount,
      commission: commission,
    };
  };

  const example = calculateExample();

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {rate ? "Cập nhật bậc hoa hồng" : "Tạo bậc hoa hồng mới"}
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
            {/* Tier Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bậc <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tierLevel"
                value={formData.tierLevel}
                onChange={handleChange}
                placeholder="VD: 1, 2, 3..."
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Bậc càng cao, thường có tỷ lệ hoa hồng cao hơn
              </p>
            </div>

            {/* Min and Max Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doanh số tối thiểu (VNĐ){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minAmount"
                  value={formData.minAmount}
                  onChange={handleChange}
                  placeholder="VD: 0"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                {formData.minAmount && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCurrency(formData.minAmount)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doanh số tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  name="maxAmount"
                  value={formData.maxAmount}
                  onChange={handleChange}
                  placeholder="Để trống = không giới hạn"
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formData.maxAmount && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formatCurrency(formData.maxAmount)}
                  </p>
                )}
              </div>
            </div>

            {/* Commission Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ hoa hồng (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="commissionPercentage"
                value={formData.commissionPercentage}
                onChange={handleChange}
                placeholder="VD: 5"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Nhập số từ 0 đến 100</p>
            </div>

            {/* Example Calculation */}
            {example && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Ví dụ tính hoa hồng:
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-700">Doanh số</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {formatCurrency(example.amount)}
                    </p>
                  </div>
                  <div className="text-2xl text-blue-600">×</div>
                  <div>
                    <p className="text-xs text-blue-700">Tỷ lệ</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {formData.commissionPercentage}%
                    </p>
                  </div>
                  <div className="text-2xl text-blue-600">=</div>
                  <div>
                    <p className="text-xs text-blue-700">Hoa hồng</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(example.commission)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="VD: Bậc 1: Dưới 30 triệu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Áp dụng bậc hoa hồng này
              </label>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : rate ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommissionRateModal;
