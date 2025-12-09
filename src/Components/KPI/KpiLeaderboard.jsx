import React, { useState, useEffect } from "react";
import {
  TrophyIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { getKpiLeaderboard } from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";

const KpiLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchLeaderboard();
  }, [filters]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await getKpiLeaderboard(filters);

      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      showError("Không thể tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRankBadge = (rank) => {
    const badges = {
      1: {
        icon: "🥇",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      2: { icon: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300" },
      3: {
        icon: "🥉",
        color: "bg-orange-100 text-orange-800 border-orange-300",
      },
    };

    return (
      badges[rank] || {
        icon: `#${rank}`,
        color: "bg-blue-50 text-blue-800 border-blue-200",
      }
    );
  };

  const getAchievementColor = (percentage) => {
    if (percentage >= 150) return "text-purple-600";
    if (percentage >= 120) return "text-green-600";
    if (percentage >= 100) return "text-blue-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrophyIcon className="h-8 w-8 mr-2 text-yellow-500" />
              Bảng xếp hạng KPI
            </h1>
            <p className="text-gray-600 mt-1">
              Top những nhân viên xuất sắc nhất
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
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

            <div className="flex-1">
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải bảng xếp hạng...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrophyIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Chưa có dữ liệu xếp hạng</p>
          <p className="text-gray-500 text-sm mt-2">
            Chọn tháng/năm khác để xem kết quả
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Rank 2 */}
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-2">🥈</div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {leaderboard[1]?.userName}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">Á quân</p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-xs text-gray-600">Doanh số</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(leaderboard[1]?.totalPaidAmount)}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {leaderboard[1]?.achievementPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Hoa hồng: {formatCurrency(leaderboard[1]?.commissionAmount)}
                  </p>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-2xl p-6 flex flex-col items-center transform scale-110 hover:scale-115 transition-transform -mt-4">
                <div className="text-6xl mb-2">🥇</div>
                <div className="text-center text-white">
                  <p className="text-xl font-bold">
                    {leaderboard[0]?.userName}
                  </p>
                  <p className="text-sm mb-3">Vô địch</p>
                  <div className="bg-white/20 rounded-lg p-3 mb-2">
                    <p className="text-xs">Doanh số</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(leaderboard[0]?.totalPaidAmount)}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    {leaderboard[0]?.achievementPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm">
                    Hoa hồng: {formatCurrency(leaderboard[0]?.commissionAmount)}
                  </p>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-2">🥉</div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {leaderboard[2]?.userName}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">Hạng ba</p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-xs text-gray-600">Doanh số</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(leaderboard[2]?.totalPaidAmount)}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-700">
                    {leaderboard[2]?.achievementPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Hoa hồng: {formatCurrency(leaderboard[2]?.commissionAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Bảng xếp hạng chi tiết
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hạng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nhân viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thực tế
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % Đạt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hoa hồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KPI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((item) => {
                      const badge = getRankBadge(item.rank);
                      return (
                        <tr
                          key={item.userId}
                          className={`hover:bg-gray-50 ${
                            item.rank <= 3 ? "bg-yellow-50/30" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${badge.color}`}
                            >
                              {badge.icon}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.userName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.targetAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.totalPaidAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      item.achievementPercentage,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`text-sm font-bold ${getAchievementColor(
                                  item.achievementPercentage
                                )}`}
                              >
                                {item.achievementPercentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(item.commissionAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.totalContracts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.isKpiAchieved ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                                <TrophyIcon className="h-3 w-3 mr-1" />
                                Đạt
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Chưa đạt
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KpiLeaderboard;
