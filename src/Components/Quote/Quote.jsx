import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import QuoteModal from "./QuoteModal";
import QuotePreviewModal from "./QuotePreviewModal";
import {
  getAllQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
} from "../../Service/ApiService";

const Quote = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuoteId, setPreviewQuoteId] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllQuotes();
      setQuotes(response.data || []);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      showError("Lỗi!", "Không thể tải danh sách báo giá");
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuote = () => {
    navigate("/quotes/create");
  };

  const handleEditQuote = (quote) => {
    navigate(`/quotes/edit/${quote.id}`);
  };

  const handleViewQuote = (quote) => {
    // TODO: Open view modal
    console.log("View quote:", quote);
  };

  const handlePreviewQuote = (quoteId) => {
    setPreviewQuoteId(quoteId);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewQuoteId(null);
  };

  const handleModalSubmit = async (quoteData) => {
    try {
      if (selectedQuote) {
        // Update existing quote
        await updateQuote(selectedQuote.id, quoteData);
        showSuccess("Thành công!", "Đã cập nhật báo giá");
      } else {
        // Create new quote
        await createQuote(quoteData);
        showSuccess("Thành công!", "Đã tạo báo giá mới");
      }

      setIsModalOpen(false);
      setSelectedQuote(null);
      fetchQuotes(); // Reload quotes list
    } catch (error) {
      console.error("Error saving quote:", error);
      showError("Lỗi!", "Không thể lưu báo giá");
    }
  };

  const handleDeleteQuote = async (id) => {
    const result = await showDeleteConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa báo giá này?"
    );

    if (result.isConfirmed) {
      try {
        await deleteQuote(id);
        showSuccess("Thành công!", "Đã xóa báo giá");
        fetchQuotes(); // Reload quotes list
      } catch (error) {
        console.error("Error deleting quote:", error);
        showError("Lỗi!", "Không thể xóa báo giá");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredQuotes = quotes.filter((quote) => {
    const customerName = quote.customer?.name || "";
    const serviceName = quote.service?.name || "";
    const addonName = quote.addon?.name || "";

    const matchesSearch =
      quote.id.toString().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addonName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-8 w-8 mr-2 text-indigo-600" />
              Quản lý Báo giá
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các báo giá cho khách hàng
            </p>
          </div>
          <button
            onClick={handleCreateQuote}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo Báo giá
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID, khách hàng, dịch vụ, addon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Items per page */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-8 w-8 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="ml-3 text-gray-600">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedQuotes.length > 0 ? (
                paginatedQuotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{quote.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.customer?.name ||
                          quote.customer?.companyName ||
                          "N/A"}
                      </div>
                      {quote.customer?.phoneNumber && (
                        <div className="text-xs text-gray-500">
                          {quote.customer.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {quote.categoryServiceAddon?.name || (
                          <span className="text-gray-400 italic">
                            Tùy chỉnh
                          </span>
                        )}
                      </div>
                      {quote.services && quote.services.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {quote.services.length} dịch vụ
                          {quote.addons &&
                            quote.addons.length > 0 &&
                            `, ${quote.addons.length} addon`}
                        </div>
                      )}
                      {quote.customService &&
                        quote.customService.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {quote.customService.length} dịch vụ tùy chỉnh
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.createdByUser?.name || "N/A"}
                      </div>
                      {quote.createdByUser?.position && (
                        <div className="text-xs text-gray-500">
                          {quote.createdByUser.position}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatPrice(quote.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString("vi-VN")}
                      <div className="text-xs text-gray-400">
                        {new Date(quote.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreviewQuote(quote.id)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                          title="Xem trước PDF"
                        >
                          <DocumentIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Không có báo giá
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bắt đầu bằng cách tạo báo giá mới.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleCreateQuote}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Tạo Báo giá
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredQuotes.length)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{filteredQuotes.length}</span>{" "}
                  báo giá
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuote(null);
        }}
        onSubmit={handleModalSubmit}
        quote={selectedQuote}
      />

      {/* Quote Preview Modal */}
      <QuotePreviewModal
        quoteId={previewQuoteId}
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default Quote;
