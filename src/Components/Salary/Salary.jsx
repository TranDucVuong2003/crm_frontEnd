import React, { useState, useEffect } from "react";
import {
  BanknotesIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getPayslipsByMonthYear } from "../../Service/ApiService";
import { showErrorAlert } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";
import SalaryReportPreviewModal from "./SalaryReportPreviewModal";
import SalaryReportFilterModal from "./SalaryReportFilterModal";

const Salary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSalary: 0,
    averageSalary: 0,
    totalEmployees: 0,
    growth: 0,
  });

  // Get current month and year for filter
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [reportFilter, setReportFilter] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    departmentId: null,
    createdByName: user?.fullname || "Admin",
  });

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMonth, selectedYear]);

  const fetchSalaryData = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách payslips theo tháng/năm
      const response = await getPayslipsByMonthYear(selectedMonth, selectedYear);
      const data = response.data;
      
      // Response có structure: { month, year, payslips, statistics }
      const payslipsData = data.payslips || [];
      const statsData = data.statistics || {};

      setPayslips(payslipsData);

      // Sử dụng statistics từ API
      setStatistics({
        totalSalary: statsData.totalGrossSalary || 0,
        averageSalary: statsData.totalEmployees > 0 
          ? statsData.totalGrossSalary / statsData.totalEmployees 
          : 0,
        totalEmployees: statsData.totalEmployees || 0,
        growth: 8.5, // TODO: Cần tính toán growth từ tháng trước
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      showErrorAlert("Lỗi", "Không thể tải dữ liệu lương. Vui lòng thử lại");
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

  const handleDepartmentClick = (payslip) => {
    // Navigate to payslip detail page
    navigate(`/accounting/salary/payslip/${payslip.id}`);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        label: "Nháp",
        color: "bg-gray-100 text-gray-700",
        icon: ClockIcon,
      },
      PENDING: {
        label: "Chờ duyệt",
        color: "bg-yellow-100 text-yellow-700",
        icon: ClockIcon,
      },
      APPROVED: {
        label: "Đã duyệt",
        color: "bg-blue-100 text-blue-700",
        icon: CheckCircleIcon,
      },
      PAID: {
        label: "Đã thanh toán",
        color: "bg-green-100 text-green-700",
        icon: CheckCircleIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
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

  const DepartmentCard = ({ payslip }) => {
    return (
      <tr
        onClick={() => handleDepartmentClick(payslip)}
        className="hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {payslip.userName}
            </span>
            <span className="text-sm text-gray-500">{payslip.userEmail}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className="text-sm text-gray-900">
            {payslip.month}/{payslip.year}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className="text-sm text-gray-900">
            {payslip.standardWorkDays}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(payslip.grossSalary)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(payslip.insuranceDeduction)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(payslip.taxAmount)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(payslip.netSalary)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {getStatusBadge(payslip.status)}
        </td>
      </tr>
    );
  };

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
            Thống kê và phân tích lương theo nhân viên
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

      {/* Month/Year Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-800">Kỳ lương</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors cursor-pointer"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-gray-400 font-medium">/</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors cursor-pointer"
              >
                {[...Array(5)].map((_, i) => {
                  const year = currentDate.getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200">
            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-blue-600 text-lg">{payslips.length}</span> phiếu lương
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BanknotesIcon}
          title="Tổng quỹ lương"
          value={formatCurrency(statistics.totalSalary)}
          subtitle={`Tháng ${selectedMonth}/${selectedYear}`}
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

      {/* Payslips Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách phiếu lương
          </h2>
          <p className="text-sm text-gray-500">{payslips.length} phiếu lương</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tháng/Năm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày công
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
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payslips.map((payslip) => (
                  <DepartmentCard key={payslip.id} payslip={payslip} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty State (if no payslips) */}
      {payslips.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có dữ liệu
          </h3>
          <p className="text-gray-600">Chưa có thông tin phiếu lương</p>
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
