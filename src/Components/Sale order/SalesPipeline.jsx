import React, { useState, useEffect } from "react";
// Import các component từ thư viện drag and drop
// DragDropContext: Bao bọc toàn bộ khu vực có thể drag and drop
// Droppable: Định nghĩa vùng có thể thả (drop zone) - mỗi cột stage
// Draggable: Định nghĩa item có thể kéo - mỗi deal card
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  PlusIcon,
  EllipsisVerticalIcon as DotsVerticalIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import DealModal from "./DealCreateModal";
import DealDetailsModal from "./DealDetailsModal";
import StageViewAllModal from "./StageViewAllModal";
import {
  getAllSaleOrders,
  deleteSaleOrder,
  getAllCustomers,
  getAllServices,
  getAllAddons,
  updateSaleOrder,
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
  const [filterStage, setFilterStage] = useState("all");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // Đọc chế độ xem từ localStorage, mặc định là "pipeline" nếu chưa có
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("salesPipelineViewMode");
    return savedViewMode || "pipeline"; // "pipeline" or "list"
  });
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [selectedStageForView, setSelectedStageForView] = useState(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [inactiveDeals, setInactiveDeals] = useState([]);

  // Load deals when component mounts
  useEffect(() => {
    fetchDeals();
  }, []);

  // Lưu viewMode vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("salesPipelineViewMode", viewMode);
  }, [viewMode]);

  // Filter deals based on search term and stage
  useEffect(() => {
    let filtered = deals;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((deal) => {
        return (
          deal.title.toLowerCase().includes(searchLower) ||
          deal.customerName?.toLowerCase().includes(searchLower) ||
          deal.notes?.toLowerCase().includes(searchLower) ||
          deal.value.toString().includes(searchLower) ||
          deal.probability.toString().includes(searchLower)
        );
      });
    }

    // Apply stage filter
    if (filterStage !== "all") {
      filtered = filtered.filter((deal) => deal.stage === filterStage);
    }

    setFilteredDeals(filtered);
  }, [deals, searchTerm, filterStage]);

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
      console.log(
        "data saleorderrrrrrrrrrrrrrrrrrrrrrrrr",
        saleOrdersResponse.data
      );
      const customersData = customersResponse.data || [];
      const servicesData = servicesResponse.data || [];
      const addonsData = addonsResponse.data || [];

      // Store reference data
      setCustomers(customersData);
      setServices(servicesData);
      setAddons(addonsData);

      // Transform API data to match UI requirements
      const transformedDeals = saleOrders
        .filter((order) => order.status !== "Inactive") // Only show Active orders
        .map((order) => ({
          id: order.id,
          title: order.title,
          customerId: order.customerId,
          customer: order.customer || null, // Giữ nguyên customer object từ API
          customerName:
            order.customer?.name ||
            getCustomerName(order.customerId, customersData), // Thêm field để hiển thị
          createdByUser: order.createdByUser || null, // Giữ nguyên createdByUser object
          value: order.value,
          probability: order.probability,
          notes: order.notes,
          status: order.status || "Active",
          saleOrderServices: order.saleOrderServices || [],
          saleOrderAddons: order.saleOrderAddons || [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          // Auto assign stage based on probability
          stage: getStageByProbability(order.probability),
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 30 days from now
        }));

      // Transform Inactive deals for archive
      const transformedInactiveDeals = saleOrders
        .filter((order) => order.status === "Inactive")
        .map((order) => ({
          id: order.id,
          title: order.title,
          customerId: order.customerId,
          customer: order.customer || null, // Giữ nguyên customer object
          customerName:
            order.customer?.name ||
            getCustomerName(order.customerId, customersData),
          createdByUser: order.createdByUser || null, // Giữ nguyên createdByUser object
          value: order.value,
          probability: order.probability,
          notes: order.notes,
          status: order.status,
          saleOrderServices: order.saleOrderServices || [],
          saleOrderAddons: order.saleOrderAddons || [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          stage: getStageByProbability(order.probability),
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        }));

      setDeals(transformedDeals);
      setFilteredDeals(transformedDeals);
      setInactiveDeals(transformedInactiveDeals);
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

    // API mới: customer.name chứa tên (individual) hoặc tên công ty (company)
    return customer.name || "Unknown Customer";
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
    // Sử dụng deals gốc thay vì filteredDeals để hiển thị tất cả deals trong stage
    return deals.filter((deal) => deal.stage === stageId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterStage("all");
  };

  const hasActiveFilters = () => {
    return searchTerm || filterStage !== "all";
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

  const handleViewAllInStage = (stage) => {
    setSelectedStageForView(stage);
    setIsStageModalOpen(true);
  };

  // Tính toán probability (xác suất) dựa trên stage (giai đoạn)
  // Mỗi stage có một range probability, hàm này lấy giá trị giữa của range
  const getProbabilityByStage = (stageId) => {
    // Tìm stage theo ID
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return 50; // Mặc định 50% nếu không tìm thấy

    // Lấy min và max từ probabilityRange của stage
    // Ví dụ: "Tỉ lệ thấp" có range [1, 35]
    const [min, max] = stage.probabilityRange;
    // Trả về giá trị giữa của range (1+35)/2 = 18
    return Math.floor((min + max) / 2);
  };

  // Xử lý sự kiện khi kéo thả deal card giữa các cột
  // result chứa thông tin về nguồn (source) và đích (destination) của drag
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Nếu thả bên ngoài vùng drop zone hợp lệ, không làm gì
    if (!destination) {
      return;
    }

    // Nếu thả vào đúng vị trí cũ (cùng cột, cùng vị trí), không làm gì
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Tìm deal đang được di chuyển dựa trên draggableId
    const dealId = parseInt(draggableId);
    const deal = deals.find((d) => d.id === dealId);

    if (!deal) return; // Không tìm thấy deal thì dừng

    // Lấy stage mới (ID của cột đích) và tính probability tương ứng
    // Ví dụ: Kéo từ "low" sang "high" => newStage = "high", newProbability = 85
    const newStage = destination.droppableId;
    const newProbability = getProbabilityByStage(newStage);

    try {
      // Optimistic update: Cập nhật UI ngay lập tức trước khi gọi API
      // Điều này giúp UX mượt mà hơn, người dùng thấy thay đổi ngay
      const updatedDeals = deals.map((d) =>
        d.id === dealId
          ? { ...d, stage: newStage, probability: newProbability }
          : d
      );
      setDeals(updatedDeals);

      // Gọi API để cập nhật trên server
      // Gửi toàn bộ thông tin deal kèm probability mới
      await updateSaleOrder(dealId, {
        ...deal,
        probability: newProbability,
      });

      // Hiển thị thông báo thành công
      showSuccess(
        "Thành công!",
        `Đã chuyển deal sang ${stages.find((s) => s.id === newStage)?.name}`
      );
    } catch (error) {
      console.error("Error updating deal stage:", error);
      showError("Lỗi!", "Không thể cập nhật trạng thái deal.");
      // Nếu có lỗi, fetch lại dữ liệu từ server để revert về trạng thái đúng
      await fetchDeals();
    }
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

        {/* View Mode Toggle */}
        <div className="mt-4 flex items-center justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewMode === "pipeline"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5 mr-2" />
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ListBulletIcon className="h-5 w-5 mr-2" />
              Danh sách
            </button>
          </div>
        </div>

        {/* Search Bar and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full max-w-4xl">
            {/* Search Input */}
            <div className="relative flex-1">
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

            {/* Stage Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tất cả giai đoạn</option>
                <option value="low">Tỉ lệ thấp (1-35%)</option>
                <option value="medium">Tỉ lệ trung bình (36-70%)</option>
                <option value="high">Tỉ lệ cao (71-99%)</option>
                <option value="closed-won">Thành công (100%)</option>
                <option value="closed-lost">Thất bại (0%)</option>
              </select>
            </div>

            {/* Archive Button */}
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 whitespace-nowrap"
            >
              <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              Kho lưu trữ
              {inactiveDeals.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                  {inactiveDeals.length}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Search Stats */}
          {hasActiveFilters() && (
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Hiển thị{" "}
              <span className="font-medium text-indigo-600">
                {getSearchStats().filtered}
              </span>{" "}
              / {getSearchStats().total} deals
              {getSearchStats().hidden > 0 && (
                <span className="ml-2 text-gray-500">
                  ({getSearchStats().hidden} đã ẩn)
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
          ) : viewMode === "pipeline" ? (
            // DragDropContext bao bọc toàn bộ pipeline để enable drag and drop
            // onDragEnd: callback được gọi khi người dùng thả (drop) một item
            <DragDropContext onDragEnd={handleDragEnd}>
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
                      onViewAll={handleViewAllInStage}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              </div>
            </DragDropContext>
          ) : (
            <ListView
              deals={filteredDeals}
              onEditDeal={(deal) => {
                setEditingDeal(deal);
                setIsModalOpen(true);
              }}
              onDeleteDeal={handleDeleteDeal}
              onViewDeal={handleViewDeal}
              searchTerm={searchTerm}
              stages={stages}
            />
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

      {/* Stage View All Modal */}
      {selectedStageForView && (
        <StageViewAllModal
          isOpen={isStageModalOpen}
          onClose={() => {
            setIsStageModalOpen(false);
            setSelectedStageForView(null);
          }}
          stage={selectedStageForView}
          deals={getDealsByStage(selectedStageForView.id)}
          onEditDeal={(deal) => {
            setIsStageModalOpen(false);
            setEditingDeal(deal);
            setIsModalOpen(true);
          }}
          onDeleteDeal={handleDeleteDeal}
          onViewDeal={(deal) => {
            setIsStageModalOpen(false);
            handleViewDeal(deal);
          }}
        />
      )}

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        deals={inactiveDeals}
        onViewDeal={handleViewDeal}
        onRestoreDeal={(deal) => {
          // Will be handled by DealDetailsModal to change status back to Active
          handleViewDeal(deal);
        }}
      />
    </div>
  );
};

const ArchiveModal = ({
  isOpen,
  onClose,
  deals,
  onViewDeal,
  onRestoreDeal,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Handle if dateString is already a Date object
      const date =
        typeof dateString === "string"
          ? new Date(dateString)
          : new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Lỗi định dạng";
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Overlay */}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <div className="flex items-center gap-3">
                <ArchiveBoxIcon className="h-6 w-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Kho lưu trữ
                </h2>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-gray-600">
                  Tổng: <span className="font-medium">{deals.length}</span> sale
                  orders
                </p>
                <p className="text-sm text-gray-600">
                  Giá trị:{" "}
                  <span className="font-medium">
                    {formatCurrency(totalValue)}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {deals.length === 0 ? (
              <div className="text-center py-12">
                <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Kho lưu trữ trống</p>
                <p className="text-sm text-gray-400 mt-2">
                  Các sale order có trạng thái Inactive sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cơ hội
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
                    {deals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewDeal(deal)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.title}
                          </div>
                          {deal.notes && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {deal.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {deal.customerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(deal.value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {deal.probability}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(deal.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDeal(deal);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
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
    </div>
  );
};

const ListView = ({
  deals,
  onEditDeal,
  onDeleteDeal,
  onViewDeal,
  searchTerm,
  stages,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Handle if dateString is already a Date object
      const date =
        typeof dateString === "string"
          ? new Date(dateString)
          : new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Lỗi định dạng";
    }
  };

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

  const getStageName = (stageId) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.name : stageId;
  };

  const getStageColor = (stageId) => {
    switch (stageId) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-purple-100 text-purple-800";
      case "closed-won":
        return "bg-green-100 text-green-800";
      case "closed-lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khách hàng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá trị
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giai đoạn
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cơ hội
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày dự kiến
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deals.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-12 text-center">
                <div className="text-gray-500">Chưa có deal nào</div>
              </td>
            </tr>
          ) : (
            deals.map((deal) => (
              <tr
                key={deal.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewDeal(deal)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {highlightText(deal.title, searchTerm)}
                  </div>
                  {deal.notes && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {highlightText(deal.notes, searchTerm)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {highlightText(deal.customerName, searchTerm)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {highlightText(formatCurrency(deal.value), searchTerm)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(
                      deal.stage
                    )}`}
                  >
                    {getStageName(deal.stage)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      deal.status
                    )}`}
                  >
                    {deal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {deal.probability}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(deal.expectedCloseDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDeal(deal);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDeal(deal);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDeal(deal.id);
                      }}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Xóa"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
  onViewAll,
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
      className={`flex-none w-1/6 min-w-0 border rounded-lg ${getColumnColor(
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
        {deals.length > 0 && (
          <button
            onClick={() => onViewAll(stage)}
            className="mt-2 w-full flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-white hover:border-gray-400 transition-colors"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {/* Vùng chứa các deal card - có thể thả deal vào đây */}
      {/* Droppable tạo một drop zone với ID là stage.id (low, medium, high, ...) */}
      <Droppable droppableId={stage.id}>
        {/* Render props pattern: provided chứa props cần thiết, snapshot chứa trạng thái hiện tại */}
        {(provided, snapshot) => (
          <div
            // Ref bắt buộc cho Droppable
            ref={provided.innerRef}
            // Props bắt buộc cho Droppable
            {...provided.droppableProps}
            // Đổi màu nền sang xanh nhạt khi đang kéo deal qua cột này
            className={`p-2 space-y-2 flex-grow ${
              deals.length > 3 ? "overflow-y-auto" : ""
            } ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`}
            style={{
              maxHeight: deals.length > 3 ? "600px" : "none",
              minHeight: "100px", // Chiều cao tối thiểu để dễ thả vào cột rỗng
            }}
          >
            {/* Render từng deal card */}
            {deals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                // Index cần thiết cho Draggable để biết thứ tự trong list
                index={index}
                onEdit={() => onEditDeal(deal)}
                onDelete={() => onDeleteDeal(deal.id)}
                onView={() => onViewDeal(deal)}
                searchTerm={searchTerm}
              />
            ))}
            {/* Placeholder để giữ không gian khi kéo item ra khỏi list */}
            {provided.placeholder}
            {/* Hiển thị text "Chưa có deal" khi cột trống và không đang kéo qua */}
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-xs text-gray-500 py-4">
                Chưa có deal nào
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const DealCard = ({ deal, index, onEdit, onDelete, onView, searchTerm }) => {
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
      // Handle if dateString is already a Date object
      const date =
        typeof dateString === "string"
          ? new Date(dateString)
          : new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Ngày không hợp lệ";
      }

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Lỗi định dạng";
    }
  };

  return (
    // Draggable wrap cho mỗi deal card để có thể kéo
    // draggableId phải là string unique, index là vị trí trong list
    <Draggable draggableId={String(deal.id)} index={index}>
      {/* Render props: provided chứa props cần thiết, snapshot chứa trạng thái drag */}
      {(provided, snapshot) => (
        <div
          // Ref bắt buộc cho Draggable
          ref={provided.innerRef}
          // Props để element có thể drag
          {...provided.draggableProps}
          // Props để xác định vùng có thể grab để drag (toàn bộ card)
          {...provided.dragHandleProps}
          // Style: opacity 50%, xoay nhẹ, shadow lớn hơn khi đang kéo
          className={`bg-white p-2.5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
            snapshot.isDragging ? "opacity-50 rotate-2 shadow-lg" : ""
          }`}
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
                {highlightText(deal.customerName, searchTerm)}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-600">
              <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {formatDate(deal.expectedCloseDate)}
              </span>
            </div>

            {/* Status Badge */}
            {deal.status && (
              <div className="flex items-center">
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    deal.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {deal.status}
                </span>
              </div>
            )}

            {/* Show service/addon info if available */}
            {(deal.serviceId || deal.addonId) && (
              <div className="text-xs text-blue-600 truncate">
                {deal.serviceId && "📋 Có dịch vụ"}{" "}
                {deal.addonId && "🔧 Có addon"}
              </div>
            )}

            <div className="flex justify-end items-center mt-1.5">
              <div className="text-xs text-gray-500">
                {deal.probability}% cơ hội
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default SalesPipeline;
