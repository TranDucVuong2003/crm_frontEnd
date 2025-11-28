import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError, showDeleteConfirm } from "../utils/sweetAlert";
import {
  getAllKPIs,
  createKPI,
  updateKPI,
  deleteKPI,
  getKPIRecordsSummary,
  getAllDepartments,
} from "../Service/ApiService";

const KPIs = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Get current period (YYYY-MM format)
  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchKPISummary();
    }
  }, [selectedPeriod]);

  const fetchInitialData = async () => {
    await Promise.all([fetchKPIs(), fetchDepartments(), fetchKPISummary()]);
  };

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const response = await getAllKPIs();
      setKpis(response.data || []);
    } catch (error) {
      showError("Không thể tải dữ liệu KPI");
      console.error(error);
    } finally {
      setLoading(false);
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

  const fetchKPISummary = async () => {
    try {
      const response = await getKPIRecordsSummary({ period: selectedPeriod });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching KPI summary:", error);
    }
  };

  // Filter KPIs
  const filteredKPIs = kpis.filter((kpi) => {
    const matchSearch =
      kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDepartment =
      filterDepartment === "all" ||
      kpi.departmentId === parseInt(filterDepartment);

    const matchType = filterType === "all" || kpi.kpiType === filterType;

    const matchPeriod = filterPeriod === "all" || kpi.period === filterPeriod;

    return matchSearch && matchDepartment && matchType && matchPeriod;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKPIs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKPIs.length / itemsPerPage);

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm(
      "Bạn có chắc chắn muốn xóa KPI này?"
    );
    if (result.isConfirmed) {
      try {
        await deleteKPI(id);
        setKpis(kpis.filter((kpi) => kpi.id !== id));
        showSuccess("Xóa KPI thành công");
      } catch (error) {
        showError(error.response?.data?.message || "Không thể xóa KPI");
      }
    }
  };

  const handleEdit = (kpi) => {
    setEditingKPI(kpi);
    setIsModalOpen(true);
  };

  const handleSaveKPI = async (formData) => {
    try {
      if (editingKPI) {
        await updateKPI(editingKPI.id, formData);
        showSuccess("Cập nhật KPI thành công");
        // Refresh lại danh sách để lấy đầy đủ thông tin quan hệ
        await fetchKPIs();
      } else {
        await createKPI(formData);
        showSuccess("Thêm KPI thành công");
        // Refresh lại danh sách để lấy đầy đủ thông tin quan hệ
        await fetchKPIs();
      }
      setIsModalOpen(false);
      setEditingKPI(null);
    } catch (error) {
      showError(error.response?.data?.message || "Không thể lưu KPI");
    }
  };

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

  const getPeriodText = (period) => {
    switch (period) {
      case "Monthly":
        return "Tháng";
      case "Quarterly":
        return "Quý";
      case "Yearly":
        return "Năm";
      default:
        return period;
    }
  };

  const getCommissionTypeText = (type) => {
    switch (type) {
      case "Tiered":
        return "Theo bậc";
      case "Flat":
        return "Cố định";
      case "None":
        return "Không có";
      default:
        return type;
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case "Revenue":
        return CurrencyDollarIcon;
      case "Leads":
        return UsersIcon;
      case "Tickets":
        return CheckCircleIcon;
      default:
        return ChartBarIcon;
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatCurrency = (num) => {
    if (!num) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  // Summary statistics
  const stats = {
    total: kpis.length,
    active: kpis.filter((k) => k.isActive).length,
    revenue: kpis.filter((k) => k.kpiType === "Revenue").length,
    leads: kpis.filter((k) => k.kpiType === "Leads").length,
    tickets: kpis.filter((k) => k.kpiType === "Tickets").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý KPI</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và quản lý các chỉ số hiệu suất chính
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng KPI</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
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
            <CurrencyDollarIcon className="h-12 w-12 text-blue-500" />
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
            <DocumentTextIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Monthly Summary - If available */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              Tổng quan KPI - Kỳ {selectedPeriod}
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white backdrop-blur-sm focus:ring-2 focus:ring-white/50"
            >
              <option value={getCurrentPeriod()}>Tháng hiện tại</option>
              <option
                value={`${new Date().getFullYear()}-${String(
                  new Date().getMonth()
                ).padStart(2, "0")}`}
              >
                Tháng trước
              </option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/80 text-sm">Tổng số records</p>
              <p className="text-2xl font-bold">{summary.totalRecords || 0}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Chờ phê duyệt</p>
              <p className="text-2xl font-bold">{summary.pendingCount || 0}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Đã phê duyệt</p>
              <p className="text-2xl font-bold">{summary.approvedCount || 0}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Hoa hồng</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalCommission)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
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
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả loại KPI</option>
                <option value="Revenue">Doanh thu</option>
                <option value="Leads">Khách hàng tiềm năng</option>
                <option value="Tickets">Hỗ trợ</option>
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả kỳ</option>
                <option value="Monthly">Tháng</option>
                <option value="Quarterly">Quý</option>
                <option value="Yearly">Năm</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-2 ${
                    viewMode === "card"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingKPI(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Thêm KPI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có KPI nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bắt đầu bằng cách tạo KPI đầu tiên cho hệ thống
          </p>
          <button
            onClick={() => {
              setEditingKPI(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Thêm KPI
          </button>
        </div>
      ) : viewMode === "card" ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((kpi) => {
            const IconComponent = getCategoryIcon(kpi.kpiType);
            return (
              <div
                key={kpi.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {kpi.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {kpi.department?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        kpi.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {kpi.isActive ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {kpi.description || "Không có mô tả"}
                  </p>

                  {/* KPI Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Loại KPI:</span>
                      <span className="font-semibold text-gray-900">
                        {getKPITypeText(kpi.kpiType)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mục tiêu:</span>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(kpi.targetValue)} {kpi.measurementUnit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kỳ:</span>
                      <span className="font-semibold text-gray-900">
                        {getPeriodText(kpi.period)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hoa hồng:</span>
                      <span className="font-semibold text-gray-900">
                        {getCommissionTypeText(kpi.commissionType)}
                      </span>
                    </div>
                  </div>

                  {/* Period */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {new Date(kpi.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(kpi.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(kpi)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(kpi.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mục tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kỳ
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
                {currentItems.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kpi.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {kpi.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kpi.department?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getKPITypeText(kpi.kpiType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(kpi.targetValue)} {kpi.measurementUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPeriodText(kpi.period)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          kpi.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {kpi.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(kpi)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(kpi.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredKPIs.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{filteredKPIs.length}</span> KPI
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <KPIModal
          kpi={editingKPI}
          departments={departments}
          onClose={() => {
            setIsModalOpen(false);
            setEditingKPI(null);
          }}
          onSave={handleSaveKPI}
        />
      )}
    </div>
  );
};

// KPI Modal Component
const KPIModal = ({ kpi, departments, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    kpi || {
      name: "",
      description: "",
      departmentId: "",
      kpiType: "Revenue",
      measurementUnit: "VND",
      targetValue: 0,
      commissionType: "Tiered",
      period: "Monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0],
      weight: 100,
      isActive: true,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {kpi ? "Chỉnh sửa KPI" : "Thêm KPI mới"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên KPI *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên KPI"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về KPI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng ban *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) =>
                    handleChange("departmentId", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn phòng ban</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại KPI *
                </label>
                <select
                  required
                  value={formData.kpiType}
                  onChange={(e) => handleChange("kpiType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Revenue">Doanh thu</option>
                  <option value="Leads">Khách hàng tiềm năng</option>
                  <option value="Tickets">Hỗ trợ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục tiêu *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.targetValue}
                  onChange={(e) =>
                    handleChange("targetValue", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mục tiêu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.measurementUnit}
                  onChange={(e) =>
                    handleChange("measurementUnit", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VND, Khách hàng, Ticket..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hoa hồng *
                </label>
                <select
                  required
                  value={formData.commissionType}
                  onChange={(e) =>
                    handleChange("commissionType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Tiered">Theo bậc</option>
                  <option value="Flat">Cố định</option>
                  <option value="None">Không có</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỳ đo lường *
                </label>
                <select
                  required
                  value={formData.period}
                  onChange={(e) => handleChange("period", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Monthly">Tháng</option>
                  <option value="Quarterly">Quý</option>
                  <option value="Yearly">Năm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trọng số (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) =>
                    handleChange("weight", parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Kích hoạt KPI
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {kpi ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KPIs;
