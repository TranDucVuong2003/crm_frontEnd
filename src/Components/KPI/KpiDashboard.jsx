import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  getKpiStatistics,
  getKpiLeaderboard,
  getAllKpiPackages,
} from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const KpiDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, leaderboardRes] = await Promise.all([
        getKpiStatistics(selectedPeriod),
        getKpiLeaderboard(selectedPeriod),
      ]);

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.data.slice(0, 5)); // Top 5
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      compactDisplay: "short",
    }).format(amount);
  };

  const formatCurrencyFull = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Pie chart colors
  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

  // Prepare chart data
  const achievementData = statistics
    ? [
        {
          name: "Đạt KPI",
          value: statistics.usersAchievedKpi,
          color: "#10b981",
        },
        {
          name: "Chưa đạt",
          value: statistics.usersNotAchievedKpi,
          color: "#ef4444",
        },
      ]
    : [];

  const revenueData = statistics
    ? [
        {
          name: "Target vs Thực tế",
          Target: statistics.totalTargetAmount,
          "Thực tế": statistics.totalPaidAmount,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-2 text-indigo-600" />
              Dashboard KPI
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng quan hiệu suất và thống kê
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-3 items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedPeriod.month}
              onChange={(e) =>
                setSelectedPeriod({
                  ...selectedPeriod,
                  month: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod.year}
              onChange={(e) =>
                setSelectedPeriod({
                  ...selectedPeriod,
                  year: parseInt(e.target.value),
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
        </div>
      </div>

      {statistics ? (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statistics.totalUsers}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600 font-medium">
                      {statistics.usersAchievedKpi} đạt
                    </span>
                    <span className="text-sm text-gray-400 mx-1">/</span>
                    <span className="text-sm text-red-600 font-medium">
                      {statistics.usersNotAchievedKpi} chưa
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Achievement Rate */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tỷ lệ đạt KPI</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.achievementRate?.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${statistics.achievementRate || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <TrophyIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <p className="text-sm text-gray-600 mb-1">
                    Doanh số / Target
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(statistics.totalPaidAmount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Target: {formatCurrency(statistics.totalTargetAmount)}
                  </p>
                  <div className="flex items-center mt-2">
                    {statistics.totalPaidAmount >=
                    statistics.totalTargetAmount ? (
                      <>
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                          +
                          {(
                            ((statistics.totalPaidAmount -
                              statistics.totalTargetAmount) /
                              statistics.totalTargetAmount) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                        <span className="text-sm text-red-600 font-medium">
                          -
                          {(
                            ((statistics.totalTargetAmount -
                              statistics.totalPaidAmount) /
                              statistics.totalTargetAmount) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng hoa hồng</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(statistics.totalCommissionAmount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {statistics.totalContracts} hợp đồng
                  </p>
                  <p className="text-xs text-gray-400">
                    TB: {statistics.averageAchievementPercentage?.toFixed(1)}%
                  </p>
                </div>
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Achievement Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phân bổ đạt KPI
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={achievementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {achievementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Target vs Thực tế
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrencyFull(value)} />
                  <Legend />
                  <Bar dataKey="Target" fill="#f59e0b" />
                  <Bar dataKey="Thực tế" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Leaderboard */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
                Top 5 nhân viên xuất sắc
              </h3>
              <div className="space-y-4">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.userId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.userName}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  item.achievementPercentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {item.achievementPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.totalPaidAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        HH: {formatCurrency(item.commissionAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Chưa có dữ liệu KPI</p>
          <p className="text-gray-500 text-sm mt-2">
            Chọn tháng/năm khác hoặc tạo gói KPI mới
          </p>
        </div>
      )}
    </div>
  );
};

export default KpiDashboard;
