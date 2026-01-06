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
  PaperClipIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  createSalaryContract,
  getAllUsers,
  getAllSalaryContracts,
  deleteSalaryContract,
  updateSalaryContract,
  downloadCommitment08Template,
} from "../../Service/ApiService";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
} from "../../utils/sweetAlert";

const SalaryConfiguration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const contractTypes = [
    { value: "OFFICIAL", label: "Chính thức" },
    { value: "PROBATION", label: "Thử việc" },
    { value: "INTERN", label: "Thực tập" },
    { value: "PART_TIME", label: "Bán thời gian" },
  ];

  useEffect(() => {
    fetchUsers();
    fetchContracts();
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

  const fetchContracts = async () => {
    setLoadingContracts(true);
    try {
      const response = await getAllSalaryContracts();
      // Handle different response formats
      const contractsList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setContracts(contractsList);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]); // Ensure contracts is always an array
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleDeleteContract = async (id) => {
    const result = await showDeleteConfirm(
      "Bạn có chắc chắn muốn xóa cấu hình lương này?",
      "Hành động này không thể hoàn tác!"
    );

    if (result.isConfirmed) {
      try {
        await deleteSalaryContract(id);
        await fetchContracts();
        showSuccessAlert("Thành công", "Đã xóa cấu hình lương");
      } catch (error) {
        console.error("Error deleting contract:", error);
        showErrorAlert("Lỗi", "Không thể xóa cấu hình lương");
      }
    }
  };

  const handleDownloadAttachment = (contract) => {
    if (contract.attachmentPath) {
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const fileUrl = `${baseUrl}${contract.attachmentPath}`;
      window.open(fileUrl, "_blank");
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

    // If unchecking hasCommitment08, clear the file
    if (name === "hasCommitment08" && !checked) {
      handleRemoveFile();
    }

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      showErrorAlert(
        "Lỗi",
        "File không hợp lệ. Chỉ chấp nhận: PDF, DOC, DOCX, JPG, PNG"
      );
      e.target.value = null;
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      showErrorAlert("Lỗi", "File quá lớn. Kích thước tối đa: 5MB");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: (file.size / 1024).toFixed(2), // Convert to KB
      type: file.type,
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Clear file input
    const fileInput = document.getElementById("attachment");
    if (fileInput) fileInput.value = null;
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadCommitment08Template();

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mau-so-8-mst-tt86.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccessAlert("Thành công", "Đã tải file mẫu thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      showErrorAlert("Lỗi", "Không thể tải file mẫu. Vui lòng thử lại");
    }
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
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append("UserId", parseInt(formData.userId));
      formDataToSend.append("BaseSalary", parseInt(formData.baseSalary));
      formDataToSend.append(
        "InsuranceSalary",
        parseInt(formData.insuranceSalary)
      );
      formDataToSend.append("ContractType", formData.contractType);
      formDataToSend.append(
        "DependentsCount",
        parseInt(formData.dependentsCount)
      );
      formDataToSend.append("HasCommitment08", formData.hasCommitment08);

      // Append file if selected
      if (selectedFile) {
        formDataToSend.append("Attachment", selectedFile);
      }

      await createSalaryContract(formDataToSend);
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

            {/* Download Template - Only show when hasCommitment08 is checked */}
            {formData.hasCommitment08 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    Tải mẫu Cam kết Thông tư 08
                  </span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  File mẫu định dạng HTML để nhân viên điền thông tin
                </p>
              </div>
            )}

            {/* File Attachment Upload - Only show when hasCommitment08 is checked */}
            {formData.hasCommitment08 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <PaperClipIcon className="h-5 w-5 text-gray-500" />
                    File đính kèm (Hợp đồng, Thông tư, Cam kết...)
                  </div>
                </label>

                {!filePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      id="attachment"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor="attachment"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
                    >
                      <div className="text-center">
                        <PaperClipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="text-blue-600 font-medium">
                            Chọn file
                          </span>{" "}
                          hoặc kéo thả vào đây
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, JPG, PNG (Tối đa 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <PaperClipIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {filePreview.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {filePreview.size} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            )}

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

        {/* Contracts List Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-lg mt-6">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              Danh sách cấu hình lương đã tạo
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Tổng số: {Array.isArray(contracts) ? contracts.length : 0} cấu
              hình
            </p>
          </div>

          {/* Responsive Table Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Nhân viên
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Lương cơ bản
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Lương BHXH
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Loại HĐ
                  </th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    NPT
                  </th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Cam kết 08
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Ngày tạo
                  </th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingContracts ? (
                  <tr>
                    <td colSpan="9" className="px-3 md:px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-3 md:px-6 py-12 text-center">
                      <p className="text-gray-500 text-sm">
                        Chưa có cấu hình lương nào
                      </p>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(contracts) &&
                  contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm font-medium text-gray-900">
                          #{contract.id}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col min-w-[150px]">
                          <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {contract.userName || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            {contract.userEmail}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm font-semibold text-blue-600">
                          {formatCurrency(contract.baseSalary)} đ
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-900">
                          {formatCurrency(contract.insuranceSalary)} đ
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            contract.contractType === "OFFICIAL"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {contract.contractType === "OFFICIAL"
                            ? "Chính thức"
                            : contract.contractType}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-xs md:text-sm font-medium text-gray-900">
                          {contract.dependentsCount}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                        {contract.hasCommitment08 ? (
                          <CheckCircleIcon className="h-5 w-5 md:h-6 md:w-6 text-green-500 mx-auto" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-600">
                          {new Date(contract.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          {contract.attachmentPath && (
                            <button
                              onClick={() => handleDownloadAttachment(contract)}
                              className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Tải file đính kèm"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContract(contract.id)}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Scroll hint for mobile */}
          <div className="md:hidden px-4 py-2 bg-blue-50 border-t border-blue-200">
            <p className="text-xs text-blue-600 text-center">
              ← Vuốt sang trái để xem thêm →
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryConfiguration;
