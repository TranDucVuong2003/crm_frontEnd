import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import SalaryContractRow from "./SalaryContractRow";
import SalaryContractModal from "./SalaryContractModal";
import SalaryContractDetailModal from "./SalaryContractDetailModal";
import {
  showDeleteConfirm,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";
import {
  getAllSalaryContracts,
  deleteSalaryContract,
} from "../../Service/ApiService";

const SalaryContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractTypeFilter, setContractTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSalaryContracts();
      setContracts(response.data || []);
    } catch (err) {
      setError("Không thể tải danh sách cấu hình lương");
      showError(
        "Lỗi tải dữ liệu",
        "Không thể tải danh sách cấu hình lương. Vui lòng thử lại."
      );
      console.error("Error fetching salary contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search contracts (newest first)
  const filteredContracts = contracts
    .filter((contract) => {
      const matchesSearch =
        contract.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.userId?.toString().includes(searchTerm);

      const matchesType =
        contractTypeFilter === "all" ||
        contract.contractType === contractTypeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination calculations
  const totalItems = filteredContracts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageContracts = filteredContracts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, contractTypeFilter]);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Modal handlers
  const handleAdd = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleView = (contract) => {
    setViewingContract(contract);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm(
      "Bạn có chắc chắn muốn xóa cấu hình lương này?",
      "Hành động này không thể hoàn tác!"
    );

    if (result.isConfirmed) {
      try {
        await deleteSalaryContract(id);
        await fetchContracts();
        showSuccess("Đã xóa!", "Cấu hình lương đã được xóa thành công.");
      } catch (error) {
        console.error("Error deleting contract:", error);
        showError(
          "Lỗi!",
          error.response?.data?.message ||
            "Không thể xóa cấu hình lương. Vui lòng thử lại."
        );
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingContract(null);
  };

  const handleModalSuccess = () => {
    fetchContracts();
    handleModalClose();
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setViewingContract(null);
  };

  // Stats calculation
  const stats = {
    total: contracts.length,
    official: contracts.filter((c) => c.contractType === "OFFICIAL").length,
    freelance: contracts.filter((c) => c.contractType === "FREELANCE").length,
    withCommitment: contracts.filter((c) => c.hasCommitment08).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            Cấu hình lương nhân viên
          </h1>
          <p className="text-gray-600">
            Thiết lập thông tin lương và hợp đồng cho nhân viên
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Chính thức</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.official}
                </p>
              </div>
              <UserIcon className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Freelance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.freelance}
                </p>
              </div>
              <UserIcon className="h-12 w-12 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Cam kết 08</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.withCommitment}
                </p>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-orange-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên theo tên, email, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="flex items-center gap-3">
                {/* Contract Type Filter */}
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5 text-gray-500" />
                  <select
                    value={contractTypeFilter}
                    onChange={(e) => setContractTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả loại HĐ</option>
                    <option value="OFFICIAL">Chính thức</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Thêm mới</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lương cơ bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lương BHXH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại HĐ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cam kết 08
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <p className="text-red-500">{error}</p>
                    </td>
                  </tr>
                ) : currentPageContracts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <p className="text-gray-500">Không có dữ liệu</p>
                    </td>
                  </tr>
                ) : (
                  currentPageContracts.map((contract) => (
                    <SalaryContractRow
                      key={contract.id}
                      contract={contract}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filteredContracts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Hiển thị</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">
                  trên tổng số {totalItems} bản ghi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <SalaryContractModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          editingContract={editingContract}
        />
      )}

      {isDetailModalOpen && (
        <SalaryContractDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          contract={viewingContract}
        />
      )}
    </div>
  );
};

export default SalaryContractManagement;
