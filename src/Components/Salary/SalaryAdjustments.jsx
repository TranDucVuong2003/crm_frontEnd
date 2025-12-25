import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  getSalaryComponentsByMonthYear,
  deleteSalaryComponent,
  getAllUsers,
} from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
  showConfirmDialog,
} from "../../utils/sweetAlert";
import SalaryAdjustmentModal from "./SalaryAdjustmentModal";

const SalaryAdjustments = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [allUsers, setAllUsers] = useState([]);
  const [components, setComponents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, allUsers, components]);

  const fetchAllData = async () => {
    setLoading(true);
    showLoading("Đang tải dữ liệu...");
    try {
      const [usersResponse, componentsResponse] = await Promise.all([
        getAllUsers(),
        getSalaryComponentsByMonthYear(selectedMonth, selectedYear),
      ]);

      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const componentsData = Array.isArray(componentsResponse.data)
        ? componentsResponse.data
        : [];

      setAllUsers(users);
      setComponents(componentsData);
      closeLoading();
    } catch (error) {
      closeLoading();
      console.error("Error fetching data:", error);
      setAllUsers([]);
      setComponents([]);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserComponents = (userId) => {
    return components.filter((comp) => comp.userId === userId);
  };

  const calculateUserTotals = (userId) => {
    const userComps = getUserComponents(userId);
    const totalIn = userComps
      .filter((c) => c.type === "in")
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalOut = userComps
      .filter((c) => c.type === "out")
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      count: userComps.length,
    };
  };

  const getCombinedData = () => {
    return allUsers.map((user) => {
      const totals = calculateUserTotals(user.id);
      const userComps = getUserComponents(user.id);
      return {
        userId: user.id,
        userName: user.fullName || user.name,
        userEmail: user.email,
        department: user.departmentName || "N/A",
        position: user.positionName || "N/A",
        components: userComps,
        hasComponents: userComps.length > 0,
        ...totals,
      };
    });
  };

  const filterData = () => {
    const combined = getCombinedData();

    const filtered = combined.filter((item) => {
      const matchesSearch =
        item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "has" && item.hasComponents) ||
        (statusFilter === "none" && !item.hasComponents);

      return matchesSearch && matchesStatus;
    });

    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirmDialog(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa khoản điều chỉnh này?",
      "warning"
    );

    if (isConfirmed) {
      showLoading("Đang xóa...");
      try {
        await deleteSalaryComponent(id);
        closeLoading();
        showSuccessAlert("Thành công", "Đã xóa khoản điều chỉnh");
        fetchAllData();
      } catch (error) {
        closeLoading();
        console.error("Error deleting component:", error);
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa khoản điều chỉnh"
        );
      }
    }
  };

  const handleEdit = (component) => {
    setSelectedComponent(component);
    setShowModal(true);
  };

  const handleCreate = (userId = null) => {
    setSelectedComponent(
      userId ? { userId, month: selectedMonth, year: selectedYear } : null
    );
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedComponent(null);
    fetchAllData();
  };

  const toggleUserExpand = (userId) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate statistics
  const usersWithComponents = allUsers.filter(
    (user) => getUserComponents(user.id).length > 0
  ).length;
  const totalInAmount = components
    .filter((c) => c.type === "in")
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalOutAmount = components
    .filter((c) => c.type === "out")
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const netAmount = totalInAmount - totalOutAmount;

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - 5 + i
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/accounting/salary")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Phụ cấp & Điều chỉnh lương
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các khoản cộng/trừ lương của nhân viên
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCreate()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Thêm điều chỉnh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              NV có điều chỉnh
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {usersWithComponents}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            / {allUsers.length} nhân viên
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowUpCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng cộng thêm</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalInAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowDownCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng khấu trừ</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutAmount)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Giá trị ròng</p>
          </div>
          <p
            className={`text-2xl font-bold ${
              netAmount >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netAmount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="has">Có điều chỉnh</option>
              <option value="none">Chưa có</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng ban
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chức vụ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số khoản
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cộng thêm
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khấu trừ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng cộng
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <React.Fragment key={item.userId}>
                    {/* Main Row */}
                    <tr
                      onClick={() =>
                        item.hasComponents && toggleUserExpand(item.userId)
                      }
                      className={`transition-colors ${
                        !item.hasComponents ? "bg-yellow-50" : ""
                      } ${
                        item.hasComponents
                          ? "hover:bg-gray-50 cursor-pointer"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.hasComponents && (
                          <div className="text-gray-400">
                            {expandedUsers.has(item.userId) ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-green-600">
                          +{formatCurrency(item.totalIn)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-red-600">
                          -{formatCurrency(item.totalOut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-bold ${
                            item.net >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(item.net)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleCreate(item.userId)}
                          className="text-blue-600 hover:text-blue-900 p-1 px-3 rounded hover:bg-blue-50 transition-colors"
                          title="Thêm điều chỉnh"
                        >
                          <PlusIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {expandedUsers.has(item.userId) &&
                      item.components.length > 0 && (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                              {item.components.map((comp) => (
                                <div
                                  key={comp.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        comp.type === "in"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {comp.type === "in" ? "Cộng" : "Trừ"}
                                    </span>
                                    <span className="text-sm text-gray-900 flex-1">
                                      {comp.reason}
                                    </span>
                                    <span
                                      className={`text-sm font-semibold ${
                                        comp.type === "in"
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {comp.type === "in" ? "+" : "-"}
                                      {formatCurrency(comp.amount)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(comp.createdAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => handleEdit(comp)}
                                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                      title="Sửa"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => handleDelete(comp.id)}
                                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                      title="Xóa"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">Không tìm thấy dữ liệu</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SalaryAdjustmentModal
          component={selectedComponent}
          month={selectedMonth}
          year={selectedYear}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SalaryAdjustments;
