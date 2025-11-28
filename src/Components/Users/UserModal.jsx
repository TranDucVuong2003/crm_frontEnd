import React, { useState, useEffect } from "react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  createUser,
  updateUser,
  getAllPositions,
  getAllDepartments,
  getAllRoles,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const UserModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    positionId: "",
    departmentId: "",
    roleId: "",
    phoneNumber: "",
    address: "",
  });

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      console.log("Editing user:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        positionId: user.position?.id || user.positionId || "",
        departmentId: user.department?.id || user.departmentId || "",
        roleId: user.role?.id || user.roleId || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    } else {
      console.log("Creating new user");
      setFormData({
        name: "",
        email: "",
        password: "",
        positionId: "",
        departmentId: "",
        roleId: "",
        phoneNumber: "",
        address: "",
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const fetchDropdownData = async () => {
    try {
      const [positionsRes, departmentsRes, rolesRes] = await Promise.all([
        getAllPositions(),
        getAllDepartments(),
        getAllRoles(),
      ]);
      setPositions(positionsRes.data || []);
      setDepartments(departmentsRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showError("Lỗi", "Không thể tải dữ liệu dropdown");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!user && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.positionId) {
      newErrors.positionId = "Vui lòng chọn vị trí";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Vui lòng chọn phòng ban";
    }

    if (!formData.roleId) {
      newErrors.roleId = "Vui lòng chọn vai trò";
    }

    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (10-11 số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Changing field:", name, "to:", value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const generateStrongPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({
      ...prev,
      password: password,
    }));

    // Clear password error if exists
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data matching API format
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        positionId: parseInt(formData.positionId),
        departmentId: parseInt(formData.departmentId),
        roleId: parseInt(formData.roleId),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        firstLogin: requirePasswordChange,
      };

      // Only include password if provided
      if (formData.password.trim()) {
        submitData.password = formData.password;
      }

      console.log("Submitting data:", submitData);

      if (user) {
        const response = await updateUser(user.id, submitData);
        console.log("Update response:", response.data);
        showSuccess("Thành công!", "Người dùng đã được cập nhật.");
      } else {
        const response = await createUser(submitData);
        console.log("Create response:", response.data);
        showSuccess("Thành công!", "Người dùng mới đã được tạo.");
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.message) {
        showError("Lỗi", error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
        showError("Lỗi xác thực", errorMessages);
      } else {
        showError("Lỗi", "Không thể lưu người dùng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div
          className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                  placeholder="Nhập tên người dùng"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu {!user && <span className="text-red-500">*</span>}
                  {user && (
                    <span className="text-slate-500 text-xs ml-1">
                      (để trống nếu không đổi)
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-slate-300"
                      } ${
                        loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                      }`}
                      placeholder={user ? "Nhập mật khẩu mới" : "Nhập mật khẩu"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gen mật khẩu mạnh
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vị trí <span className="text-red-500">*</span>
                </label>
                <select
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.positionId ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                >
                  <option value="">Chọn vị trí...</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.positionName}
                    </option>
                  ))}
                </select>
                {errors.positionId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.positionId}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phòng ban <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.departmentId ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                >
                  <option value="">Chọn phòng ban...</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.roleId ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                >
                  <option value="">Chọn vai trò...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? "border-red-500" : "border-slate-300"
                  } ${loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  rows="3"
                  className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-center">
              {/* Left side - Toggle */}
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requirePasswordChange}
                    onChange={(e) => setRequirePasswordChange(e.target.checked)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-slate-700">
                  Yêu cầu đổi mật khẩu ngay lần đầu đăng nhập
                </span>
              </div>

              {/* Right side - Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : user ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
