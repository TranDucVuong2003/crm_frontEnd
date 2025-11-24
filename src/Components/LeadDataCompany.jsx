import React, { useState, useEffect } from "react";
import {
  getAllCompanies,
  deleteCompany,
  getAllUsers,
  batchUpdateCompanies,
  batchDeleteCompanies,
} from "../Service/ApiService";
import Swal from "sweetalert2";
import { useAuth } from "../Context/AuthContext";

function LeadDataCompany() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Fetch companies and users from API
  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCompanies();
      setCompanies(response.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Không thể tải dữ liệu công ty. Vui lòng thử lại.");
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể tải dữ liệu công ty.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, tenDoanhNghiep) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc muốn xóa công ty "${tenDoanhNghiep}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteCompany(id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Công ty đã được xóa thành công.",
          confirmButtonColor: "#3085d6",
        });
        fetchCompanies(); // Refresh list
      } catch (err) {
        console.error("Error deleting company:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể xóa công ty. Vui lòng thử lại.",
          confirmButtonColor: "#3085d6",
        });
      }
    }
  };

  const handleBatchDelete = async () => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc muốn xóa ${selectedCompanies.length} công ty đã chọn?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa tất cả",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        // Use batch delete API
        await batchDeleteCompanies(selectedCompanies);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: `Đã xóa ${selectedCompanies.length} công ty thành công.`,
          confirmButtonColor: "#3085d6",
        });
        setSelectedCompanies([]);
        fetchCompanies(); // Refresh list
      } catch (err) {
        console.error("Error deleting companies:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể xóa các công ty. Vui lòng thử lại.",
          confirmButtonColor: "#3085d6",
        });
      }
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo!",
        text: "Vui lòng chọn người dùng để phân công.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      await batchUpdateCompanies(selectedCompanies, parseInt(selectedUserId));
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: `Đã phân công ${selectedCompanies.length} công ty thành công.`,
        confirmButtonColor: "#3085d6",
      });
      setShowAssignModal(false);
      setSelectedCompanies([]);
      setSelectedUserId("");
      fetchCompanies(); // Refresh data
    } catch (err) {
      console.error("Error assigning companies:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể phân công công ty. Vui lòng thử lại.",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCompanies(filteredCompanies.map((c) => c.id));
    } else {
      setSelectedCompanies([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCompanies.includes(id)) {
      setSelectedCompanies(selectedCompanies.filter((cId) => cId !== id));
    } else {
      setSelectedCompanies([...selectedCompanies, id]);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.tenDoanhNghiep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.mst.includes(searchTerm) ||
      company.soDienThoai.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Đang hoạt động": "bg-green-100 text-green-800",
      "Ngừng hoạt động": "bg-red-100 text-red-800",
      "Tạm ngừng": "bg-yellow-100 text-yellow-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dữ liệu Khách hàng Công ty
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin khách hàng doanh nghiệp
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công ty, MST, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng công ty
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companies.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    companies.filter((c) => c.trangThai === "Đang hoạt động")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Kết quả tìm kiếm
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredCompanies.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedCompanies.length > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedCompanies.length} công ty
              </span>
              <div className="flex gap-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Phân công
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Xóa
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination Info & Items Per Page */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="mb-4 bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hiển thị {indexOfFirstItem + 1} đến{" "}
                {Math.min(indexOfLastItem, filteredCompanies.length)} của{" "}
                {filteredCompanies.length} công ty
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Số dòng:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          /* Company Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedCompanies.length ===
                            filteredCompanies.length &&
                          filteredCompanies.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      STT
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tên công ty
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mã số thuế
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Số điện thoại
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Người phụ trách
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCompanies.map((company, index) => (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company.id)}
                          onChange={() => handleSelectOne(company.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">
                          {company.tenDoanhNghiep}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {company.mst}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {company.soDienThoai || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {company.user ? company.user.name : "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            company.trangThai
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
                          {company.trangThai}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() =>
                            (window.location.href = `/companies/${company.id}`)
                          }
                          className={`text-blue-600 hover:text-blue-900 ${
                            isAdmin ? "mr-3" : ""
                          }`}
                          title="Xem chi tiết"
                        >
                          <svg
                            className="h-5 w-5 inline"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleDelete(company.id, company.tenDoanhNghiep)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <svg
                              className="h-5 w-5 inline"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Trang <span className="font-medium">{currentPage}</span> /{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const maxPagesToShow = 5;
                        let startPage = Math.max(
                          1,
                          currentPage - Math.floor(maxPagesToShow / 2)
                        );
                        let endPage = Math.min(
                          totalPages,
                          startPage + maxPagesToShow - 1
                        );

                        if (endPage - startPage < maxPagesToShow - 1) {
                          startPage = Math.max(1, endPage - maxPagesToShow + 1);
                        }

                        // First page
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span
                                key="ellipsis1"
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                        }

                        // Page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === i
                                  ? "z-10 bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Last page
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span
                                key="ellipsis2"
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => handlePageChange(totalPages)}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCompanies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không tìm thấy dữ liệu
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Không có công ty nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Phân công công ty
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUserId("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Đã chọn{" "}
                  <span className="font-semibold">
                    {selectedCompanies.length}
                  </span>{" "}
                  công ty để phân công
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn người phụ trách
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn người dùng --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUserId("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xác nhận phân công
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadDataCompany;
