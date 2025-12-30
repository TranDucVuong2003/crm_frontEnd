import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { createSalaryContract, getAllUsers } from "../../Service/ApiService";
import { showSuccessAlert, showErrorAlert } from "../../utils/sweetAlert";

const SalaryConfiguration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sameAsBaseSalary, setSameAsBaseSalary] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const userDropdownRef = React.useRef(null);
  const userInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    userId: "",
    baseSalary: "",
    insuranceSalary: "",
    contractType: "OFFICIAL",
    dependentsCount: 0,
    hasCommitment08: false,
  });

  const contractTypes = [
    { value: "OFFICIAL", label: "Chính thức" },
    { value: "PROBATION", label: "Thử việc" },
    { value: "INTERN", label: "Thực tập" },
    { value: "PART_TIME", label: "Bán thời gian" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      // Get all users (both admin and user roles)
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showErrorAlert("Lỗi", "Không thể tải danh sách nhân viên");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSearchChange = (e) => {
    setUserSearchTerm(e.target.value);
    setIsUserDropdownOpen(true);
  };

  const handleUserInputFocus = () => {
    setIsUserDropdownOpen(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearchTerm(user.name);
    setFormData((prev) => ({ ...prev, userId: user.id }));
    setIsUserDropdownOpen(false);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.name?.toLowerCase().includes(searchLower) ||
      user.position?.positionName?.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Remove non-numeric characters and convert to number
    const numericValue = value.replace(/[^0-9]/g, "");
    const parsedValue = numericValue ? parseInt(numericValue) : "";

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: parsedValue,
      };

      // If updating base salary and sameAsBaseSalary is true, sync insurance salary
      if (name === "baseSalary" && sameAsBaseSalary) {
        newData.insuranceSalary = parsedValue;
      }

      // Validate insurance salary is not greater than base salary
      if (
        name === "insuranceSalary" &&
        newData.baseSalary &&
        parsedValue > newData.baseSalary
      ) {
        showErrorAlert(
          "Lỗi",
          "Lương đóng bảo hiểm không được lớn hơn lương cơ bản"
        );
        return prev;
      }

      return newData;
    });
  };

  const handleToggleSameAsBaseSalary = () => {
    setSameAsBaseSalary((prev) => {
      const newValue = !prev;
      // If toggling on, sync insurance salary with base salary
      if (newValue && formData.baseSalary) {
        setFormData((prevData) => ({
          ...prevData,
          insuranceSalary: prevData.baseSalary,
        }));
      }
      return newValue;
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.userId) {
      showErrorAlert("Lỗi", "Vui lòng chọn nhân viên");
      return;
    }
    if (!formData.baseSalary || formData.baseSalary <= 0) {
      showErrorAlert("Lỗi", "Vui lòng nhập lương cơ bản hợp lệ");
      return;
    }
    if (!formData.insuranceSalary || formData.insuranceSalary <= 0) {
      showErrorAlert("Lỗi", "Vui lòng nhập lương đóng bảo hiểm hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: parseInt(formData.userId),
        baseSalary: parseInt(formData.baseSalary),
        insuranceSalary: parseInt(formData.insuranceSalary),
        contractType: formData.contractType,
        dependentsCount: parseInt(formData.dependentsCount),
        hasCommitment08: formData.hasCommitment08,
      };

      await createSalaryContract(payload);
      showSuccessAlert("Thành công", "Đã tạo cấu hình lương thành công");
      navigate("/accounting/salary");
    } catch (error) {
      console.error("Error creating salary contract:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Không thể tạo cấu hình lương. Vui lòng thử lại";
      showErrorAlert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => navigate("/accounting/salary")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cấu hình lương nhân viên
          </h1>
          <p className="text-gray-600 mt-1">
            Thiết lập thông tin lương và hợp đồng
          </p>
        </div>
      </div>

      {/* Main Layout: Form + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - 2 columns */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {/* Form Fields in 2 columns */}
          <div className="space-y-6">
            {/* User Selection - Full Width */}
            <div className="relative" ref={userDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  Nhân viên <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <input
                  ref={userInputRef}
                  type="text"
                  value={userSearchTerm}
                  onChange={handleUserSearchChange}
                  onFocus={handleUserInputFocus}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={
                    loadingUsers
                      ? "Đang tải danh sách nhân viên..."
                      : "Tìm kiếm nhân viên theo tên, email, phòng ban..."
                  }
                  disabled={loadingUsers}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown List */}
                {isUserDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {user.position?.positionName} •{" "}
                                {user.department?.name}
                              </div>
                            </div>
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        {loadingUsers
                          ? "Đang tải..."
                          : "Không tìm thấy nhân viên"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {users.length === 0 && !loadingUsers && (
                <p className="text-sm text-red-500 mt-1">
                  Không có nhân viên nào để cấu hình
                </p>
              )}
            </div>

            {/* 2 Column Grid for Salary Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                    Lương cơ bản <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="baseSalary"
                    value={formatCurrency(formData.baseSalary)}
                    onChange={handleNumberChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập lương cơ bản"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    VNĐ
                  </span>
                </div>
                {formData.baseSalary && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(formData.baseSalary)}
                  </p>
                )}
              </div>

              {/* Insurance Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                    Lương đóng bảo hiểm <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="insuranceSalary"
                    value={formatCurrency(formData.insuranceSalary)}
                    onChange={handleNumberChange}
                    disabled={sameAsBaseSalary}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      sameAsBaseSalary ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="Nhập lương đóng bảo hiểm"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    VNĐ
                  </span>
                </div>
                {formData.insuranceSalary && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(formData.insuranceSalary)}
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox for same as base salary - Below both fields */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="sameAsBaseSalary"
                checked={sameAsBaseSalary}
                onChange={handleToggleSameAsBaseSalary}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="sameAsBaseSalary"
                className="flex-1 cursor-pointer"
              >
                <span className="block text-sm font-medium text-gray-700">
                  Bằng lương cơ bản
                </span>
                <span className="text-xs text-gray-500 mt-1 block">
                  Tự động sử dụng lương cơ bản làm lương đóng bảo hiểm
                </span>
              </label>
            </div>

            {/* 2 Column Grid for Contract Type and Dependents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                    Loại hợp đồng <span className="text-red-500">*</span>
                  </div>
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {contractTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dependents Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    Số người phụ thuộc
                  </div>
                </label>
                <input
                  type="number"
                  name="dependentsCount"
                  value={formData.dependentsCount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Dùng để tính toán giảm trừ thuế thu nhập cá nhân
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">Lưu ý:</h3>
            <ul className="text-sm text-blue-800 space-y-2 mb-6">
              <li>• Lương cơ bản là mức lương chính thức theo hợp đồng</li>
              <li>
                • Lương đóng bảo hiểm thường bằng hoặc thấp hơn lương cơ bản
              </li>
              <li>
                • Loại hợp đồng ảnh hưởng đến chế độ phúc lợi và quyền lợi
              </li>
              <li>
                • Số người phụ thuộc được sử dụng để tính giảm trừ gia cảnh
              </li>
            </ul>

            {/* Has Commitment 08 */}
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200 mb-6">
              <input
                type="checkbox"
                name="hasCommitment08"
                checked={formData.hasCommitment08}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    Có cam kết theo Thông tư 08
                  </div>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Áp dụng cho nhân viên có thu nhập dưới 15,5 triệu/tháng được
                  miễn thuế TNCN
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Lưu cấu hình
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/accounting/salary")}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryConfiguration;
