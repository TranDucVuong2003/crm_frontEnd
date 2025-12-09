import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  getKpiRecordsByUser,
  getKpiTargetsByUser,
} from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";

const MyKpi = () => {
  const { user } = useAuth();
  const [kpiRecords, setKpiRecords] = useState([]);
  const [currentKpi, setCurrentKpi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (user?.id) {
      fetchMyKpi();
    }
  }, [user]);

  const fetchMyKpi = async () => {
    try {
      setLoading(true);
      const recordsRes = await getKpiRecordsByUser(user.id);

      if (recordsRes.data.success) {
        const records = recordsRes.data.data;
        setKpiRecords(records);

        // Lấy KPI tháng hiện tại
        const current = records.find(
          (r) =>
            r.month === selectedPeriod.month && r.year === selectedPeriod.year
        );
        setCurrentKpi(current);
      }
    } catch (error) {
      console.error("Error fetching my KPI:", error);
      showError("Không thể tải dữ liệu KPI");
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

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = (percentage) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-2 text-indigo-600" />
          KPI của tôi
        </h1>
        <p className="text-gray-600 mt-1">
          Theo dõi hiệu suất và hoa hồng của bạn
        </p>
      </div>

      {/* Current Month KPI */}
      {currentKpi ? (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2" />
              Tháng {currentKpi.month}/{currentKpi.year}
            </h2>
            {currentKpi.isKpiAchieved && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                <TrophyIcon className="h-5 w-5 mr-1" />
                <span className="font-semibold">Đạt KPI</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Target</p>
              <p className="text-xl font-bold">
                {formatCurrency(currentKpi.targetAmount)}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Thực tế</p>
              <p className="text-xl font-bold">
                {formatCurrency(currentKpi.totalPaidAmount)}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Hoa hồng dự kiến</p>
              <p className="text-xl font-bold">
                {formatCurrency(currentKpi.commissionAmount)}
              </p>
              <p className="text-indigo-100 text-xs mt-1">
                {currentKpi.commissionPercentage}% - Bậc{" "}
                {currentKpi.commissionTierLevel}
              </p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Số hợp đồng</p>
              <p className="text-xl font-bold">{currentKpi.totalContracts}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Tiến độ hoàn thành</span>
              <span className="text-lg font-semibold">
                {currentKpi.achievementPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.min(currentKpi.achievementPercentage, 100)}%`,
                }}
              >
                {currentKpi.achievementPercentage >= 10 && (
                  <span className="text-xs font-semibold text-indigo-600">
                    {currentKpi.achievementPercentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>

            {!currentKpi.isKpiAchieved && (
              <p className="text-sm mt-2 text-indigo-100">
                Còn{" "}
                {formatCurrency(
                  currentKpi.targetAmount - currentKpi.totalPaidAmount
                )}{" "}
                để đạt target
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 mb-6 text-center">
          <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">
            Chưa có KPI cho tháng {selectedPeriod.month}/{selectedPeriod.year}
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      {kpiRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số tháng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpiRecords.length}
                </p>
              </div>
              <CalendarIcon className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tháng đạt KPI</p>
                <p className="text-2xl font-bold text-green-600">
                  {kpiRecords.filter((r) => r.isKpiAchieved).length}
                </p>
              </div>
              <TrophyIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng doanh số</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    kpiRecords.reduce((sum, r) => sum + r.totalPaidAmount, 0)
                  )}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-10 w-10 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng hoa hồng</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(
                    kpiRecords.reduce((sum, r) => sum + r.commissionAmount, 0)
                  )}
                </p>
              </div>
              <CurrencyDollarIcon className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch sử hiệu suất
          </h2>

          {kpiRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Chưa có dữ liệu lịch sử</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tháng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thực tế
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % KPI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoa hồng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hợp đồng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kpiRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.month}/{record.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.targetAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(record.totalPaidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                record.achievementPercentage
                              )}`}
                              style={{
                                width: `${Math.min(
                                  record.achievementPercentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${getProgressTextColor(
                              record.achievementPercentage
                            )}`}
                          >
                            {record.achievementPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatCurrency(record.commissionAmount)}</div>
                        <div className="text-xs text-gray-500">
                          {record.commissionPercentage}% (Bậc{" "}
                          {record.commissionTierLevel})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.totalContracts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.isKpiAchieved ? (
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyKpi;
