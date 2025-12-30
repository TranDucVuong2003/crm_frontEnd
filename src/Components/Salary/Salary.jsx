import React, { useState, useEffect } from "react";
import {
  BanknotesIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getAllDepartments } from "../../Service/ApiService";
import { showErrorAlert } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";
import SalaryReportPreviewModal from "./SalaryReportPreviewModal";
import SalaryReportFilterModal from "./SalaryReportFilterModal";

const Salary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSalary: 0,
    averageSalary: 0,
    totalEmployees: 0,
    growth: 0,
  });

  // Get current month and year for report filter
  const currentDate = new Date();
  const [reportFilter, setReportFilter] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    departmentId: null,
    createdByName: user?.fullname || "Admin",
  });

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách phòng ban
      const response = await getAllDepartments();
      const departmentsData = response.data;

      // Mock data cho statistics (sẽ cần API riêng cho phần này)
      setStatistics({
        totalSalary: 500000000, // 500 triệu
        averageSalary: 15000000, // 15 triệu
        totalEmployees: 33,
        growth: 8.5,
      });

      // Map dữ liệu từ API sang format hiển thị
      const mappedDepartments = departmentsData.map((dept) => ({
        id: dept.id,
        name: dept.name,
        city: dept.resion?.city || "N/A",
        employeeCount: 0, // TODO: Cần API để lấy số nhân viên
        totalSalary: 0, // TODO: Cần API để lấy tổng lương
        averageSalary: 0, // TODO: Cần API để lấy lương TB
        growth: 0, // TODO: Cần API để lấy % tăng trưởng
        createdAt: dept.createdAt,
      }));

      setDepartments(mappedDepartments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      showErrorAlert(
        "Lỗi",
        "Không thể tải dữ liệu phòng ban. Vui lòng thử lại"
      );
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleDepartmentClick = (department) => {
    // Navigate to department detail page
    navigate(`/accounting/salary/department/${department.id}`);
  };

  const handleFilterSubmit = (filterData) => {
    // Update report filter with selected month/year and current user
    setReportFilter({
      month: filterData.month,
      year: filterData.year,
      departmentId: null,
      createdByName: user?.fullname || "Admin",
    });
    // Close filter modal and open preview modal
    setShowFilterModal(false);
    setShowReportPreview(true);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              trend >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const DepartmentCard = ({ department }) => (
    <div
      onClick={() => handleDepartmentClick(department)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <BuildingOfficeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {department.name}
            </h3>
            <p className="text-sm text-gray-500">{department.city}</p>
          </div>
        </div>
        {department.growth !== undefined && department.growth !== 0 && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              department.growth >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {department.growth >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold">
              {Math.abs(department.growth)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {department.employeeCount > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Số nhân viên</span>
            <span className="text-sm font-semibold text-gray-900">
              {department.employeeCount} người
            </span>
          </div>
        )}
        {department.totalSalary > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Tổng lương</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(department.totalSalary)}
            </span>
          </div>
        )}
        {department.averageSalary > 0 && (
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">Lương TB</span>
            <span className="text-sm font-semibold text-blue-600">
              {formatCurrency(department.averageSalary)}
            </span>
          </div>
        )}
        {department.employeeCount === 0 && department.totalSalary === 0 && (
          <div className="py-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center italic">
              Chưa có dữ liệu lương
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
          Xem chi tiết
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lương</h1>
          <p className="text-gray-600 mt-1">
            Thống kê và phân tích lương theo phòng ban
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/accounting/salary/configuration")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <CurrencyDollarIcon className="h-5 w-5" />
            Cấu hình lương
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <ChartBarIcon className="h-5 w-5" />
            Báo cáo chi tiết
          </button>
          <button
            onClick={() => navigate("/accounting/salary/attendance-management")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <UsersIcon className="h-5 w-5" />
            Quản lý ngày công
          </button>
          <button
            onClick={() => navigate("/accounting/salary/adjustments")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Phụ cấp & Điều chỉnh
          </button>
          <button
            onClick={() => navigate("/accounting/salary/payslips")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Quản lý Phiếu lương
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BanknotesIcon}
          title="Tổng quỹ lương"
          value={formatCurrency(statistics.totalSalary)}
          subtitle="Tháng này"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          title="Lương trung bình"
          value={formatCurrency(statistics.averageSalary)}
          subtitle="Mỗi nhân viên"
        />
        <StatCard
          icon={UsersIcon}
          title="Tổng nhân viên"
          value={formatNumber(statistics.totalEmployees)}
          subtitle="Đang hoạt động"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Tăng trưởng"
          value={`${statistics.growth}%`}
          subtitle="So với tháng trước"
          trend={statistics.growth}
        />
      </div>

      {/* Departments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Lương theo phòng ban
          </h2>
          <p className="text-sm text-gray-500">
            {departments.length} phòng ban
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      </div>

      {/* Empty State (if no departments) */}
      {departments.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có dữ liệu
          </h3>
          <p className="text-gray-600">
            Chưa có thông tin lương theo phòng ban
          </p>
        </div>
      )}

      {/* Salary Report Filter Modal */}
      <SalaryReportFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onSubmit={handleFilterSubmit}
        defaultValues={{
          month: reportFilter.month,
          year: reportFilter.year,
        }}
      />

      {/* Salary Report Preview Modal */}
      <SalaryReportPreviewModal
        isOpen={showReportPreview}
        onClose={() => setShowReportPreview(false)}
        filterParams={reportFilter}
      />
    </div>
  );
};

export default Salary;
