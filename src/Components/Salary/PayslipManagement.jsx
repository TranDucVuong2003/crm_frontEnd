import React, { useState, useEffect } from "react";
import {
  EyeIcon,
  CalculatorIcon,
  CheckCircleIcon,
  TrashIcon,
  CalendarIcon,
  FunnelIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
  showConfirm,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import {
  getAllPayslips,
  calculatePayslip,
  calculateBatchPayslips,
  markPayslipAsPaid,
  deletePayslip,
  getAllUsers,
} from "../../Service/ApiService";
import PayslipDetailModal from "./PayslipDetailModal";

const PayslipManagement = () => {
  const [payslips, setPayslips] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, HAS_PAYSLIP, NO_PAYSLIP
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate modal
  const [calculateUserId, setCalculateUserId] = useState("");
  const [calculateMonth, setCalculateMonth] = useState(
    new Date().getMonth() + 1
  );
  const [calculateYear, setCalculateYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAllData();
  }, [filterMonth, filterYear]);

  useEffect(() => {
    applyFilters();
  }, [allUsers, payslips, filterStatus, searchTerm]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersResponse, payslipsResponse] = await Promise.all([
        getAllUsers(),
        getAllPayslips(),
      ]);
      setAllUsers(usersResponse.data || []);
      setPayslips(payslipsResponse.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showErrorAlert("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Get combined data for selected month/year
    const combinedData = allUsers.map((user) => {
      const userPayslip = payslips.find(
        (p) =>
          p.userId === user.id &&
          p.month === parseInt(filterMonth) &&
          p.year === parseInt(filterYear)
      );

      return {
        ...user,
        payslip: userPayslip || null,
        hasPayslip: !!userPayslip,
      };
    });

    let filtered = [...combinedData];

    // Filter by status
    if (filterStatus === "HAS_PAYSLIP") {
      filtered = filtered.filter((item) => item.hasPayslip);
    } else if (filterStatus === "NO_PAYSLIP") {
      filtered = filtered.filter((item) => !item.hasPayslip);
    }

    // Search by name or email
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(searchLower) ||
          item.email?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
  };

  const handleCalculateSingle = async () => {
    if (!calculateUserId) {
      showErrorAlert("Vui lòng nhập User ID");
      return;
    }

    try {
      showLoading("Đang tính toán phiếu lương...");
      await calculatePayslip({
        userId: parseInt(calculateUserId),
        month: parseInt(calculateMonth),
        year: parseInt(calculateYear),
      });
      closeLoading();
      showSuccessAlert("Đã tính toán phiếu lương thành công!");
      setShowCalculateModal(false);
      setCalculateUserId("");
      fetchAllData();
    } catch (error) {
      closeLoading();
      showErrorAlert(
        error.response?.data?.message || "Không thể tính toán phiếu lương"
      );
    }
  };

  const handleCalculateBatch = async () => {
    const result = await showConfirm(
      "Xác nhận tính lương hàng loạt",
      `Bạn có chắc chắn muốn tính lương cho tất cả nhân viên trong tháng ${calculateMonth}/${calculateYear}?`
    );

    if (result) {
      try {
        showLoading("Đang tính toán phiếu lương hàng loạt...");
        await calculateBatchPayslips({
          month: parseInt(calculateMonth),
          year: parseInt(calculateYear),
        });
        closeLoading();
        showSuccessAlert("Đã tính toán phiếu lương hàng loạt thành công!");
        setShowCalculateModal(false);
        fetchAllData();
      } catch (error) {
        closeLoading();
        showErrorAlert(
          error.response?.data?.message ||
            "Không thể tính toán phiếu lương hàng loạt"
        );
      }
    }
  };

  const handleCalculateMissing = async () => {
    const usersWithoutPayslip = filteredData.filter((item) => !item.hasPayslip);

    if (usersWithoutPayslip.length === 0) {
      showErrorAlert("Tất cả nhân viên đã có phiếu lương");
      return;
    }

    const result = await showConfirm(
      "Xác nhận tính lương hàng loạt",
      `Tính lương cho ${usersWithoutPayslip.length} nhân viên chưa có phiếu lương trong tháng ${filterMonth}/${filterYear}?`
    );

    if (result) {
      try {
        showLoading(`Đang tính toán phiếu lương hàng loạt...`);

        // Gọi API batch để tính lương cho tất cả nhân viên chưa có phiếu lương
        await calculateBatchPayslips({
          month: parseInt(filterMonth),
          year: parseInt(filterYear),
        });

        closeLoading();
        showSuccessAlert(`Đã tính lương hàng loạt thành công!`);
        fetchAllData();
      } catch (error) {
        closeLoading();
        showErrorAlert(
          error.response?.data?.message || "Không thể tính toán phiếu lương"
        );
      }
    }
  };

  const handleViewDetail = (payslip) => {
    setSelectedPayslip(payslip);
    setShowDetailModal(true);
  };

  const handleMarkPaid = async (payslip) => {
    const result = await showDeleteConfirm(
      "Xác nhận thanh toán",
      `Đánh dấu phiếu lương của ${payslip.userName} đã thanh toán?`
    );

    if (result) {
      try {
        showLoading("Đang cập nhật...");
        await markPayslipAsPaid(payslip.id);
        closeLoading();
        showSuccessAlert("Đã đánh dấu thanh toán thành công!");
        fetchAllData();
      } catch (error) {
        closeLoading();
        showErrorAlert(
          error.response?.data?.message || "Không thể đánh dấu thanh toán"
        );
      }
    }
  };

  const handleDelete = async (payslip) => {
    const result = await showDeleteConfirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa phiếu lương của ${payslip.userName}?`
    );

    if (result) {
      try {
        showLoading("Đang xóa...");
        await deletePayslip(payslip.id);
        closeLoading();
        showSuccessAlert("Đã xóa phiếu lương thành công!");
        fetchAllData();
      } catch (error) {
        closeLoading();
        showErrorAlert(
          error.response?.data?.message || "Không thể xóa phiếu lương"
        );
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Nháp
          </span>
        );
      case "PAID":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Đã thanh toán
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Statistics
  const totalUsers = allUsers.length;
  const usersWithPayslip = filteredData.filter(
    (item) => item.hasPayslip
  ).length;
  const usersWithoutPayslip = filteredData.filter(
    (item) => !item.hasPayslip
  ).length;
  const totalPayslipAmount = payslips
    .filter(
      (p) =>
        p.month === parseInt(filterMonth) && p.year === parseInt(filterYear)
    )
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  // Generate year options (current year +/- 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Quản lý Phiếu lương
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tính toán và quản lý phiếu lương nhân viên - {filterMonth}/
              {filterYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculateMissing}
              disabled={usersWithoutPayslip === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <DocumentPlusIcon className="w-5 h-5" />
              Tính lương hàng loạt ({usersWithoutPayslip})
            </button>
            <button
              onClick={() => setShowCalculateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalculatorIcon className="w-5 h-5" />
              Tính lương
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Tổng nhân viên
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalUsers}
                </p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Đã tạo phiếu
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {usersWithPayslip}
                </p>
              </div>
              <DocumentCheckIcon className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Chưa tạo phiếu
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {usersWithoutPayslip}
                </p>
              </div>
              <DocumentPlusIcon className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Tổng quỹ lương
                </p>
                <p className="text-xl font-bold text-indigo-600 mt-1">
                  {formatCurrency(totalPayslipAmount)}
                </p>
              </div>
              <CalendarIcon className="w-10 h-10 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên nhân viên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Năm
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Tất cả</option>
              <option value="HAS_PAYSLIP">Đã tạo phiếu</option>
              <option value="NO_PAYSLIP">Chưa tạo phiếu</option>
            </select>
          </div>

          {/* Summary */}
          <div className="md:col-span-3 flex items-end justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold">{filteredData.length}</span> /{" "}
              <span className="font-semibold">{totalUsers}</span> nhân viên
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái phiếu
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lương gộp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bảo hiểm
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thuế
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thực nhận
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái TT
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không tìm thấy nhân viên nào
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${
                    !item.hasPayslip ? "bg-orange-50/30" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.fullName}
                      </div>
                      <div className="text-xs text-gray-500">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.hasPayslip ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Đã tạo
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        Chưa tạo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {item.payslip
                      ? formatCurrency(item.payslip.grossSalary)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    {item.payslip
                      ? `-${formatCurrency(item.payslip.insuranceDeduction)}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    {item.payslip
                      ? `-${formatCurrency(item.payslip.taxAmount)}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    {item.payslip
                      ? formatCurrency(item.payslip.netSalary)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.payslip ? getStatusBadge(item.payslip.status) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {item.hasPayslip ? (
                        <>
                          <button
                            onClick={() => handleViewDetail(item.payslip)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {item.payslip.status === "DRAFT" && (
                            <button
                              onClick={() => handleMarkPaid(item.payslip)}
                              className="text-green-600 hover:text-green-900"
                              title="Đánh dấu đã thanh toán"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.payslip)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setCalculateUserId(item.id.toString());
                            setCalculateMonth(filterMonth);
                            setCalculateYear(filterYear);
                            setShowCalculateModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                          title="Tạo phiếu lương"
                        >
                          Tạo phiếu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Calculate Modal */}
      {showCalculateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Tính lương
              </h3>
              <button
                onClick={() => setShowCalculateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={calculateMonth}
                      onChange={(e) => setCalculateMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={calculateYear}
                      onChange={(e) => setCalculateYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Tính lương đơn lẻ
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={calculateUserId}
                      onChange={(e) => setCalculateUserId(e.target.value)}
                      placeholder="Nhập ID nhân viên"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleCalculateSingle}
                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tính lương cho 1 nhân viên
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Tính lương hàng loạt
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Tính lương cho tất cả nhân viên trong tháng {calculateMonth}
                    /{calculateYear}
                  </p>
                  <button
                    onClick={handleCalculateBatch}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tính lương hàng loạt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayslip && (
        <PayslipDetailModal
          payslip={selectedPayslip}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPayslip(null);
          }}
          onRefresh={fetchPayslips}
        />
      )}
    </div>
  );
};

export default PayslipManagement;
