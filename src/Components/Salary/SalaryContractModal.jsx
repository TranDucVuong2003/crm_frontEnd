import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  createSalaryContract,
  updateSalaryContract,
  getAllUsers,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const SalaryContractModal = ({
  isOpen,
  onClose,
  editingContract,
  onSuccess,
}) => {
  const initialFormData = {
    userId: "",
    baseSalary: "",
    insuranceSalary: "0",
    contractType: "OFFICIAL",
    dependentsCount: 0,
    hasCommitment08: false,
    attachment: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Fetch users on mount
  useEffect(() => {
    if (isOpen && !editingContract) {
      fetchUsers();
    }
  }, [isOpen, editingContract]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (editingContract) {
        setFormData({
          userId: editingContract.userId,
          baseSalary: editingContract.baseSalary,
          insuranceSalary: editingContract.insuranceSalary,
          contractType: editingContract.contractType,
          dependentsCount: editingContract.dependentsCount,
          hasCommitment08: editingContract.hasCommitment08,
          attachment: null,
        });
        if (editingContract.attachmentFileName) {
          setFilePreview(editingContract.attachmentFileName);
        }
      } else {
        setFormData(initialFormData);
        setSelectedFile(null);
        setFilePreview(null);
      }
    }
  }, [isOpen, editingContract]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showError("Lỗi!", "Không thể tải danh sách nhân viên");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(file.type)) {
        showError(
          "File không hợp lệ!",
          "Chỉ chấp nhận file: .pdf, .doc, .docx, .jpg, .jpeg, .png"
        );
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("File quá lớn!", "Kích thước tối đa: 5MB");
        return;
      }

      setSelectedFile(file);
      setFilePreview(file.name);
      setFormData((prev) => ({
        ...prev,
        attachment: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare FormData for multipart/form-data
      const apiFormData = new FormData();

      if (editingContract) {
        // UPDATE: Only send fields that have values (partial update)
        // Validation for update - at least one field should be provided
        let hasChanges = false;

        if (formData.baseSalary && formData.baseSalary > 0) {
          apiFormData.append("BaseSalary", formData.baseSalary);
          hasChanges = true;
        }

        if (
          formData.insuranceSalary !== undefined &&
          formData.insuranceSalary !== null
        ) {
          apiFormData.append("InsuranceSalary", formData.insuranceSalary);
          hasChanges = true;
        }

        if (formData.contractType) {
          apiFormData.append("ContractType", formData.contractType);
          hasChanges = true;
        }

        if (formData.dependentsCount !== undefined) {
          apiFormData.append("DependentsCount", formData.dependentsCount);
          hasChanges = true;
        }

        if (formData.hasCommitment08 !== undefined) {
          apiFormData.append("HasCommitment08", formData.hasCommitment08);
          hasChanges = true;
        }

        if (selectedFile) {
          apiFormData.append("Attachment", selectedFile);
          hasChanges = true;
        }

        if (!hasChanges) {
          showError("Thiếu thông tin!", "Vui lòng thay đổi ít nhất một trường");
          setLoading(false);
          return;
        }

        await updateSalaryContract(editingContract.id, apiFormData);
        showSuccess("Thành công!", "Cập nhật cấu hình lương thành công");
      } else {
        // CREATE: All required fields must be present
        if (!formData.userId) {
          showError("Thiếu thông tin!", "Vui lòng chọn nhân viên");
          setLoading(false);
          return;
        }

        if (!formData.baseSalary || formData.baseSalary <= 0) {
          showError("Thiếu thông tin!", "Lương cơ bản phải lớn hơn 0");
          setLoading(false);
          return;
        }

        apiFormData.append("UserId", formData.userId);
        apiFormData.append("BaseSalary", formData.baseSalary);
        apiFormData.append("InsuranceSalary", formData.insuranceSalary || 0);
        apiFormData.append("ContractType", formData.contractType);
        apiFormData.append("DependentsCount", formData.dependentsCount);
        apiFormData.append("HasCommitment08", formData.hasCommitment08);

        if (selectedFile) {
          apiFormData.append("Attachment", selectedFile);
        }

        await createSalaryContract(apiFormData);
        showSuccess("Thành công!", "Tạo cấu hình lương thành công");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving salary contract:", error);
      showError(
        "Lỗi!",
        error.response?.data?.message || "Có lỗi xảy ra khi lưu cấu hình lương"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            {editingContract
              ? "Chỉnh sửa cấu hình lương"
              : "Thêm cấu hình lương mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* User Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                Nhân viên <span className="text-red-500">*</span>
              </label>
              {editingContract ? (
                <input
                  type="text"
                  value={editingContract.userName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              ) : loadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username} - {user.email}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Tìm kiếm nhân viên theo tên, email, phòng ban...
              </p>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Salary */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  placeholder="VD: 20000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Insurance Salary */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  Lương đóng bảo hiểm (VNĐ)
                </label>
                <input
                  type="number"
                  name="insuranceSalary"
                  value={formData.insuranceSalary}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="0 = tự động tính"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để 0 để hệ thống tự động tính theo mức lương tối thiểu
                </p>
              </div>
            </div>

            {/* Contract Type and Dependents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                  Loại hợp đồng <span className="text-red-500">*</span>
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="OFFICIAL">Chính thức</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              {/* Dependents Count */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="h-5 w-5 text-orange-600" />
                  Số người phụ thuộc
                </label>
                <input
                  type="number"
                  name="dependentsCount"
                  value={formData.dependentsCount}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số người phụ thuộc để tính giảm trừ thuế TNCN
                </p>
              </div>
            </div>

            {/* Has Commitment 08 */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                name="hasCommitment08"
                checked={formData.hasCommitment08}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  Có cam kết 08 không?
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Áp dụng cho nhân viên có thu nhập dưới 11 triệu/tháng được
                  miễn thuế TNCN
                </p>
              </div>
            </div>

            {/* File Attachment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CloudArrowUpIcon className="h-5 w-5 text-indigo-600" />
                File đính kèm
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click để chọn file hoặc kéo thả file vào đây
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Hỗ trợ: PDF, DOC, DOCX, JPG, JPEG, PNG (Max: 5MB)
                  </span>
                </label>
                {filePreview && (
                  <div className="mt-3 text-sm text-green-600 font-medium">
                    📎 {filePreview}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{editingContract ? "Cập nhật" : "Tạo mới"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryContractModal;
