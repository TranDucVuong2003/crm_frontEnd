import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  getAllTax,
  createTax,
  updateTax,
  deleteTax,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
} from "../../utils/sweetAlert";

const TaxModal = ({ isOpen, onClose }) => {
  const [taxes, setTaxes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    rate: "",
    notes: "",
  });

  // Fetch taxes from API
  useEffect(() => {
    if (isOpen) {
      fetchTaxes();
    }
  }, [isOpen]);

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTax();
      if (response.data) {
        setTaxes(response.data);
      }
    } catch (error) {
      console.error("Error fetching taxes:", error);
      showErrorAlert("Lỗi", "Không thể tải danh sách thuế");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      showLoading(
        isEditing ? "Đang cập nhật..." : "Đang tạo cấu hình thuế...",
        "Vui lòng đợi"
      );

      const taxData = {
        rate: parseFloat(formData.rate),
        notes: formData.notes,
      };

      if (isEditing) {
        // Update existing tax - include id in request body
        const updateData = {
          id: editingTax.id,
          ...taxData,
        };
        await updateTax(editingTax.id, updateData);
        showSuccessAlert("Thành công", "Cập nhật cấu hình thuế thành công!");
      } else {
        // Create new tax
        await createTax(taxData);
        showSuccessAlert("Thành công", "Tạo cấu hình thuế mới thành công!");
      }

      // Refresh the tax list
      await fetchTaxes();

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error saving tax:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message ||
          `Không thể ${isEditing ? "cập nhật" : "tạo"} cấu hình thuế`
      );
    }
  };

  const handleEdit = (tax) => {
    setIsEditing(true);
    setEditingTax(tax);
    setFormData({
      rate: tax.rate.toString(),
      notes: tax.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id, taxRate) => {
    const result = await showDeleteConfirm(`cấu hình thuế ${taxRate}%`);

    if (result.isConfirmed) {
      try {
        showLoading("Đang xóa...", "Vui lòng đợi");
        await deleteTax(id);
        showSuccessAlert("Thành công", "Xóa cấu hình thuế thành công!");

        // Refresh the tax list
        await fetchTaxes();
      } catch (error) {
        console.error("Error deleting tax:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa cấu hình thuế"
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      rate: "",
      notes: "",
    });
    setIsEditing(false);
    setEditingTax(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cấu hình thuế
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý các loại thuế và tỷ lệ thuế
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Add New Button */}
            {!showForm && (
              <div className="mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Thêm cấu hình thuế mới
                </button>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isEditing
                    ? "Chỉnh sửa cấu hình thuế"
                    : "Thêm cấu hình thuế mới"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỷ lệ thuế (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 10"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: VAT chuẩn 10% áp dụng cho tất cả dịch vụ..."
                    ></textarea>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      {isEditing ? "Cập nhật" : "Thêm mới"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tax List */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Danh sách cấu hình thuế ({taxes.length})
              </h3>

              {taxes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có cấu hình thuế nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {taxes.map((tax) => (
                    <div
                      key={tax.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 text-lg font-bold bg-blue-100 text-blue-800 rounded-full">
                            {tax.rate}%
                          </span>
                          <div className="text-xs text-gray-500">
                            <div>ID: {tax.id}</div>
                            <div>
                              Tạo:{" "}
                              {new Date(tax.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </div>
                        </div>
                        {tax.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {tax.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(tax)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tax.id, tax.rate)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxModal;
