import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import {
  getAllKPIRecords,
  approveKPIRecord,
  rejectKPIRecord,
  batchApproveKPIRecords,
  getAllDepartments,
} from "../../Service/ApiService";
import Swal from "sweetalert2";

const KPIRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());

  useEffect(() => {
    fetchInitialData();
  }, [selectedPeriod]);

  const fetchInitialData = async () => {
    await Promise.all([fetchRecords(), fetchDepartments()]);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getAllKPIRecords({ period: selectedPeriod });
      setRecords(response.data || []);
    } catch (error) {
      showError("Không thể tải dữ liệu KPI Records");
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

  const handleApprove = async (id) => {
    const result = await showDeleteConfirm(
      "Bạn có chắc chắn muốn phê duyệt KPI record này?",
      "Phê duyệt",
      "question"
    );
    if (result.isConfirmed) {
      try {
        await approveKPIRecord(id);
        setRecords(
          records.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
        );
        showSuccess("Phê duyệt KPI record thành công");
      } catch (error) {
        showError(error.response?.data?.message || "Không thể phê duyệt");
      }
    }
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Từ chối KPI Record",
      input: "textarea",
      inputLabel: "Lý do từ chối",
      inputPlaceholder: "Nhập lý do từ chối...",
      inputAttributes: {
        "aria-label": "Nhập lý do từ chối",
      },
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (reason) {
      try {
        await rejectKPIRecord(id, reason);
        setRecords(
          records.map((r) =>
            r.id === id ? { ...r, status: "Rejected", notes: reason } : r
          )
        );
        showSuccess("Đã từ chối KPI record");
      } catch (error) {
        showError(error.response?.data?.message || "Không thể từ chối");
      }
    }
  };

  const handleBatchApprove = async () => {
    if (selectedRecords.length === 0) {
      showError("Vui lòng chọn ít nhất một record");
      return;
    }

    const result = await showDeleteConfirm(
      `Bạn có chắc chắn muốn phê duyệt ${selectedRecords.length} records?`,
      "Phê duyệt hàng loạt",
      "question"
    );

    if (result.isConfirmed) {
      try {
        await batchApproveKPIRecords(selectedRecords);
        setRecords(
          records.map((r) =>
            selectedRecords.includes(r.id) ? { ...r, status: "Approved" } : r
          )
        );
        setSelectedRecords([]);
        showSuccess(
          `Đã phê duyệt ${selectedRecords.length} records thành công`
        );
      } catch (error) {
        showError(
          error.response?.data?.message || "Không thể phê duyệt hàng loạt"
        );
      }
    }
  };

  const toggleSelectRecord = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map((r) => r.id));
    }
  };

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchSearch =
      record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.kpi?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || record.status === filterStatus;

    const matchDepartment =
      filterDepartment === "all" ||
      record.kpi?.departmentId === parseInt(filterDepartment);

    return matchSearch && matchStatus && matchDepartment;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Approved":
        return "Đã phê duyệt";
      case "Pending":
        return "Chờ phê duyệt";
      case "Rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const formatCurrency = (num) => {
    if (!num) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Summary stats
  const stats = {
    total: records.length,
    pending: records.filter((r) => r.status === "Pending").length,
    approved: records.filter((r) => r.status === "Approved").length,
    rejected: records.filter((r) => r.status === "Rejected").length,
    totalCommission: records
      .filter((r) => r.status === "Approved")
      .reduce((sum, r) => sum + (r.commissionAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo KPI</h1>
        <p className="text-gray-600 mt-1">
          Xem và phê duyệt các báo cáo KPI từ nhân viên
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <DocumentCheckIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow p-6 text-white">
          <div>
            <p className="text-sm text-white/80">Tổng hoa hồng</p>
            <p className="text-xl font-bold truncate">
              {formatCurrency(stats.totalCommission)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhân viên, KPI..."
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
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
              </select>

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

              {selectedRecords.length > 0 && (
                <button
                  onClick={handleBatchApprove}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Duyệt {selectedRecords.length} records
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có báo cáo nào
          </h3>
          <p className="text-gray-500">
            Chưa có báo cáo KPI nào cho kỳ {selectedPeriod}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRecords.length === filteredRecords.length &&
                        filteredRecords.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mục tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thực tế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đạt được
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa hồng
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
                {currentItems.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecords.includes(record.id)}
                        onChange={() => toggleSelectRecord(record.id)}
                        disabled={record.status !== "Pending"}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.user?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.kpi?.department?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.kpi?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(record.targetValue)}{" "}
                      {record.kpi?.measurementUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatNumber(record.actualValue)}{" "}
                      {record.kpi?.measurementUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-semibold ${
                            record.achievementPercentage >= 100
                              ? "text-green-600"
                              : record.achievementPercentage >= 80
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.achievementPercentage?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.commissionAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.status === "Pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(record.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Phê duyệt"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(record.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Từ chối"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {record.status === "Approved" && (
                        <span className="text-green-600">
                          {record.approvedBy?.name || "Admin"}
                        </span>
                      )}
                      {record.status === "Rejected" && (
                        <span className="text-red-600 text-xs">
                          {record.notes || "Đã từ chối"}
                        </span>
                      )}
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
              {Math.min(indexOfLastItem, filteredRecords.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{filteredRecords.length}</span>{" "}
            records
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
    </div>
  );
};

export default KPIRecords;
