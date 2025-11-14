import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createTicketCategory,
  updateTicketCategory,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const TicketCategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showError("Lỗi!", "Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);

    try {
      if (category) {
        // Update existing category
        await updateTicketCategory(category.id, formData);
        showSuccess("Thành công!", "Đã cập nhật danh mục");
      } else {
        // Create new category
        await createTicketCategory(formData);
        showSuccess("Thành công!", "Đã tạo danh mục mới");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showError(
        "Lỗi!",
        category ? "Không thể cập nhật danh mục" : "Không thể tạo danh mục"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {category ? "Chỉnh sửa Danh mục" : "Thêm Danh mục Mới"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập tên danh mục"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập mô tả danh mục"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : category ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketCategoryModal;
