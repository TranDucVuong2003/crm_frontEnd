import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import {
  getAllKPIRecords,
  getAllDepartments,
  getKPIRecordsSummary,
} from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";

const KPIReport = () => {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const [departmentStats, setDepartmentStats] = useState([]);

  function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  useEffect(() => {
    fetchInitialData();
  }, [selectedPeriod]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRecords(), fetchDepartments(), fetchSummary()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await getAllKPIRecords({ period: selectedPeriod });
      const data = response.data || [];
      setRecords(data);
      calculateDepartmentStats(data);
    } catch (error) {
      showError("Không thể tải dữ liệu KPI Records");
      console.error(error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getAllDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getKPIRecordsSummary({ period: selectedPeriod });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const calculateDepartmentStats = (recordsData) => {
    const deptMap = {};

    recordsData.forEach((record) => {
      const deptId = record.kpi?.departmentId || record.user?.departmentId;
      const deptName =
        record.kpi?.department?.name || record.user?.department?.name || "N/A";

      if (!deptMap[deptId]) {
        deptMap[deptId] = {
          departmentId: deptId,
          departmentName: deptName,
          totalRecords: 0,
          completedRecords: 0,
          totalCommission: 0,
          totalAchievement: 0,
          averageAchievement: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          users: new Set(),
        };
      }

      deptMap[deptId].totalRecords++;
      deptMap[deptId].totalAchievement += record.achievementPercentage || 0;
      deptMap[deptId].totalCommission += record.commissionAmount || 0;
      deptMap[deptId].users.add(record.userId);

      if (record.achievementPercentage >= 100) {
        deptMap[deptId].completedRecords++;
      }

      if (record.status === "Approved") {
        deptMap[deptId].approved++;
      } else if (record.status === "Pending") {
        deptMap[deptId].pending++;
      } else if (record.status === "Rejected") {
        deptMap[deptId].rejected++;
      }
    });

    const stats = Object.values(deptMap).map((dept) => ({
      ...dept,
      userCount: dept.users.size,
      averageAchievement: dept.totalRecords
        ? (dept.totalAchievement / dept.totalRecords).toFixed(2)
        : 0,
      completionRate: dept.totalRecords
        ? ((dept.completedRecords / dept.totalRecords) * 100).toFixed(2)
        : 0,
    }));

    // Sort by completion rate
    stats.sort((a, b) => b.completionRate - a.completionRate);
    setDepartmentStats(stats);
  };

  const filteredStats =
    selectedDepartment === "all"
      ? departmentStats
      : departmentStats.filter(
          (stat) => stat.departmentId === parseInt(selectedDepartment)
        );

  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getPerformanceBadge = (percentage) => {
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <TrophyIcon className="h-3 w-3" />
          Xuất sắc
        </span>
      );
    } else if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <CheckCircleIcon className="h-3 w-3" />
          Tốt
        </span>
      );
    } else if (percentage >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-3 w-3" />
          Trung bình
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3" />
          Cần cải thiện
        </span>
      );
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();

    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = `Tháng ${month}/${year}`;
      options.push({ value, label });
    }

    return options;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DocumentChartBarIcon className="h-8 w-8 text-blue-600" />
              Báo cáo tiến độ KPI
            </h1>
            <p className="text-gray-600 mt-2">
              Theo dõi và đánh giá hiệu suất KPI của các phòng ban
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{summary.totalRecords}</span>
            </div>
            <p className="text-blue-100 text-sm">Tổng số KPI Records</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">
                {summary.completionRate?.toFixed(1)}%
              </span>
            </div>
            <p className="text-green-100 text-sm">Tỷ lệ hoàn thành</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="h-8 w-8 opacity-80" />
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {formatNumber(summary.totalCommission / 1000000)}M
                </span>
                <span className="text-xl"> ₫</span>
              </div>
            </div>
            <p className="text-purple-100 text-sm">Tổng hoa hồng</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{summary.totalUsers}</span>
            </div>
            <p className="text-orange-100 text-sm">Tổng số nhân viên</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {generatePeriodOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              Kỳ báo cáo:{" "}
              <span className="font-semibold">{selectedPeriod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredStats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có dữ liệu
          </h3>
          <p className="text-gray-500">
            Chưa có KPI Records nào cho kỳ {selectedPeriod}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStats.map((stat, index) => (
            <div
              key={stat.departmentId}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Department Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ChartBarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {stat.departmentName}
                        {index === 0 && (
                          <TrophyIcon className="h-5 w-5 text-yellow-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stat.userCount} nhân viên • {stat.totalRecords} KPI
                        Records
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getPerformanceBadge(stat.averageAchievement)}
                    <p className="text-sm text-gray-600 mt-1">
                      Xếp hạng #{index + 1}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tỷ lệ hoàn thành KPI
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stat.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getProgressBarColor(
                        stat.completionRate
                      )} h-3 rounded-full transition-all duration-500 relative`}
                      style={{
                        width: `${Math.min(stat.completionRate, 100)}%`,
                      }}
                    >
                      {stat.completionRate >= 10 && (
                        <span className="absolute right-2 top-0 h-full flex items-center text-xs text-white font-semibold">
                          {stat.completedRecords}/{stat.totalRecords}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Đạt trung bình</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.averageAchievement}%
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-gray-600">Đã duyệt</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {stat.approved}
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ClockIcon className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-gray-600">Chờ duyệt</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">
                      {stat.pending}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                      <p className="text-xs text-gray-600">Từ chối</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {stat.rejected}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
                      <p className="text-xs text-gray-600">Hoa hồng</p>
                    </div>
                    <p className="text-lg font-bold text-purple-700">
                      {formatNumber(stat.totalCommission / 1000000)}M ₫
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <UsersIcon className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-600">Nhân viên</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {stat.userCount}
                    </p>
                  </div>
                </div>

                {/* Detail Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hoàn thành KPI:</span>
                      <span className="font-semibold text-gray-900">
                        {stat.completedRecords} / {stat.totalRecords}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tỷ lệ phê duyệt:</span>
                      <span className="font-semibold text-gray-900">
                        {stat.totalRecords > 0
                          ? ((stat.approved / stat.totalRecords) * 100).toFixed(
                              1
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hoa hồng TB/người:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          stat.userCount > 0
                            ? stat.totalCommission / stat.userCount
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredStats.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            Tổng kết kỳ {selectedPeriod}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng phòng ban</p>
              <p className="text-3xl font-bold">{filteredStats.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng nhân viên</p>
              <p className="text-3xl font-bold">
                {filteredStats.reduce((sum, stat) => sum + stat.userCount, 0)}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng KPI Records</p>
              <p className="text-3xl font-bold">
                {filteredStats.reduce(
                  (sum, stat) => sum + stat.totalRecords,
                  0
                )}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng hoa hồng</p>
              <p className="text-3xl font-bold">
                {formatNumber(
                  filteredStats.reduce(
                    (sum, stat) => sum + stat.totalCommission,
                    0
                  ) / 1000000
                )}
                M ₫
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIReport;
