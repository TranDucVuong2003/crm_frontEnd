import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../../Service/ApiService';
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
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import TicketForm from './TicketForm';
import ViewAllTicketsModal from './ViewAllTicketsModal';
import TicketDetailModal from './TicketDetailModal';
import PriorityTicketCard from './PriorityTicketCard';


const Helpdesk = () => {

    const navigate = useNavigate();

  // Helper function để sanitize và render HTML content
  const renderHTMLContent = (htmlString) => {
    if (!htmlString) return 'Không có mô tả';
    
    // Basic HTML sanitization - loại bỏ các tag nguy hiểm
    let sanitized = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Loại bỏ event handlers
      .replace(/javascript:/gi, ''); // Loại bỏ javascript: URLs
    
    // Loại bỏ HTML tags để hiển thị text thuần cho preview
    return sanitized.replace(/<[^>]*>/g, '').trim();
  };

  // ==================== STATES ====================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [defaultPriorityFilter, setDefaultPriorityFilter] = useState('all');
  // Filter state
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unresolved', 'medium', 'high', 'closed'
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==================== API CALLS ====================
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getAllTickets();
      
      // Handle different API response structures
      const ticketsData = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : [];

      setTickets(ticketsData);
      console.log('Fetched tickets:', ticketsData);
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
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
    { id: 'new', name: 'Mới', color: 'bg-blue-100 text-blue-800' },
    { id: 'open', name: 'Đang mở', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'in_progress', name: 'Đang xử lý', color: 'bg-orange-100 text-orange-800' },
    { id: 'pending', name: 'Chờ phản hồi', color: 'bg-purple-100 text-purple-800' },
    { id: 'escalated', name: 'Leo thang', color: 'bg-red-100 text-red-800' },
    { id: 'resolved', name: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
    { id: 'closed', name: 'Đã đóng', color: 'bg-gray-100 text-gray-800' }
  ];

  const PRIORITIES = [
    { id: 'low', name: 'Thấp', color: 'bg-green-100 text-green-800', sla: 72 },
    { id: 'medium', name: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', sla: 48 },
    { id: 'high', name: 'Cao', color: 'bg-orange-100 text-orange-800', sla: 24 },
    { id: 'critical', name: 'Khẩn cấp', color: 'bg-red-100 text-red-800', sla: 4 }
  ];

  const CATEGORIES = [
    { id: 'technical', name: 'Kỹ thuật', icon: '🔧' },
    { id: 'bug', name: 'Lỗi hệ thống', icon: '🐛' },
    { id: 'feature_request', name: 'Yêu cầu tính năng', icon: '💡' },
    { id: 'account', name: 'Tài khoản', icon: '👤' },
    { id: 'billing', name: 'Thanh toán', icon: '💳' },
    { id: 'general', name: 'Tổng quát', icon: '📋' }
  ];

  const AGENTS = [
    { id: 1, name: 'Trần Thị B', email: 'tranthib@company.com', department: 'Technical' },
    { id: 2, name: 'Phạm Văn D', email: 'phamvand@company.com', department: 'Product' },
    { id: 3, name: 'Vũ Văn F', email: 'vuvanf@company.com', department: 'Technical' }
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
  const getPriorityConfig = (priority) => {
    // Chỉ sử dụng dữ liệu thật từ database - hiển thị nguyên bản priority từ API
    return {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      label: priority || 'Không xác định'
    };
  };

  const getStatusConfig = (status) => {
    // Chỉ sử dụng dữ liệu thật từ database - hiển thị nguyên bản status từ API
    return {
      color: 'bg-gray-100 text-gray-800',
      label: status || 'Không xác định'
    };
  };

  const priorityConfig = getPriorityConfig(ticket.priority);
  const statusConfig = getStatusConfig(ticket.status);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
            {/* <div className={`w-2 h-2 rounded-full mr-1 ${statusConfig.color === 'bg-green-100 text-green-800' ? 'bg-green-500' : 
              statusConfig.color === 'bg-yellow-100 text-yellow-800' ? 'bg-yellow-500' :
              statusConfig.color === 'bg-blue-100 text-blue-800' ? 'bg-blue-500' :
              statusConfig.color === 'bg-purple-100 text-purple-800' ? 'bg-purple-500' :
              statusConfig.color === 'bg-red-100 text-red-800' ? 'bg-red-500' : 'bg-gray-500'}`}></div> */}
            {/* {statusConfig.label} */}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
            {priorityConfig.label}
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
          {ticket.stars > 0 && (
            <div className="flex items-center">
              <StarIconSolid className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-slate-600 ml-1">{ticket.stars}</span>
            </div>
          )}
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// Status change function now handled inside component

  const handleAssignTicket = (ticketId, agentId) => {
    const agent = AGENTS.find(a => a.id === parseInt(agentId));
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { 
            ...ticket, 
            assignedTo: agent,
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const handlePriorityChange = (ticketId, newPriority) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { 
            ...ticket, 
            priority: newPriority,
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const handleViewAllTickets = (priority = 'all') => {
    setDefaultPriorityFilter(priority);
    setIsViewAllModalOpen(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Function to get filtered tickets based on active filter
  const getFilteredTickets = () => {
    switch (activeFilter) {
      case 'unresolved':
        return tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
      case 'medium':
        return tickets.filter(t => t.priority === 'medium');
      case 'high':
        return tickets.filter(t => t.priority === 'high');
      case 'closed':
        return tickets.filter(t => t.status === 'closed' || t.status === 'resolved');
      case 'all':
      default:
        return tickets;
    }
  };

  // Get filter label for display
  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'unresolved':
        return 'Chưa giải quyết';
      case 'medium':
        return 'Mức trung bình';
      case 'high':
        return 'Ưu tiên cao';
      case 'closed':
        return 'Đã đóng';
      case 'all':
      default:
        return 'Tất cả phiếu';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Helper functions for statistics
  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTicketsByPriority = (priority) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  const getTicketsResolvedToday = () => {
    const today = new Date().toDateString();
    return tickets.filter(ticket => 
      ticket.status === 'closed' && 
      new Date(ticket.updatedAt).toDateString() === today
    ).length;
  };

  const getTicketsResolvedLastWeek = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return tickets.filter(ticket => 
      ticket.status === 'closed' && 
      new Date(ticket.updatedAt) >= lastWeek
    ).length;
  };

  const getAverageRating = () => {
    const ratedTickets = tickets.filter(ticket => ticket.stars && ticket.stars > 0);
    if (ratedTickets.length === 0) return 0;
    const totalStars = ratedTickets.reduce((sum, ticket) => sum + ticket.stars, 0);
    return totalStars / ratedTickets.length;
  };

  const getTicketsWithRating = () => {
    return tickets.filter(ticket => ticket.stars && ticket.stars > 0);
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? { 
            ...ticket, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString() }),
            ...(newStatus === 'closed' && { closedAt: new Date().toISOString() })
          }
        : ticket
    );
    
    setTickets(updatedTickets);
    
    // Update selectedTicket if it's the one being changed
    if (selectedTicket && selectedTicket.id === ticketId) {
      const updatedSelectedTicket = updatedTickets.find(t => t.id === ticketId);
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
                <p className="text-slate-600 mt-2 text-sm lg:text-base">Quản lý và theo dõi phiếu hỗ trợ khách hàng</p>
              </div>
              <button
                onClick={() => navigate('/helpdesk/create')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo phiếu hỗ trợ mới
          </button>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phiếu Hỗ Trợ Của Tôi */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center">
                <TagIcon className="h-6 w-6 mr-3" />
                Phiếu Hỗ Trợ Của Tôi
              </h2>
              <p className="mt-2 text-blue-100">Danh sách các phiếu hỗ trợ đang xử lý</p>
            </div>
            
            {/* Ticket Stats Row */}
            <div className="p-6 border-b border-slate-100">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chưa giải quyết (Unresolved) */}
                <button
                  onClick={() => handleFilterChange('unresolved')}
                  className={`bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                    activeFilter === 'unresolved' 
                      ? 'border-red-400 shadow-lg ring-2 ring-red-300' 
                      : 'border-red-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Chưa giải quyết</p>
                      <p className="text-2xl font-bold text-red-700">
                        {tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length}
                      </p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </button>
                
                {/* Medium Priority */}
                <button
                  onClick={() => handleFilterChange('medium')}
                  className={`bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                    activeFilter === 'medium' 
                      ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-300' 
                      : 'border-yellow-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Mức trung bình</p>
                      <p className="text-2xl font-bold text-yellow-700">{getTicketsByPriority('medium').length}</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <MinusIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </button>
                
                {/* High Priority */}
                <button
                  onClick={() => handleFilterChange('high')}
                  className={`bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                    activeFilter === 'high' 
                      ? 'border-orange-400 shadow-lg ring-2 ring-orange-300' 
                      : 'border-orange-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Ưu tiên cao</p>
                      <p className="text-2xl font-bold text-orange-700">{getTicketsByPriority('high').length}</p>
                    </div>
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </button>
                
                {/* Đã đóng (Closed) */}
                <button
                  onClick={() => handleFilterChange('closed')}
                  className={`bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border transition-all duration-200 text-left hover:scale-105 cursor-pointer ${
                    activeFilter === 'closed' 
                      ? 'border-green-400 shadow-lg ring-2 ring-green-300' 
                      : 'border-green-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Đã đóng</p>
                      <p className="text-2xl font-bold text-green-700">
                        {tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length}
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
                  <h3 className="text-lg font-semibold text-slate-700">{getFilterLabel()}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {getFilteredTickets().length} phiếu
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Items per page selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Hiển thị:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => handleFilterChange('all')}
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
                  Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getFilteredTickets().length)} của {getFilteredTickets().length} phiếu
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
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300'
                          }`}
                        >
                          Trước
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = 
                              page === 1 || 
                              page === getTotalPages() || 
                              (page >= currentPage - 1 && page <= currentPage + 1);
                            
                            const showEllipsis = 
                              (page === currentPage - 2 && currentPage > 3) ||
                              (page === currentPage + 2 && currentPage < getTotalPages() - 2);

                            if (showEllipsis) {
                              return (
                                <span key={page} className="px-2 text-slate-400">
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
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300'
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
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-300'
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
                    {tickets.length === 0 ? 'Chưa có phiếu hỗ trợ nào' : 'Không có phiếu nào phù hợp với bộ lọc'}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {tickets.length === 0 ? 'Bắt đầu bằng cách tạo phiếu hỗ trợ đầu tiên' : 'Thử chọn bộ lọc khác'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hiệu Suất */}
        <div className="lg:col-span-4">
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 mr-3" />
                  Hiệu Suất Của Tôi
                </h2>
                <p className="mt-2 text-emerald-100">Thống kê và đánh giá</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Today Performance */}
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Hôm nay</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {getTicketsResolvedToday()}
                    </div>
                    <p className="text-sm text-slate-600">Phiếu hỗ trợ đã đóng</p>
                  </div>
                </div>

                {/* Weekly Stats */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Trung bình trong 7 ngày qua</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Giải quyết/ngày</span>
                      <span className="font-semibold text-slate-800">{Math.round(getTicketsResolvedLastWeek() / 7 * 10) / 10}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Target */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Mục tiêu hàng ngày</h4>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-orange-700">Tiến độ</span>
                      <span className="font-semibold text-orange-800">{Math.min(Math.round((getTicketsResolvedToday() / 5) * 100), 100)}%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((getTicketsResolvedToday() / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">Mục tiêu: 5 phiếu/ngày</p>
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Đánh giá khách hàng</h4>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-5 w-5 ${
                              star <= getAverageRating() ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-bold text-slate-700">
                        {getAverageRating().toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-center text-amber-700">
                      Dựa trên {getTicketsWithRating().length} đánh giá
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
                <h3 className="font-bold">⚡ Thao tác nhanh</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={handleViewAllTickets}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-slate-700">Xem tất cả phiếu</span>
                  <EyeIcon className="h-4 w-4 text-slate-500" />
                </button>
                
                <button
                  onClick={() => navigate('/helpdesk/create')}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-slate-700">Tạo phiếu mới</span>
                  <PlusIcon className="h-4 w-4 text-slate-500" />
                </button>
              </div>
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
              setTickets(tickets.map(t => 
                t.id === selectedTicket.id 
                  ? { ...t, ...ticketData, updatedAt: new Date().toISOString() }
                  : t
              ));
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
          defaultPriorityFilter={defaultPriorityFilter}
          statuses={STATUSES}
          priorities={PRIORITIES}
          categories={CATEGORIES}
          agents={AGENTS}
          onStatusChange={handleStatusChange}
          onAssignTicket={handleAssignTicket}
          onPriorityChange={handlePriorityChange}
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
        </>
      )}
    </div>
  );
};

// Helpdesk Overview Component
const HelpdeskOverview = ({ tickets }) => {
  // Tạo stats dựa trên dữ liệu thực từ database
  const uniqueStatuses = [...new Set(tickets.map(t => t.status).filter(Boolean))];
  const uniquePriorities = [...new Set(tickets.map(t => t.priority).filter(Boolean))];
  
  const stats = {
    total: tickets.length,
    // Chỉ tính dựa trên dữ liệu thật từ database
    byStatus: uniqueStatuses.reduce((acc, status) => {
      acc[status] = tickets.filter(t => t.status === status).length;
      return acc;
    }, {}),
    byPriority: uniquePriorities.reduce((acc, priority) => {
      acc[priority] = tickets.filter(t => t.priority === priority).length;
      return acc;
    }, {}),
  };

  // Tạo priorityCards dựa trên dữ liệu thật từ database
  const priorityCards = Object.entries(stats.byPriority).map(([priority, count], index) => ({
    title: `Priority: ${priority}`,
    count: count,
    color: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][index % 4],
    textColor: ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'][index % 4],
    bgColor: ['bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-green-50'][index % 4],
    icon: [ExclamationTriangleIcon, ArrowTrendingUpIcon, MinusIcon, ArrowTrendingDownIcon][index % 4],
    trend: `${count} tickets`
  }));

  // Tạo overallStats dựa trên dữ liệu thật từ database
  const overallStats = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: TagIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    ...Object.entries(stats.byStatus).map(([status, count], index) => ({
      title: `Status: ${status}`,
      value: count,
      icon: [ClockIcon, CheckCircleIcon, XCircleIcon, TagIcon][index % 4],
      color: ['text-purple-600', 'text-green-600', 'text-red-600', 'text-blue-600'][index % 4],
      bgColor: ['bg-purple-50', 'bg-green-50', 'bg-red-50', 'bg-blue-50'][index % 4]
    }))
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Priority Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityCards.map((card, index) => (
              <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.count}</p>
                    <p className="text-sm text-gray-500 mt-1">vs last week {card.trend}</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Overview (Real Data)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.byStatus).map(([status, count], index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
                { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-500' },
                { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
                { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', dot: 'bg-green-500' },
                { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', dot: 'bg-red-500' },
                { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <div key={status} className={`${colorScheme.bg} rounded-lg p-6 border ${colorScheme.border}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status: {status}</p>
                      <p className={`text-3xl font-bold ${colorScheme.text} mt-2`}>{count}</p>
                      <div className="flex items-center mt-2">
                        <div className={`w-2 h-2 rounded-full ${colorScheme.dot} mr-2`}></div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overallStats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-100`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-md ${stat.color} bg-white`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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


export default Helpdesk;
