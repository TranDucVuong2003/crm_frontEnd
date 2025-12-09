import React, { useState, useEffect } from "react";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TicketIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError, showDeleteConfirm } from "../utils/sweetAlert";
import {
  getAllDepartments,
  getAllUsers,
  getAllTickets,
} from "../Service/ApiService";
import { useNavigate, useSearchParams } from "react-router-dom";

const KPIAssignments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentIdFromUrl = searchParams.get("departmentId");

  const [kpis, setKpis] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState(
    departmentIdFromUrl || "all"
  );
  const [filterKPIType, setFilterKPIType] = useState("all");
  const [isQuickAssignModalOpen, setIsQuickAssignModalOpen] = useState(false);
  const [ticketStats, setTicketStats] = useState({ total: 0, completed: 0 });
  const [expandedKPIs, setExpandedKPIs] = useState(new Set());

  useEffect(() => {
    fetchData();
    if (departmentIdFromUrl === "1") {
      fetchTicketStats();
    }
  }, [departmentIdFromUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptsRes, usersRes] = await Promise.all([
        getAllDepartments(),
        getAllUsers(),
      ]);

      setKpis([]);
      setDepartments(
        Array.isArray(deptsRes.data?.data)
          ? deptsRes.data.data
          : deptsRes.data || []
      );
      setUsers(
        Array.isArray(usersRes.data?.data)
          ? usersRes.data.data
          : usersRes.data || []
      );
      setAssignments([]);
      setRecords([]);
    } catch (error) {
      showError("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketStats = async () => {
    try {
      const ticketsRes = await getAllTickets();
      const ticketsData = Array.isArray(ticketsRes.data?.data)
        ? ticketsRes.data.data
        : Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : [];

      const total = ticketsData.length;
      const completed = ticketsData.filter(
        (ticket) => ticket.status === "Closed" || ticket.status === "Resolved"
      ).length;

      setTicketStats({ total, completed });
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
    }
  };

  // Filter active KPIs
  const activeKPIs = kpis.filter((kpi) => kpi.isActive);

  // Filter KPIs based on search and filters
  const filteredKPIs = activeKPIs.filter((kpi) => {
    const matchSearch =
      kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDepartment =
      filterDepartment === "all" ||
      kpi.departmentId === parseInt(filterDepartment);

    const matchType = filterKPIType === "all" || kpi.kpiType === filterKPIType;

    return matchSearch && matchDepartment && matchType;
  });

  const getKPITypeText = (type) => {
    switch (type) {
      case "Revenue":
        return "Doanh thu";
      case "Leads":
        return "Khách hàng tiềm năng";
      case "Tickets":
        return "Hỗ trợ";
      default:
        return type;
    }
  };

  const getKPITypeColor = (type) => {
    switch (type) {
      case "Revenue":
        return "bg-blue-100 text-blue-800";
      case "Leads":
        return "bg-purple-100 text-purple-800";
      case "Tickets":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Get assignment count for each KPI
  const getAssignmentCount = (kpiId) => {
    return assignments.filter((a) => a.kpiId === kpiId && a.isActive).length;
  };

  // Get assigned users for a KPI
  const getAssignedUsers = (kpiId) => {
    const kpiAssignments = assignments.filter(
      (a) => a.kpiId === kpiId && a.isActive
    );
    return kpiAssignments
      .map((assignment) => {
        const user = users.find((u) => u.id === assignment.userId);
        if (!user) return null;

        // Get user's KPI records
        const userRecords = records.filter(
          (r) => r.userId === user.id && r.kpiId === kpiId
        );
        const actualValue = userRecords.reduce(
          (sum, r) => sum + (r.value || 0),
          0
        );
        const targetValue =
          assignment.customTargetValue || assignment.kpi?.targetValue || 0;

        return {
          ...user,
          assignment,
          actualValue,
          targetValue,
          achievement: targetValue > 0 ? (actualValue / targetValue) * 100 : 0,
        };
      })
      .filter(Boolean);
  };

  // Toggle KPI expansion
  const toggleKPIExpand = (kpiId) => {
    const newExpanded = new Set(expandedKPIs);
    if (newExpanded.has(kpiId)) {
      newExpanded.delete(kpiId);
    } else {
      newExpanded.add(kpiId);
    }
    setExpandedKPIs(newExpanded);
  };

  // Statistics
  const stats = {
    totalKPIs: activeKPIs.length,
    totalAssignments: assignments.filter((a) => a.isActive).length,
    revenue: activeKPIs.filter((k) => k.kpiType === "Revenue").length,
    leads: activeKPIs.filter((k) => k.kpiType === "Leads").length,
    tickets: activeKPIs.filter((k) => k.kpiType === "Tickets").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        {departmentIdFromUrl && (
          <button
            onClick={() => navigate("/kpi/management")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại tổng quan
          </button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {departmentIdFromUrl
                ? `KPI ${
                    departments.find(
                      (d) => d.id === parseInt(departmentIdFromUrl)
                    )?.name || "Phòng ban"
                  }`
                : "Phân Công KPI cho User"}
            </h1>
            <p className="text-gray-600 mt-1">
              {departmentIdFromUrl
                ? `Chi tiết KPI và phân công nhân viên ${
                    departments.find(
                      (d) => d.id === parseInt(departmentIdFromUrl)
                    )?.name || ""
                  }`
                : "Gán KPI cho từng nhân viên và theo dõi tiến độ theo cấu trúc phân cấp"}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Marketing Budget Button */}
            {departmentIdFromUrl === "6" && (
              <button
                onClick={() => showSuccess("Tính năng đang phát triển")}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-lg"
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                Cấu hình Budget
              </button>
            )}
          </div>
        </div>
      </div>

      {/* IT Department Ticket Stats */}
      {departmentIdFromUrl === "1" && (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TicketIcon className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Thống kê Ticket IT</h2>
              <p className="text-cyan-100 text-sm">
                Tổng hợp công việc support
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-cyan-100 text-sm mb-1">Tổng ticket</p>
              <p className="text-3xl font-bold">{ticketStats.total}</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm mb-1">Đã hoàn thành</p>
              <p className="text-3xl font-bold text-green-300">
                {ticketStats.completed}
              </p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm mb-1">Tỷ lệ hoàn thành</p>
              <p className="text-3xl font-bold">
                {ticketStats.total > 0
                  ? ((ticketStats.completed / ticketStats.total) * 100).toFixed(
                      0
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng KPI</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalKPIs}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Users được gán</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalAssignments}
              </p>
            </div>
            <UsersIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KPI Doanh thu</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.revenue}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KPI Leads</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.leads}
              </p>
            </div>
            <UsersIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KPI Support</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.tickets}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm KPI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                disabled={departmentIdFromUrl !== null}
                className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  departmentIdFromUrl ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="all">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterKPIType}
              onChange={(e) => setFilterKPIType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại KPI</option>
              <option value="Revenue">Doanh thu</option>
              <option value="Leads">Khách hàng tiềm năng</option>
              <option value="Tickets">Hỗ trợ</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredKPIs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy KPI
          </h3>
          <p className="text-gray-500">
            Không có KPI nào khớp với bộ lọc của bạn
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKPIs.map((kpi) => {
            const assignmentCount = getAssignmentCount(kpi.id);
            const assignedUsers = getAssignedUsers(kpi.id);
            const isExpanded = expandedKPIs.has(kpi.id);

            // Calculate KPI totals
            const totalTarget = assignedUsers.reduce(
              (sum, u) => sum + u.targetValue,
              0
            );
            const totalActual = assignedUsers.reduce(
              (sum, u) => sum + u.actualValue,
              0
            );
            const overallAchievement =
              totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

            return (
              <div
                key={kpi.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* KPI Header - Always visible */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleKPIExpand(kpi.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getKPITypeColor(
                            kpi.kpiType
                          )}`}
                        >
                          {getKPITypeText(kpi.kpiType)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {kpi.period}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {assignmentCount} users
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {kpi.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {kpi.department?.name || "N/A"} •{" "}
                        {kpi.description || "Không có mô tả"}
                      </p>

                      {/* KPI Summary Stats */}
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Mục tiêu KPI</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatNumber(kpi.targetValue)}{" "}
                            {kpi.measurementUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Tổng mục tiêu được gán
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatNumber(totalTarget)} {kpi.measurementUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Thực hiện</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatNumber(totalActual)} {kpi.measurementUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Tỷ lệ hoàn thành
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              overallAchievement >= 100
                                ? "text-green-600"
                                : overallAchievement >= 80
                                ? "text-blue-600"
                                : overallAchievement >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {overallAchievement.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                        <div
                          className={`h-full rounded-full transition-all ${
                            overallAchievement >= 100
                              ? "bg-green-500"
                              : overallAchievement >= 80
                              ? "bg-blue-500"
                              : overallAchievement >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(overallAchievement, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 ml-6">
                      {isExpanded ? (
                        <ChevronUpIcon className="h-6 w-6 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Users Details - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Danh sách nhân viên được gán ({assignedUsers.length})
                      </h4>

                      {assignedUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>Chưa có nhân viên nào được gán KPI này</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {assignedUsers.map((userWithData) => (
                            <div
                              key={userWithData.id}
                              className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-lg font-semibold text-blue-600">
                                        {userWithData.name
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {userWithData.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {userWithData.position?.positionName ||
                                        "N/A"}{" "}
                                      • {userWithData.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Mục tiêu
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatNumber(userWithData.targetValue)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Thực hiện
                                    </p>
                                    <p className="text-sm font-semibold text-green-600">
                                      {formatNumber(userWithData.actualValue)}
                                    </p>
                                  </div>
                                  <div className="text-right min-w-[80px]">
                                    <p className="text-xs text-gray-500">
                                      Hoàn thành
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${
                                        userWithData.achievement >= 100
                                          ? "text-green-600"
                                          : userWithData.achievement >= 80
                                          ? "text-blue-600"
                                          : userWithData.achievement >= 50
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {userWithData.achievement.toFixed(1)}%
                                    </p>
                                  </div>

                                  {/* Progress indicator */}
                                  <div className="w-24">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-full rounded-full ${
                                          userWithData.achievement >= 100
                                            ? "bg-green-500"
                                            : userWithData.achievement >= 80
                                            ? "bg-blue-500"
                                            : userWithData.achievement >= 50
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        }`}
                                        style={{
                                          width: `${Math.min(
                                            userWithData.achievement,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Assign Modal - Select KPI first */}
      {isQuickAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Gán KPI nhanh cho User
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Chọn KPI để gán cho nhân viên
                </p>
              </div>
              <button
                onClick={() => setIsQuickAssignModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeKPIs.map((kpi) => {
                  const assignmentCount = getAssignmentCount(kpi.id);
                  return (
                    <div
                      key={kpi.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedKPIForAssign(kpi);
                        setIsQuickAssignModalOpen(false);
                        setIsAssignModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getKPITypeColor(
                            kpi.kpiType
                          )}`}
                        >
                          {getKPITypeText(kpi.kpiType)}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {assignmentCount} users
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {kpi.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {kpi.department?.name}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Mục tiêu: {formatNumber(kpi.targetValue)}</span>
                        <span>{kpi.period}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeKPIs.length === 0 && (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Không có KPI nào đang hoạt động
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIAssignments;
