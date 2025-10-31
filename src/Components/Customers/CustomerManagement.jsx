import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon as MailIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  getAllCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer,
} from "../../Service/ApiService";
import CustomerRow from "./CustomerRow";
import CustomerModal from "./CustomerModalCreate";
import CustomerDetailModal from "./CustomerDetailModal";
import DealCreateModal from "../Sale order/DealCreateModal";
import {
  showDeleteConfirm,
  showSuccess,
  showError,
} from "../../utils/sweetAlert";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [isSaleOrderModalOpen, setIsSaleOrderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách khách hàng");
      showError(
        "Lỗi tải dữ liệu",
        "Không thể tải danh sách khách hàng. Vui lòng thử lại."
      );
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const customerName = customer.fullName || customer.name || "";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || "").includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setViewingCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleCreateSaleOrder = (customer) => {
    setSelectedCustomer(customer);
    setIsSaleOrderModalOpen(true);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        // Cập nhật khách hàng hiện có
        await updateCustomer(editingCustomer.id, customerData);

        // Cập nhật state local
        setCustomers(
          customers.map((c) =>
            c.id === editingCustomer.id
              ? { ...customerData, id: editingCustomer.id }
              : c
          )
        );

        showSuccess("Thành công!", "Cập nhật khách hàng thành công");
      } else {
        // Tạo khách hàng mới
        const response = await createCustomer(customerData);
        const newCustomer = response.data;
        setCustomers([...customers, newCustomer]);

        showSuccess("Thành công!", "Tạo khách hàng thành công");
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Lỗi khi lưu khách hàng:", error);
      showError(
        "Lỗi!",
        "Có lỗi xảy ra khi lưu thông tin khách hàng. Vui lòng thử lại."
      );
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const result = await showDeleteConfirm("khách hàng này");

    if (result.isConfirmed) {
      try {
        // Gọi API xóa khách hàng
        await deleteCustomer(customerId);

        // Cập nhật state local sau khi xóa thành công
        setCustomers(customers.filter((c) => c.id !== customerId));

        // Thông báo thành công
        showSuccess("Thành công!", "Đã xóa khách hàng thành công");
      } catch (error) {
        // Xử lý lỗi
        console.error("Lỗi khi xóa khách hàng:", error);
        showError(
          "Lỗi!",
          "Có lỗi xảy ra khi xóa khách hàng. Vui lòng thử lại."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">
          Đang tải danh sách khách hàng...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý khách hàng
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Danh sách tất cả khách hàng trong hệ thống
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleAddCustomer}
              className="inline-flex items-center px-4 py-2 border cursor-pointer border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm khách hàng
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng khách hàng
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {customers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Hoạt động
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {customers.filter((c) => c.status === "active").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tiềm năng
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {customers.filter((c) => c.status === "potential").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Không hoạt động
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {customers.filter((c) => c.status === "inactive").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <div className="relative">
                <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="potential">Tiềm năng</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPageCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  onView={handleViewCustomer}
                  onCreateSaleOrder={handleCreateSaleOrder}
                />
              ))}
            </tbody>
          </table>

          {currentPageCustomers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-sm text-gray-500">
                {filteredCustomers.length === 0
                  ? "Không tìm thấy khách hàng nào"
                  : "Không có dữ liệu trên trang này"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          {/* Mobile pagination */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>

          {/* Desktop pagination */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, totalItems)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{totalItems}</span> khách hàng
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Hiển thị:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => changeItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">mục/trang</span>
              </div>
            </div>

            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {/* Previous button */}
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(showPages / 2)
                  );
                  let endPage = Math.min(totalPages, startPage + showPages - 1);

                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  // First page + ellipsis
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => goToPage(1)}
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

                  // Main page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page + ellipsis
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
                        onClick={() => goToPage(totalPages)}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingCustomer(null);
        }}
        customer={viewingCustomer}
      />

      {/* Sale Order Create Modal */}
      <DealCreateModal
        isOpen={isSaleOrderModalOpen}
        onClose={() => {
          setIsSaleOrderModalOpen(false);
          setSelectedCustomer(null);
        }}
        deal={
          selectedCustomer
            ? {
                customerId: String(selectedCustomer.id),
                title: "",
                probability: 0,
                notes: "",
                taxId: "",
              }
            : null
        }
        onSave={() => {
          setIsSaleOrderModalOpen(false);
          setSelectedCustomer(null);
          showSuccess("Thành công!", "Tạo Sale Order thành công");
        }}
      />
    </div>
  );
};

export default CustomerManagement;
