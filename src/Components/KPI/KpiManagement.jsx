import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  PlusIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import {
  getAllKpiPackages,
  deleteKpiPackage,
  calculateAllKpi,
  getKpiStatistics,
  getAssignedUsers,
} from "../../Service/ApiService";
import { showSuccess, showError, showConfirm } from "../../utils/sweetAlert";
import Swal from "sweetalert2";
import KpiPackageModal from "./KpiPackageModal";
import AssignKpiModal from "./AssignKpiModal";

const KpiManagement = () => {
  const [kpiPackages, setKpiPackages] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesRes, statsRes] = await Promise.all([
        getAllKpiPackages(filters),
        getKpiStatistics(filters),
      ]);

      if (packagesRes.data.success) {
        setKpiPackages(packagesRes.data.data);
      }

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      showError("Không thể tải dữ liệu KPI");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setCurrentPackage(null);
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg) => {
    setCurrentPackage(pkg);
    setShowPackageModal(true);
  };

  const handleDeletePackage = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa gói KPI này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result) {
      try {
        await deleteKpiPackage(id);
        showSuccess("Đã xóa gói KPI thành công");
        fetchData();
      } catch (error) {
        showError("Không thể xóa gói KPI");
      }
    }
  };

  const handleAssignKpi = (packageId) => {
    setSelectedPackageId(packageId);
    setShowAssignModal(true);
  };

  const handleCalculateKpi = async () => {
    const result = await Swal.fire({
      title: "Tính toán KPI?",
      text: `Tính toán KPI cho tất cả users trong tháng ${filters.month}/${filters.year}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Tính toán",
      cancelButtonText: "Hủy",
    });

    if (result) {
      try {
        setLoading(true);
        const response = await calculateAllKpi(filters);

        if (response.data.success) {
          showSuccess(response.data.message);
          fetchData();
        }
      } catch (error) {
        showError("Không thể tính toán KPI");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleModalSuccess = () => {
    setShowPackageModal(false);
    setShowAssignModal(false);
    fetchData();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-2 text-indigo-600" />
              Quản lý KPI
            </h1>
            <p className="text-gray-600 mt-1">
              Thiết lập và theo dõi chỉ tiêu hiệu suất
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCalculateKpi}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Tính toán KPI
            </button>
            <button
              onClick={handleCreatePackage}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo gói KPI mới
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalUsers}
                </p>
              </div>
              <UserGroupIcon className="h-10 w-10 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600">
                {statistics.usersAchievedKpi} đạt KPI
              </span>
              <span className="text-sm text-gray-500"> / </span>
              <span className="text-sm text-red-600">
                {statistics.usersNotAchievedKpi} chưa đạt
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ đạt KPI</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.achievementRate?.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${statistics.achievementRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target / Thực tế</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(statistics.totalTargetAmount)}
                </p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(statistics.totalPaidAmount)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hoa hồng</p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatCurrency(statistics.totalCommissionAmount)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                {statistics.totalContracts} hợp đồng
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tháng
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value === "true" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngưng hoạt động</option>
              <option value="">Tất cả</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* KPI Packages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách gói KPI
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : kpiPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Chưa có gói KPI nào</p>
              <button
                onClick={handleCreatePackage}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Tạo gói KPI đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên gói
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tháng/Năm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kpiPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pkg.name}
                        </div>
                        {pkg.description && (
                          <div className="text-sm text-gray-500">
                            {pkg.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {pkg.month}/{pkg.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(pkg.targetAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {pkg.assignedUsersCount} người
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            pkg.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pkg.isActive ? "Hoạt động" : "Ngưng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleAssignKpi(pkg.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Gán cho users"
                        >
                          <UserPlusIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="Sửa"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPackageModal && (
        <KpiPackageModal
          package={currentPackage}
          onClose={() => setShowPackageModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showAssignModal && (
        <AssignKpiModal
          packageId={selectedPackageId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default KpiManagement;
