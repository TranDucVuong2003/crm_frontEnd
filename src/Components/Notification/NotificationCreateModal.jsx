import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UsersIcon,
  UserIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  createNotification,
  getAllUsers,
  getAllDepartments,
  getAllRoles,
} from "../../Service/ApiService";
import Swal from "sweetalert2";

const NotificationCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetType: "All",
    targetIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const targetTypes = [
    {
      value: "All",
      label: "Tất cả người dùng",
      icon: UsersIcon,
      description: "Gửi đến tất cả users trong hệ thống",
    },
    {
      value: "Role",
      label: "Theo vai trò",
      icon: UserGroupIcon,
      description: "Gửi đến các role cụ thể (Admin, Manager, User)",
    },
    {
      value: "Department",
      label: "Theo phòng ban",
      icon: BuildingOfficeIcon,
      description: "Gửi đến các phòng ban cụ thể",
    },
    {
      value: "Specific",
      label: "User cụ thể",
      icon: UserIcon,
      description: "Gửi đến các user được chọn",
    },
  ];

  // Fetch users, departments or roles based on target type
  useEffect(() => {
    const fetchOptions = async () => {
      if (formData.targetType === "Specific") {
        try {
          setLoadingOptions(true);
          const response = await getAllUsers();
          if (response.data) {
            setUsers(response.data);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoadingOptions(false);
        }
      } else if (formData.targetType === "Department") {
        try {
          setLoadingOptions(true);
          const response = await getAllDepartments();
          if (response.data) {
            setDepartments(response.data);
          }
        } catch (error) {
          console.error("Error fetching departments:", error);
        } finally {
          setLoadingOptions(false);
        }
      } else if (formData.targetType === "Role") {
        try {
          setLoadingOptions(true);
          const response = await getAllRoles();
          if (response.data) {
            setRoles(response.data);
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
        } finally {
          setLoadingOptions(false);
        }
      }
    };

    fetchOptions();
  }, [formData.targetType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Nội dung không được để trống";
    }
    if (
      formData.targetType !== "All" &&
      (!formData.targetIds || formData.targetIds.length === 0)
    ) {
      newErrors.targetIds = "Vui lòng chọn ít nhất một đối tượng nhận";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        targetType: formData.targetType,
        targetIds:
          formData.targetType === "All" ? [] : formData.targetIds.map(Number),
      };

      const response = await createNotification(payload);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Thông báo đã được tạo và gửi thành công",
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset form
        setFormData({
          title: "",
          content: "",
          targetType: "All",
          targetIds: [],
        });

        // Trigger refresh and close
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating notification:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          backendErrors[key.toLowerCase()] = error.response.data.errors[key][0];
        });
        setErrors(backendErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text:
            error.response?.data?.message ||
            "Không thể tạo thông báo. Vui lòng thử lại.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (targetType) => {
    setFormData({
      ...formData,
      targetType,
      targetIds: [],
    });
    setErrors({ ...errors, targetIds: undefined });
    setShowDropdown(false);
  };

  const handleSelectChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedIds = options.map((option) => parseInt(option.value));
    setFormData({ ...formData, targetIds: selectedIds });
    setErrors({ ...errors, targetIds: undefined });
  };

  const toggleOption = (id) => {
    const currentIds = formData.targetIds;
    const newIds = currentIds.includes(id)
      ? currentIds.filter((itemId) => itemId !== id)
      : [...currentIds, id];

    setFormData({ ...formData, targetIds: newIds });
    setErrors({ ...errors, targetIds: undefined });
  };

  const getSelectedText = () => {
    if (formData.targetIds.length === 0) return "Chọn...";

    if (formData.targetType === "Role") {
      const selected = roles.filter((r) => formData.targetIds.includes(r.id));
      return selected.map((r) => r.name).join(", ");
    } else if (formData.targetType === "Department") {
      const selected = departments.filter((d) =>
        formData.targetIds.includes(d.id)
      );
      return selected.map((d) => d.departmentName || d.name).join(", ");
    } else if (formData.targetType === "Specific") {
      const selected = users.filter((u) => formData.targetIds.includes(u.id));
      return selected.map((u) => u.fullName || u.name).join(", ");
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Tạo thông báo mới
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tiêu đề thông báo..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.content ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập nội dung chi tiết..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                )}
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gửi đến <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {targetTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTargetChange(type.value)}
                        className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                          formData.targetType === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                            formData.targetType === type.value
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                        <div className="text-left">
                          <div
                            className={`text-sm font-medium ${
                              formData.targetType === type.value
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {type.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Selection - Show based on targetType */}
              {formData.targetType === "Role" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn vai trò <span className="text-red-500">*</span>
                  </label>
                  {loadingOptions ? (
                    <div className="flex items-center justify-center py-4 border rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                          className={`w-full px-4 py-2 border rounded-lg text-left flex items-center justify-between ${
                            errors.targetIds
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              formData.targetIds.length === 0
                                ? "text-gray-400"
                                : "text-gray-900"
                            }
                          >
                            {getSelectedText()}
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              showDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
                            {roles.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Không có vai trò nào
                              </div>
                            ) : (
                              roles.map((role) => (
                                <label
                                  key={role.id}
                                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.targetIds.includes(
                                      role.id
                                    )}
                                    onChange={() => toggleOption(role.id)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-3 text-sm text-gray-900">
                                    {role.name}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {errors.targetIds && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.targetIds}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Chọn nhiều vai trò nếu cần
                      </p>
                    </>
                  )}
                </div>
              )}

              {formData.targetType === "Department" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phòng ban <span className="text-red-500">*</span>
                  </label>
                  {loadingOptions ? (
                    <div className="flex items-center justify-center py-4 border rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                          className={`w-full px-4 py-2 border rounded-lg text-left flex items-center justify-between ${
                            errors.targetIds
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              formData.targetIds.length === 0
                                ? "text-gray-400"
                                : "text-gray-900"
                            }
                          >
                            {getSelectedText()}
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              showDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
                            {departments.map((dept) => (
                              <label
                                key={dept.id}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.targetIds.includes(dept.id)}
                                  onChange={() => toggleOption(dept.id)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm text-gray-900">
                                  {dept.departmentName || dept.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.targetIds && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.targetIds}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Chọn nhiều phòng ban nếu cần
                      </p>
                    </>
                  )}
                </div>
              )}

              {formData.targetType === "Specific" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn user <span className="text-red-500">*</span>
                  </label>
                  {loadingOptions ? (
                    <div className="flex items-center justify-center py-4 border rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500">
                        Đang tải...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                          className={`w-full px-4 py-2 border rounded-lg text-left flex items-center justify-between ${
                            errors.targetIds
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <span
                            className={
                              formData.targetIds.length === 0
                                ? "text-gray-400"
                                : "text-gray-900"
                            }
                          >
                            {getSelectedText()}
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              showDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {showDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
                            {users.map((user) => (
                              <label
                                key={user.id}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.targetIds.includes(user.id)}
                                  onChange={() => toggleOption(user.id)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm text-gray-900">
                                  {user.fullName || user.name} - {user.email}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.targetIds && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.targetIds}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Chọn nhiều user nếu cần
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    <span>Tạo và gửi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationCreateModal;
