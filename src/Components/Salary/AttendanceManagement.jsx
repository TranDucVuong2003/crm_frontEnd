import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  getMonthlyAttendancesByMonthYear,
  deleteMonthlyAttendance,
  getAllUsers,
} from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
  showConfirmDialog,
} from "../../utils/sweetAlert";
import AttendanceModal from "./AttendanceModal";
import AttendanceBatchModal from "./AttendanceBatchModal";

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [allUsers, setAllUsers] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [preselectedUserId, setPreselectedUserId] = useState(null);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalWorkDays: 0,
    averageWorkDays: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, allUsers, attendances]);

  const fetchAllData = async () => {
    setLoading(true);
    showLoading("Đang tải dữ liệu...");
    try {
      const [usersResponse, attendancesResponse] = await Promise.all([
        getAllUsers(),
        getMonthlyAttendancesByMonthYear(selectedMonth, selectedYear),
      ]);

      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const attendancesData = attendancesResponse.data?.attendances || [];
      const stats = attendancesResponse.data?.statistics || {
        totalEmployees: 0,
        totalWorkDays: 0,
        averageWorkDays: 0,
      };

      setAllUsers(users);
      setAttendances(attendancesData);
      setStatistics(stats);
      closeLoading();
    } catch (error) {
      closeLoading();
      console.error("Error fetching data:", error);
      setAllUsers([]);
      setAttendances([]);
      setStatistics({
        totalEmployees: 0,
        totalWorkDays: 0,
        averageWorkDays: 0,
      });
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCombinedData = () => {
    return allUsers.map((user) => {
      const attendance = attendances.find((att) => att.userId === user.id);
      return {
        userId: user.id,
        userName: user.name || user.fullName,
        userEmail: user.email,
        department: user.department?.name || "N/A",
        position: user.position?.positionName || "N/A",
        attendance: attendance || null,
        attendanceId: attendance?.id || null,
        hasAttendance: !!attendance,
        actualWorkDays: attendance?.actualWorkDays || 0,
        createdAt: attendance?.createdAt || null,
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
        (statusFilter === "completed" && item.hasAttendance) ||
        (statusFilter === "pending" && !item.hasAttendance);

      return matchesSearch && matchesStatus;
    });

    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirmDialog(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa ngày công này?",
      "warning"
    );

    if (isConfirmed) {
      showLoading("Đang xóa...");
      try {
        await deleteMonthlyAttendance(id);
        closeLoading();
        showSuccessAlert("Thành công", "Đã xóa ngày công");
        fetchAllData();
      } catch (error) {
        closeLoading();
        console.error("Error deleting attendance:", error);
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa ngày công"
        );
      }
    }
  };

  const handleEdit = (item) => {
    if (item.attendance) {
      setSelectedAttendance(item.attendance);
      setShowModal(true);
    }
  };

  const handleCreate = (userId = null) => {
    // Set selectedAttendance to null for create mode, but pass userId through modal props
    setSelectedAttendance(null);
    setPreselectedUserId(userId);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAttendance(null);
    setPreselectedUserId(null);
    fetchAllData();
  };

  const handleBatchModalClose = () => {
    setShowBatchModal(false);
    fetchAllData();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (hasAttendance) => {
    if (hasAttendance) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircleIcon className="h-4 w-4" />
          Đã nhập
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <ExclamationCircleIcon className="h-4 w-4" />
        Chưa nhập
      </span>
    );
  };

  const completedCount = allUsers.filter((user) =>
    attendances.some((att) => att.userId === user.id)
  ).length;
  const pendingCount = allUsers.length - completedCount;

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
                Quản lý ngày công
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi và quản lý ngày công của tất cả nhân viên
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <UserPlusIcon className="h-5 w-5" />
              Thêm hàng loạt
            </button>
            <button
              onClick={() => handleCreate()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm ngày công
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Đã nhập</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Chưa nhập</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Ngày công TB</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {statistics.averageWorkDays?.toFixed(1) || 0}
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
              <option value="completed">Đã nhập</option>
              <option value="pending">Chưa nhập</option>
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
                placeholder="Tìm theo tên, email, phòng ban..."
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
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày công
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày nhập
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.userId}
                    className={`hover:bg-gray-50 transition-colors ${
                      !item.hasAttendance ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.userEmail}
                          </div>
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
                      {getStatusBadge(item.hasAttendance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`text-sm font-semibold ${
                          item.hasAttendance ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        {item.actualWorkDays || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {item.hasAttendance ? (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="Sửa"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.attendanceId)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Xóa"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCreate(item.userId)}
                            className="text-green-600 hover:text-green-900 p-1 px-3 rounded hover:bg-green-50 transition-colors flex items-center gap-1"
                            title="Thêm ngày công"
                          >
                            <PlusIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">Nhập</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
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
        <AttendanceModal
          attendance={selectedAttendance}
          month={selectedMonth}
          year={selectedYear}
          preselectedUserId={preselectedUserId}
          onClose={handleModalClose}
        />
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <AttendanceBatchModal
          month={selectedMonth}
          year={selectedYear}
          existingAttendances={attendances}
          onClose={handleBatchModalClose}
        />
      )}
    </div>
  );
};

export default AttendanceManagement;
