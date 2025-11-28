import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, getMyTickets } from "../../Service/ApiService";
import { useAuth } from "../../Context/AuthContext";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TagIcon,
  ChevronDownIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  StarIcon,
  UserIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import TicketForm from "./TicketForm";
import ViewAllTicketsModal from "./ViewAllTicketsModal";
import TicketDetailModal from "./TicketDetailModal";

const Helpdesk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper function để sanitize và render HTML content
  const renderHTMLContent = (htmlString) => {
    if (!htmlString) return "Không có mô tả";

    // Basic HTML sanitization - loại bỏ các tag nguy hiểm
    let sanitized = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "") // Loại bỏ event handlers
      .replace(/javascript:/gi, ""); // Loại bỏ javascript: URLs

    // Loại bỏ HTML tags để hiển thị text thuần cho preview
    return sanitized.replace(/<[^>]*>/g, "").trim();
  };

  // ==================== STATES ====================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
  // Filter state
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unresolved', 'medium', 'high', 'closed'
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ==================== API CALLS ====================
  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Gọi API phù hợp dựa trên role
      // API /my-tickets tự động filter ở backend
      const response =
        user?.role?.toLowerCase() === "admin"
          ? await getAllTickets() // Admin xem tất cả
          : await getMyTickets(); // User xem tickets của mình

      // Handle different API response structures
      const ticketsData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setTickets(ticketsData);

      // Log thông tin về response
      console.log("API Response:", {
        role: response.data?.role,
        isAdmin: response.data?.isAdmin,
        userId: response.data?.userId,
        totalTickets: response.data?.totalTickets,
        tickets: ticketsData,
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      // Fallback to empty array if API fails
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ==================== CONSTANTS ====================
  const STATUSES = [
    { id: "new", name: "Mới", color: "bg-blue-100 text-blue-800" },
    { id: "open", name: "Đang mở", color: "bg-yellow-100 text-yellow-800" },
    {
      id: "in_progress",
      name: "Đang xử lý",
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "pending",
      name: "Chờ phản hồi",
      color: "bg-purple-100 text-purple-800",
    },
    { id: "escalated", name: "Leo thang", color: "bg-red-100 text-red-800" },
    {
      id: "resolved",
      name: "Đã giải quyết",
      color: "bg-green-100 text-green-800",
    },
    { id: "closed", name: "Đã đóng", color: "bg-gray-100 text-gray-800" },
    { id: "archived", name: "Lưu trữ", color: "bg-slate-100 text-slate-600" },
  ];

  const CATEGORIES = [
    { id: "technical", name: "Kỹ thuật", icon: "🔧" },
    { id: "bug", name: "Lỗi hệ thống", icon: "🐛" },
    { id: "feature_request", name: "Yêu cầu tính năng", icon: "💡" },
    { id: "account", name: "Tài khoản", icon: "👤" },
    { id: "billing", name: "Thanh toán", icon: "💳" },
    { id: "general", name: "Tổng quát", icon: "📋" },
  ];

  const AGENTS = [
    {
      id: 1,
      name: "Trần Thị B",
      email: "tranthib@company.com",
      department: "Technical",
    },
    {
      id: 2,
      name: "Phạm Văn D",
      email: "phamvand@company.com",
      department: "Product",
    },
    {
      id: 3,
      name: "Vũ Văn F",
      email: "vuvanf@company.com",
      department: "Technical",
    },
  ];

  // ==================== EVENT HANDLERS ====================
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketDetailModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  // const handleCreateTicket = () => {
  //   setSelectedTicket(null);
  //   setIsTicketModalOpen(true);
  // };

  // Modern Ticket Card Component
  const ModernTicketCard = ({ ticket, onView, onStatusChange }) => {
    const getStatusConfig = (status) => {
      // Chỉ sử dụng dữ liệu thật từ database - hiển thị nguyên bản status từ API
      return {
        color: "bg-gray-100 text-gray-800",
        label: status || "Không xác định",
      };
    };

    const statusConfig = getStatusConfig(ticket.status);

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div
        className="bg-gradient-to-r from-white to-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
        onClick={() => onView(ticket)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm truncate mb-1">
              {ticket.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              {renderHTMLContent(ticket.description)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-3">
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}
            >
              {/* Status label removed */}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1" />
              {ticket.customer?.name}
            </span>
            <span className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatDate(ticket.createdAt)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {ticket.urgencyLevel > 0 && (
              <div className="flex items-center">
                <StarIconSolid className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-slate-600 ml-1">
                  {ticket.urgencyLevel}
                </span>
              </div>
            )}
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Status change function now handled inside component

  const handleAssignTicket = (ticketId, agentId) => {
    const agent = AGENTS.find((a) => a.id === parseInt(agentId));
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              assignedTo: agent,
              updatedAt: new Date().toISOString(),
            }
          : ticket
      )
    );
  };

  const handleViewAllTickets = () => {
    setIsViewAllModalOpen(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Function to get filtered tickets based on active filter
  const getFilteredTickets = () => {
    // Lọc bỏ tickets có status "archived" trước (case-insensitive)
    const nonArchivedTickets = tickets.filter(
      (t) => t.status?.toLowerCase() !== "archived"
    );

    console.log("Total tickets:", tickets.length);
    console.log("Non-archived tickets:", nonArchivedTickets.length);
    console.log(
      "Archived tickets:",
      tickets.filter((t) => t.status?.toLowerCase() === "archived")
    );

    switch (activeFilter) {
      case "unresolved":
        return nonArchivedTickets.filter(
          (t) =>
            t.status?.toLowerCase() !== "closed" &&
            t.status?.toLowerCase() !== "resolved"
        );
      case "closed":
        return nonArchivedTickets.filter(
          (t) =>
            t.status?.toLowerCase() === "closed" ||
            t.status?.toLowerCase() === "resolved"
        );
      case "all":
      default:
        return nonArchivedTickets;
    }
  };

  // Get filter label for display
  const getFilterLabel = () => {
    switch (activeFilter) {
      case "unresolved":
        return "Chưa giải quyết";
      case "medium":
        return "Mức trung bình";
      case "high":
        return "Ưu tiên cao";
      case "closed":
        return "Đã đóng";
      case "all":
      default:
        return "Tất cả phiếu";
    }
  };

  // Pagination logic
  const getPaginatedTickets = () => {
    const filtered = getFilteredTickets();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredTickets().length / itemsPerPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of tickets list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Helper functions for statistics
  const getTicketsByStatus = (status) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  const getTicketsResolvedToday = () => {
    const today = new Date().toDateString();
    return tickets.filter(
      (ticket) =>
        ticket.status === "closed" &&
        ticket.status?.toLowerCase() !== "archived" &&
        new Date(ticket.updatedAt).toDateString() === today
    ).length;
  };

  const getTicketsResolvedLastWeek = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return tickets.filter(
      (ticket) =>
        ticket.status === "closed" &&
        ticket.status?.toLowerCase() !== "archived" &&
        new Date(ticket.updatedAt) >= lastWeek
    ).length;
  };

  const getAverageRating = () => {
    const ratedTickets = tickets.filter(
      (ticket) =>
        ticket.stars &&
        ticket.stars > 0 &&
        ticket.status?.toLowerCase() !== "archived"
    );
    if (ratedTickets.length === 0) return 0;
    const totalStars = ratedTickets.reduce(
      (sum, ticket) => sum + ticket.stars,
      0
    );
    return totalStars / ratedTickets.length;
  };

  const getTicketsWithRating = () => {
    return tickets.filter(
      (ticket) =>
        ticket.stars &&
        ticket.stars > 0 &&
        ticket.status?.toLowerCase() !== "archived"
    );
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            ...(newStatus === "resolved" && {
              resolvedAt: new Date().toISOString(),
            }),
            ...(newStatus === "closed" && {
              closedAt: new Date().toISOString(),
            }),
          }
        : ticket
    );

    setTickets(updatedTickets);

    // Update selectedTicket if it's the one being changed
    if (selectedTicket && selectedTicket.id === ticketId) {
      const updatedSelectedTicket = updatedTickets.find(
        (t) => t.id === ticketId
      );
      setSelectedTicket(updatedSelectedTicket);
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  📞 Helpdesk Dashboard
                </h1>
                <p className="text-slate-600 mt-2 text-sm lg:text-base">
                  Quản lý và theo dõi phiếu hỗ trợ khách hàng
                </p>

                {/* Role Badge */}
                {user && (
                  <div className="mt-3 flex items-center gap-2">
                    {user.role?.toLowerCase() === "admin" ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-700 font-medium">
                          Admin - Xem tất cả tickets
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">
                          Tickets được phân công cho bạn
                        </span>
                      </div>
                    )}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm">
                      <TagIcon className="h-4 w-4 text-slate-600" />
                      <span className="text-slate-700 font-medium">
                        {
                          tickets.filter(
                            (t) => t.status?.toLowerCase() !== "archived"
                          ).length
                        }{" "}
                        tickets
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Nút xem kho lưu trữ - chỉ Admin */}
                {user?.role?.toLowerCase() === "admin" && (
                  <button
                    onClick={() => setIsArchivedModalOpen(true)}
                    className="inline-flex items-center px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 shadow hover:shadow-md border border-slate-300"
                    title="Xem kho lưu trữ"
                  >
                    <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                    Kho lưu trữ
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 rounded-full text-xs font-medium">
                      {
                        tickets.filter(
                          (t) => t.status?.toLowerCase() === "archived"
                        ).length
                      }
                    </span>
                  </button>
                )}
                <button
                  onClick={() => navigate("/helpdesk/create")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Tạo phiếu hỗ trợ mới
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout: Full Width */}
          <div className="grid grid-cols-1 gap-6">
            {/* Phiếu Hỗ Trợ Của Tôi */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <TagIcon className="h-6 w-6 mr-3" />
                    Phiếu Hỗ Trợ Của Tôi
                  </h2>
                  <p className="mt-2 text-blue-100">
                    Danh sách các phiếu hỗ trợ đang xử lý
                  </p>
                </div> */}

                {/* Ticket Stats Row */}
                <div className="p-6 border-b border-slate-100">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Tất cả */}
                    <button
                      onClick={() => handleFilterChange("all")}
                      className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                        activeFilter === "all"
                          ? "border-blue-400 shadow-lg ring-2 ring-blue-300"
                          : "border-blue-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">
                            Tất cả
                          </p>
                          <p className="text-2xl font-bold text-blue-700">
                            {
                              tickets.filter(
                                (t) => t.status?.toLowerCase() !== "archived"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <TagIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </button>

                    {/* Chưa giải quyết (Unresolved) */}
                    <button
                      onClick={() => handleFilterChange("unresolved")}
                      className={`bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                        activeFilter === "unresolved"
                          ? "border-red-400 shadow-lg ring-2 ring-red-300"
                          : "border-red-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-600 text-sm font-medium">
                            Chưa giải quyết
                          </p>
                          <p className="text-2xl font-bold text-red-700">
                            {
                              tickets.filter(
                                (t) =>
                                  t.status?.toLowerCase() !== "archived" &&
                                  t.status?.toLowerCase() !== "closed" &&
                                  t.status?.toLowerCase() !== "resolved"
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </button>

                    {/* Đã đóng (Closed) */}
                    <button
                      onClick={() => handleFilterChange("closed")}
                      className={`bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                        activeFilter === "closed"
                          ? "border-green-400 shadow-lg ring-2 ring-green-300"
                          : "border-green-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">
                            Đã đóng
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {
                              tickets.filter(
                                (t) =>
                                  t.status?.toLowerCase() !== "archived" &&
                                  (t.status?.toLowerCase() === "closed" ||
                                    t.status?.toLowerCase() === "resolved")
                              ).length
                            }
                          </p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-lg">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="p-6">
                  {/* Filter Header with Pagination Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-slate-700">
                        {getFilterLabel()}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {getFilteredTickets().length} phiếu
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Items per page selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">
                          Hiển thị:
                        </span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) =>
                            handleItemsPerPageChange(Number(e.target.value))
                          }
                          className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {activeFilter !== "all" && (
                        <button
                          onClick={() => handleFilterChange("all")}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          <span>Xóa bộ lọc</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Showing results info */}
                  {getFilteredTickets().length > 0 && (
                    <div className="text-sm text-slate-600 mb-4">
                      Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        getFilteredTickets().length
                      )}{" "}
                      của {getFilteredTickets().length} phiếu
                    </div>
                  )}

                  {getPaginatedTickets().length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {getPaginatedTickets().map((ticket) => (
                          <ModernTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onView={handleViewTicket}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>

                      {/* Pagination - Always show */}
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Page info */}
                        <div className="text-sm text-slate-600">
                          Trang {currentPage} / {getTotalPages()}
                        </div>

                        {/* Pagination buttons */}
                        <div className="flex items-center space-x-2">
                          {/* Previous button */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === 1
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300"
                            }`}
                          >
                            Trước
                          </button>

                          {/* Page numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: getTotalPages() },
                              (_, i) => i + 1
                            ).map((page) => {
                              // Show first page, last page, current page, and pages around current
                              const showPage =
                                page === 1 ||
                                page === getTotalPages() ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1);

                              const showEllipsis =
                                (page === currentPage - 2 && currentPage > 3) ||
                                (page === currentPage + 2 &&
                                  currentPage < getTotalPages() - 2);

                              if (showEllipsis) {
                                return (
                                  <span
                                    key={page}
                                    className="px-2 text-slate-400"
                                  >
                                    ...
                                  </span>
                                );
                              }

                              if (!showPage) return null;

                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === page
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                          </div>

                          {/* Next button */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === getTotalPages()}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === getTotalPages()
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300"
                            }`}
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <TagIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        {getFilteredTickets().length === 0 &&
                        tickets.filter((t) => t.status !== "archived")
                          .length === 0
                          ? user?.role?.toLowerCase() === "admin"
                            ? "Chưa có phiếu hỗ trợ nào trong hệ thống"
                            : "Chưa có phiếu hỗ trợ nào được phân công cho bạn"
                          : "Không có phiếu nào phù hợp với bộ lọc"}
                      </h3>
                      <p className="text-slate-500 mb-4">
                        {getFilteredTickets().length === 0 &&
                        tickets.filter((t) => t.status !== "archived")
                          .length === 0
                          ? user?.role?.toLowerCase() === "admin"
                            ? "Bắt đầu bằng cách tạo phiếu hỗ trợ đầu tiên"
                            : "Tickets sẽ xuất hiện khi quản trị viên phân công cho bạn"
                          : "Thử chọn bộ lọc khác"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {isTicketModalOpen && (
            <TicketForm
              isOpen={isTicketModalOpen}
              onClose={() => setIsTicketModalOpen(false)}
              ticket={selectedTicket}
              onSubmit={async (ticketData) => {
                if (selectedTicket) {
                  // Edit existing ticket - update local state
                  setTickets(
                    tickets.map((t) =>
                      t.id === selectedTicket.id
                        ? {
                            ...t,
                            ...ticketData,
                            updatedAt: new Date().toISOString(),
                          }
                        : t
                    )
                  );
                } else {
                  // New ticket created - refresh data from API
                  await fetchTickets();
                }
                setIsTicketModalOpen(false);
              }}
            />
          )}

          {isViewAllModalOpen && (
            <ViewAllTicketsModal
              isOpen={isViewAllModalOpen}
              onClose={() => setIsViewAllModalOpen(false)}
              tickets={tickets}
              statuses={STATUSES}
              categories={CATEGORIES}
              agents={AGENTS}
              onStatusChange={handleStatusChange}
              onAssignTicket={handleAssignTicket}
              onViewTicket={handleViewTicket}
              onEditTicket={handleEditTicket}
            />
          )}

          {isTicketDetailModalOpen && (
            <TicketDetailModal
              isOpen={isTicketDetailModalOpen}
              onClose={() => setIsTicketDetailModalOpen(false)}
              ticket={selectedTicket}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTicket}
              onRefresh={fetchTickets}
            />
          )}

          {/* Modal xem kho lưu trữ - chỉ Admin */}
          {isArchivedModalOpen && user?.role?.toLowerCase() === "admin" && (
            <ArchivedTicketsModal
              isOpen={isArchivedModalOpen}
              onClose={() => setIsArchivedModalOpen(false)}
              tickets={tickets.filter(
                (t) => t.status?.toLowerCase() === "archived"
              )}
              onViewTicket={handleViewTicket}
              onRefresh={fetchTickets}
            />
          )}
        </>
      )}
    </div>
  );
};

// Helpdesk Overview Component
const HelpdeskOverview = ({ tickets }) => {
  // Lọc bỏ archived tickets trước khi tính toán stats (case-insensitive)
  const nonArchivedTickets = tickets.filter(
    (t) => t.status?.toLowerCase() !== "archived"
  );

  console.log("HelpdeskOverview - Total:", tickets.length);
  console.log("HelpdeskOverview - Non-archived:", nonArchivedTickets.length);

  // Tạo stats dựa trên dữ liệu thực từ database
  const uniqueStatuses = [
    ...new Set(nonArchivedTickets.map((t) => t.status).filter(Boolean)),
  ];

  const stats = {
    total: nonArchivedTickets.length,
    // Chỉ tính dựa trên dữ liệu thật từ database
    byStatus: uniqueStatuses.reduce((acc, status) => {
      acc[status] = nonArchivedTickets.filter(
        (t) => t.status === status
      ).length;
      return acc;
    }, {}),
  };

  // Tạo urgencyCards dựa trên urgencyLevel (stars) từ database
  const urgencyLevels = [1, 2, 3, 4, 5];
  const urgencyCards = urgencyLevels.map((level) => ({
    title: `${level} sao - ${
      level === 1
        ? "Bình thường"
        : level === 2
        ? "Quan trọng"
        : level === 3
        ? "Khẩn cấp"
        : level === 4
        ? "Rất khẩn cấp"
        : "Cực kỳ khẩn cấp"
    }`,
    count: nonArchivedTickets.filter((t) => t.urgencyLevel === level).length,
    color: [
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-orange-500",
      "bg-red-500",
    ][level - 1],
    textColor: [
      "text-green-600",
      "text-blue-600",
      "text-yellow-600",
      "text-orange-600",
      "text-red-600",
    ][level - 1],
    bgColor: [
      "bg-green-50",
      "bg-blue-50",
      "bg-yellow-50",
      "bg-orange-50",
      "bg-red-50",
    ][level - 1],
    icon: [
      ArrowTrendingDownIcon,
      MinusIcon,
      ArrowTrendingUpIcon,
      ExclamationTriangleIcon,
      ExclamationTriangleIcon,
    ][level - 1],
    trend: `${
      nonArchivedTickets.filter((t) => t.urgencyLevel === level).length
    } tickets`,
  }));

  // Tạo overallStats dựa trên dữ liệu thật từ database
  const overallStats = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: TagIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    ...Object.entries(stats.byStatus).map(([status, count], index) => ({
      title: `Status: ${status}`,
      value: count,
      icon: [ClockIcon, CheckCircleIcon, XCircleIcon, TagIcon][index % 4],
      color: [
        "text-purple-600",
        "text-green-600",
        "text-red-600",
        "text-blue-600",
      ][index % 4],
      bgColor: ["bg-purple-50", "bg-green-50", "bg-red-50", "bg-blue-50"][
        index % 4
      ],
    })),
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgency Level Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mức độ khẩn cấp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgencyCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} rounded-lg p-6 border border-gray-100`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                      {card.count}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{card.trend}</p>
                  </div>
                  {/* <div className={`p-3 rounded-full ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview - Real Data */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status Overview (Real Data)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.byStatus).map(([status, count], index) => {
              const colors = [
                {
                  bg: "bg-blue-50",
                  border: "border-blue-100",
                  text: "text-blue-600",
                  dot: "bg-blue-500",
                },
                {
                  bg: "bg-yellow-50",
                  border: "border-yellow-100",
                  text: "text-yellow-600",
                  dot: "bg-yellow-500",
                },
                {
                  bg: "bg-purple-50",
                  border: "border-purple-100",
                  text: "text-purple-600",
                  dot: "bg-purple-500",
                },
                {
                  bg: "bg-green-50",
                  border: "border-green-100",
                  text: "text-green-600",
                  dot: "bg-green-500",
                },
                {
                  bg: "bg-red-50",
                  border: "border-red-100",
                  text: "text-red-600",
                  dot: "bg-red-500",
                },
                {
                  bg: "bg-gray-50",
                  border: "border-gray-100",
                  text: "text-gray-600",
                  dot: "bg-gray-500",
                },
              ];
              const colorScheme = colors[index % colors.length];

              return (
                <div
                  key={status}
                  className={`${colorScheme.bg} rounded-lg p-6 border ${colorScheme.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Status: {status}
                      </p>
                      <p
                        className={`text-3xl font-bold ${colorScheme.text} mt-2`}
                      >
                        {count}
                      </p>
                      <div className="flex items-center mt-2">
                        <div
                          className={`w-2 h-2 rounded-full ${colorScheme.dot} mr-2`}
                        ></div>
                        <p className="text-sm text-gray-500">{count} tickets</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Overall Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Overall Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overallStats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-6 border border-gray-100`}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-md ${stat.color} bg-white`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Archived Tickets Modal Component
const ArchivedTicketsModal = ({
  isOpen,
  onClose,
  tickets,
  onViewTicket,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter tickets by search term
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toString().includes(searchTerm) ||
      ticket.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <ArchiveBoxIcon className="h-7 w-7 text-white mr-3" />
            <div>
              <h2 className="text-xl font-bold text-white">
                Kho lưu trữ Ticket
              </h2>
              <p className="text-slate-200 text-sm mt-1">
                Danh sách các ticket đã được lưu trữ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-slate-600 p-2 rounded-lg transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, tiêu đề, hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <TagIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Tổng số:{" "}
              <span className="font-semibold">{filteredTickets.length}</span>{" "}
              ticket đã lưu trữ
            </p>
          </div>
        </div>

        {/* Tickets List */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] px-6 py-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <ArchiveBoxIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                {searchTerm ? "Không tìm thấy ticket nào" : "Kho lưu trữ trống"}
              </h3>
              <p className="text-slate-500">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Chưa có ticket nào được lưu trữ"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    onViewTicket(ticket);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
                          #{ticket.id}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          <ArchiveBoxIcon className="h-3 w-3 mr-1" />
                          Đã lưu trữ
                        </span>
                        {ticket.urgencyLevel > 0 && (
                          <div className="flex items-center">
                            {[...Array(ticket.urgencyLevel)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className="h-3 w-3 text-yellow-400"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base mb-1">
                        {ticket.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {ticket.customer?.name || "N/A"}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        {ticket.category?.name && (
                          <span className="flex items-center">
                            <TagIcon className="h-4 w-4 mr-1" />
                            {ticket.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewTicket(ticket);
                        onClose();
                      }}
                      className="ml-4 p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;
