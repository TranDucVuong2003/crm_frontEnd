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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const KpiDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [previousStatistics, setPreviousStatistics] = useState(null);
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

      // Calculate previous period
      const prevMonth =
        selectedPeriod.month === 1 ? 12 : selectedPeriod.month - 1;
      const prevYear =
        selectedPeriod.month === 1
          ? selectedPeriod.year - 1
          : selectedPeriod.year;
      const previousPeriod = { month: prevMonth, year: prevYear };

      const [statsRes, prevStatsRes, leaderboardRes] = await Promise.all([
        getKpiStatistics(selectedPeriod),
        getKpiStatistics(previousPeriod),
        getKpiLeaderboard(selectedPeriod),
      ]);

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }

      if (prevStatsRes.data.success) {
        setPreviousStatistics(prevStatsRes.data.data);
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

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return null;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Get growth info
  const getGrowthInfo = (current, previous) => {
    const growth = calculateGrowth(current, previous);
    if (growth === null) return { text: "N/A", isPositive: null };
    const isPositive = parseFloat(growth) >= 0;
    return {
      text: `${isPositive ? "+" : ""}${growth}%`,
      isPositive,
      value: parseFloat(growth),
    };
  };

  // Prepare Chart.js data
  const achievementChartData = {
    labels: ["Đạt KPI", "Chưa đạt"],
    datasets: [
      {
        data: statistics
          ? [statistics.usersAchievedKpi, statistics.usersNotAchievedKpi]
          : [0, 0],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: ["Target vs Thực tế"],
    datasets: [
      {
        label: "Target",
        data: statistics ? [statistics.totalTargetAmount] : [0],
        backgroundColor: "#f59e0b",
        borderColor: "#f59e0b",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "#d97706",
      },
      {
        label: "Thực tế",
        data: statistics ? [statistics.totalPaidAmount] : [0],
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "#059669",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: "70%",
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} người (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrencyFull(
              context.parsed.y
            )}`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    borderRadius: 8,
  };

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
                <div className="flex-1">
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
                  {previousStatistics && (
                    <div className="mt-2 flex items-center">
                      {(() => {
                        const growth = getGrowthInfo(
                          statistics.totalUsers,
                          previousStatistics.totalUsers
                        );
                        return (
                          <>
                            {growth.isPositive !== null && (
                              <>
                                {growth.isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    growth.isPositive
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {growth.text}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-gray-500 ml-1">
                              so với tháng trước
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Success Rate (100%) */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-green-100 mb-1">Tỷ lệ đạt KPI</p>
                  <p className="text-3xl font-bold text-white">
                    {statistics.totalUsers > 0
                      ? (
                          (statistics.usersAchievedKpi /
                            statistics.totalUsers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-white font-medium">
                      {statistics.usersAchievedKpi}/{statistics.totalUsers}{" "}
                      người
                    </span>
                  </div>
                  <div className="w-full bg-green-400/30 rounded-full h-2 mt-3">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          statistics.totalUsers > 0
                            ? (statistics.usersAchievedKpi /
                                statistics.totalUsers) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  {previousStatistics && (
                    <div className="mt-2 flex items-center">
                      {(() => {
                        const currentRate =
                          statistics.totalUsers > 0
                            ? (statistics.usersAchievedKpi /
                                statistics.totalUsers) *
                              100
                            : 0;
                        const previousRate =
                          previousStatistics.totalUsers > 0
                            ? (previousStatistics.usersAchievedKpi /
                                previousStatistics.totalUsers) *
                              100
                            : 0;
                        const growth = calculateGrowth(
                          currentRate,
                          previousRate
                        );
                        const isPositive =
                          growth !== null && parseFloat(growth) >= 0;

                        return (
                          <>
                            {growth !== null && (
                              <>
                                {isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 text-white mr-1" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 text-green-200 mr-1" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    isPositive ? "text-white" : "text-green-200"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}
                                  {growth}%
                                </span>
                              </>
                            )}
                            <span className="text-xs text-green-100 ml-1">
                              so với tháng trước
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                  <TrophyIcon className="h-8 w-8 text-white" />
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
                  {previousStatistics && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {(() => {
                        const growth = getGrowthInfo(
                          statistics.totalPaidAmount,
                          previousStatistics.totalPaidAmount
                        );
                        return (
                          <div className="flex items-center">
                            {growth.isPositive !== null && (
                              <>
                                {growth.isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    growth.isPositive
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {growth.text}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-gray-500 ml-1">
                              so với tháng trước
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
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
                  {previousStatistics && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {(() => {
                        const growth = getGrowthInfo(
                          statistics.totalCommissionAmount,
                          previousStatistics.totalCommissionAmount
                        );
                        return (
                          <div className="flex items-center">
                            {growth.isPositive !== null && (
                              <>
                                {growth.isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-600 mr-1" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 text-red-600 mr-1" />
                                )}
                                <span
                                  className={`text-xs font-medium ${
                                    growth.isPositive
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {growth.text}
                                </span>
                              </>
                            )}
                            <span className="text-xs text-gray-500 ml-1">
                              so với tháng trước
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Achievement Doughnut Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phân bổ đạt KPI
              </h3>
              <div style={{ height: "300px" }}>
                <Doughnut
                  data={achievementChartData}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Target vs Thực tế
              </h3>
              <div style={{ height: "300px" }}>
                <Bar data={revenueChartData} options={barOptions} />
              </div>
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
