import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import DealModal from "./DealCreateModal";
import DealDetailsModal from "./DealDetailsModal";
import {
  getAllSaleOrders,
  deleteSaleOrder,
  getAllCustomers,
  getAllServices,
  getAllAddons,
} from "../../Service/ApiService";
import { showSuccess, showError, showConfirm } from "../../utils/sweetAlert";

const SalesPipeline = () => {
  const [stages] = useState([
    { id: "low", name: "Tỉ lệ thấp (1-35%)", probabilityRange: [1, 35] },
    {
      id: "medium",
      name: "Tỉ lệ trung bình (36-70%)",
      probabilityRange: [36, 70],
    },
    { id: "high", name: "Tỉ lệ cao (71-99%)", probabilityRange: [71, 99] },
    {
      id: "closed-won",
      name: "Thành công (100%)",
      probabilityRange: [100, 100],
    },
    { id: "closed-lost", name: "Thất bại (0%)", probabilityRange: [0, 0] },
  ]);

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);

  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Load deals when component mounts
  useEffect(() => {
    fetchDeals();
  }, []);

  // Filter deals based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDeals(deals);
    } else {
      const filtered = deals.filter((deal) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          deal.title.toLowerCase().includes(searchLower) ||
          deal.customer.toLowerCase().includes(searchLower) ||
          deal.notes?.toLowerCase().includes(searchLower) ||
          deal.value.toString().includes(searchLower) ||
          deal.probability.toString().includes(searchLower)
        );
      });
      setFilteredDeals(filtered);
    }
  }, [deals, searchTerm]);

  const fetchDeals = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [
        saleOrdersResponse,
        customersResponse,
        servicesResponse,
        addonsResponse,
      ] = await Promise.all([
        getAllSaleOrders(),
        getAllCustomers(),
        getAllServices(),
        getAllAddons(),
      ]);

      const saleOrders = saleOrdersResponse.data || [];
      const customersData = customersResponse.data || [];
      const servicesData = servicesResponse.data || [];
      const addonsData = addonsResponse.data || [];

      // Store reference data
      setCustomers(customersData);
      setServices(servicesData);
      setAddons(addonsData);

      // Transform API data to match UI requirements
      const transformedDeals = saleOrders.map((order) => ({
        id: order.id,
        title: order.title,
        customerId: order.customerId,
        customer: order.customer
          ? order.customer.name || "Unknown"
          : getCustomerName(order.customerId, customersData),
        value: order.value,
        probability: order.probability,
        taxId: order.taxId,
        tax: order.tax,
        notes: order.notes,
        saleOrderServices: order.saleOrderServices || [],
        saleOrderAddons: order.saleOrderAddons || [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        // Auto assign stage based on probability
        stage: getStageByProbability(order.probability),
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
        priority:
          order.value > 100000000
            ? "high"
            : order.value > 50000000
            ? "medium"
            : "low",
      }));

      setDeals(transformedDeals);
      setFilteredDeals(transformedDeals);
    } catch (error) {
      console.error("Error fetching sale orders:", error);
      showError("Lỗi!", "Không thể tải danh sách sale orders.");
      // Fallback to empty array
      setDeals([]);
      setFilteredDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get customer name by ID
  const getCustomerName = (customerId, customersData) => {
    const customer = customersData.find((c) => c.id === customerId);
    if (!customer) return "Unknown Customer";

    if (customer.customerType === "individual") {
      return customer.name || "Individual Customer";
    } else {
      return customer.companyName || customer.name || "Company Customer";
    }
  };

  // Helper function to determine stage based on probability
  const getStageByProbability = (probability) => {
    if (probability === 100) return "closed-won";
    if (probability === 0) return "closed-lost";
    if (probability >= 71) return "high";
    if (probability >= 36) return "medium";
    return "low";
  };

  const getDealsByStage = (stageId) => {
    return filteredDeals.filter((deal) => deal.stage === stageId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getSearchStats = () => {
    return {
      total: deals.length,
      filtered: filteredDeals.length,
      hidden: deals.length - filteredDeals.length,
    };
  };

  const handleAddDeal = (stageId = "low") => {
    setSelectedStage(stageId);
    setEditingDeal(null);
    setIsModalOpen(true);
  };

  const handleSaveDeal = async (dealData) => {
    try {
      setLoading(true);

      if (editingDeal) {
        // Update existing deal - this will be handled by DealModal internally
        // Just refresh the deals list
        await fetchDeals();
        showSuccess("Thành công!", "Đã cập nhật sale order.");
      } else {
        // Add new deal - this will be handled by DealModal internally
        // Just refresh the deals list
        await fetchDeals();
        showSuccess("Thành công!", "Đã thêm sale order mới.");
      }
    } catch (error) {
      console.error("Error saving deal:", error);
      showError("Lỗi!", "Không thể lưu sale order.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      const confirmed = await showConfirm(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa sale order này?",
        "Xóa",
        "Hủy"
      );

      if (confirmed) {
        setLoading(true);
        await deleteSaleOrder(dealId);
        await fetchDeals(); // Refresh list
        showSuccess("Thành công!", "Đã xóa sale order.");
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      showError("Lỗi!", "Không thể xóa sale order.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeal = (deal) => {
    setViewingDeal(deal);
    setIsDetailsModalOpen(true);
  };

  const getTotalValue = () => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý cơ hội bán hàng và theo dõi tiến trình
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => handleAddDeal("low")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm deal mới
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tìm kiếm theo tên deal, khách hàng, ghi chú, giá trị..."
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Search Stats */}
          {searchTerm && (
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-medium text-indigo-600">
                {getSearchStats().filtered}
              </span>{" "}
              / {getSearchStats().total} deals
              {getSearchStats().hidden > 0 && (
                <span className="ml-2 text-gray-500">
                  ({getSearchStats().hidden} deal đã ẩn)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">
              {filteredDeals.length}
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm ? "Deals hiển thị" : "Tổng số deals"}
            </div>
            {searchTerm && deals.length !== filteredDeals.length && (
              <div className="text-xs text-gray-500 mt-1">
                Tổng: {deals.length} deals
              </div>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(getTotalValue())}
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm ? "Giá trị hiển thị" : "Tổng giá trị"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {getDealsByStage("closed-won").length}
            </div>
            <div className="text-sm text-gray-600">Deals thành công</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {filteredDeals.length > 0
                ? Math.round(
                    (getDealsByStage("closed-won").length /
                      filteredDeals.length) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ chốt deal</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {filteredDeals.filter((d) => d.serviceId || d.addonId).length}
            </div>
            <div className="text-sm text-gray-600">Có dịch vụ/addon</div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : filteredDeals.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 mb-4">
                Không có deal nào khớp với từ khóa "{searchTerm}"
              </p>
              <button
                onClick={clearSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex space-x-4" style={{ minWidth: "100%" }}>
                {stages.map((stage) => (
                  <PipelineColumn
                    key={stage.id}
                    stage={stage}
                    deals={getDealsByStage(stage.id)}
                    onAddDeal={handleAddDeal}
                    onDeleteDeal={handleDeleteDeal}
                    onEditDeal={(deal) => {
                      setEditingDeal(deal);
                      setIsModalOpen(true);
                    }}
                    onViewDeal={handleViewDeal}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deal={editingDeal}
        stageId={selectedStage}
        onSave={handleSaveDeal}
      />

      {/* Deal Details Modal */}
      <DealDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        deal={viewingDeal}
        customers={customers}
        services={services}
        addons={addons}
        onUpdate={fetchDeals}
      />
    </div>
  );
};

const PipelineColumn = ({
  stage,
  deals,
  onAddDeal,
  onDeleteDeal,
  onEditDeal,
  onViewDeal,
  searchTerm,
}) => {
  const getColumnColor = (stageId) => {
    switch (stageId) {
      case "low":
        return "border-blue-200 bg-blue-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "high":
        return "border-purple-200 bg-purple-50";
      case "closed-won":
        return "border-green-200 bg-green-50";
      case "closed-lost":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`flex-none w-1/5 min-w-0 border rounded-lg ${getColumnColor(
        stage.id
      )} flex flex-col`}
      style={{
        minWidth: "calc(20% - 16px)",
        height: "fit-content",
        minHeight: "400px",
      }}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate flex-1">
            {stage.name}
          </h3>
          <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 ml-2 flex-shrink-0">
            {deals.length}
          </span>
        </div>
        <div className="text-xs text-gray-600 truncate">
          {formatCurrency(totalValue)}
          {deals.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              TB: {formatCurrency(totalValue / deals.length)}
            </div>
          )}
        </div>
        {/* <button 
          onClick={() => onAddDeal(stage.id)}
          className="mt-2 w-full flex items-center justify-center px-2 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Thêm deal
        </button> */}
      </div>

      {/* Deals List */}
      <div className="p-2 space-y-2 flex-grow">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onEdit={() => onEditDeal(deal)}
            onDelete={() => onDeleteDeal(deal.id)}
            onView={() => onViewDeal(deal)}
            searchTerm={searchTerm}
          />
        ))}
        {deals.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4">
            Chưa có deal nào
          </div>
        )}
      </div>
    </div>
  );
};

const DealCard = ({ deal, onEdit, onDelete, onView, searchTerm }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.toString().split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 flex-1 mr-1">
          {highlightText(deal.title, searchTerm)}
        </h4>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-gray-400 hover:text-gray-600"
          >
            <DotsVerticalIcon className="h-3 w-3" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-4 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-100"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center text-xs text-gray-600">
          <CurrencyDollarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="font-medium truncate text-xs">
            {highlightText(formatCurrency(deal.value), searchTerm)}
          </span>
        </div>

        <div className="flex items-center text-xs text-gray-600">
          <UserIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">
            {highlightText(deal.customer, searchTerm)}
          </span>
        </div>

        <div className="flex items-center text-xs text-gray-600">
          <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{formatDate(deal.expectedCloseDate)}</span>
        </div>

        {/* Show service/addon info if available */}
        {(deal.serviceId || deal.addonId) && (
          <div className="text-xs text-blue-600 truncate">
            {deal.serviceId && "📋 Có dịch vụ"} {deal.addonId && "🔧 Có addon"}
          </div>
        )}

        <div className="flex justify-between items-center mt-1.5">
          <span
            className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(
              deal.priority
            )}`}
          >
            {deal.priority === "high"
              ? "Cao"
              : deal.priority === "medium"
              ? "TB"
              : "Thấp"}
          </span>
          <div className="text-xs text-gray-500">
            {deal.probability}% cơ hội
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPipeline;
