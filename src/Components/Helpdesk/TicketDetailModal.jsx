import React, { useState, useEffect } from 'react';
import { updateTicketStatus, getTicketLogsByTicket, createTicketLog } from '../../Service/ApiService';
import { useAuth } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  PencilIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const TicketDetailModal = ({ isOpen, onClose, ticket, onStatusChange, onRefresh }) => {
  // Lấy thông tin user đang đăng nhập từ AuthContext
  const { user } = useAuth();
  
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(ticket?.comments || []);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);

  // Helper function để sanitize và render HTML content
  const renderHTMLContent = (htmlString) => {
    if (!htmlString) return '<p class="text-gray-500 italic">Không có mô tả</p>';
    
    // Basic HTML sanitization - loại bỏ các tag nguy hiểm
    let sanitized = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Loại bỏ event handlers
      .replace(/javascript:/gi, ''); // Loại bỏ javascript: URLs
    
    // Nếu không phải HTML, wrap trong thẻ p
    if (!sanitized.includes('<') && !sanitized.includes('>')) {
      return `<p>${sanitized}</p>`;
    }
    
    return sanitized;
  };

  const getPriorityConfig = (priority) => {
    const priorityLower = priority?.toLowerCase() || 'low';
    const configs = {
      low: { 
        icon: <ArrowPathIcon className="h-4 w-4" />, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        label: 'Thấp' 
      },
      medium: { 
        icon: <ClockIcon className="h-4 w-4" />, 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        label: 'Trung bình' 
      },
      high: { 
        icon: <ExclamationTriangleIcon className="h-4 w-4" />, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        label: 'Cao' 
      },
      critical: { 
        icon: <ExclamationTriangleIcon className="h-4 w-4" />, 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        label: 'Khẩn cấp' 
      }
    };
    return configs[priorityLower] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || 'new';
    const configs = {
      new: { 
        icon: <TagIcon className="h-4 w-4" />, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        label: 'Mới' 
      },
      open: { 
        icon: <ClockIcon className="h-4 w-4" />, 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        label: 'Đang xử lý' 
      },
      in_progress: { 
        icon: <ArrowPathIcon className="h-4 w-4" />, 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        label: 'Đang thực hiện' 
      },
      pending: { 
        icon: <ClockIcon className="h-4 w-4" />, 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100',
        label: 'Chờ xử lý' 
      },
      resolved: { 
        icon: <CheckCircleIcon className="h-4 w-4" />, 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        label: 'Đã giải quyết' 
      },
      closed: { 
        icon: <XCircleIcon className="h-4 w-4" />, 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100',
        label: 'Đã đóng' 
      },
      escalated: { 
        icon: <ExclamationTriangleIcon className="h-4 w-4" />, 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        label: 'Đã leo thang' 
      },
      // Fallback cho các status không xác định từ API
      hello: {
        icon: <TagIcon className="h-4 w-4" />, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        label: status || 'Không xác định'
      }
    };
    return configs[statusLower] || configs.hello;
  };

  // const getCategoryLabel = (category) => {
  //   const labels = {
  //     technical: 'Kỹ thuật',
  //     bug: 'Lỗi',
  //     feature_request: 'Yêu cầu tính năng',
  //     account: 'Tài khoản',
  //     billing: 'Thanh toán',
  //     general: 'Tổng quát'
  //   };
  //   return labels[category] || category;
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load ticket logs khi modal mở
  useEffect(() => {
    if (isOpen && ticket?.id) {
      loadTicketLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ticket?.id]);

  const loadTicketLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const response = await getTicketLogsByTicket(ticket.id);
      console.log('Ticket logs response:', response.data);
      
      // Chuyển ticket logs thành comments
      const logsAsComments = (response.data || []).map(log => ({
        id: log.id,
        author: log.user?.name || 'Unknown User',
        content: log.content,
        createdAt: log.createdAt,
        type: 'api', // Đánh dấu là comment từ API
        user: log.user
      }));
      
      // Merge với comments hiện tại và sort theo thời gian
      const allComments = [...logsAsComments, ...comments.filter(c => c.type !== 'api')]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setComments(allComments);
    } catch (error) {
      console.error('Error loading ticket logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsCreatingComment(true);
      
      // Tạo comment mới với API createTicketLog
      const logData = {
        ticketId: ticket.id,
        userId: user?.id ? parseInt(user.id) : null, // Lấy ID từ user đang đăng nhập
        content: newComment.trim()
      };

      console.log('Creating ticket log:', logData);
      console.log('Current user info:', { id: user?.id, name: user?.name, position: user?.position });
      const response = await createTicketLog(logData);
      console.log('Ticket log created:', response.data);

      // Reset form
      setNewComment('');
      
      // Reload comments để hiển thị comment mới
      await loadTicketLogs();

    } catch (error) {
      console.error('Error creating comment:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi thêm bình luận.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsCreatingComment(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Vui lòng chọn trạng thái mới.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      
      // Call API to update status
      const statusData = {
        status: selectedStatus
      };
      console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', statusData);
      await updateTicketStatus(ticket.id, statusData);
      
      // Show success message
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật trạng thái ticket thành công.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Close modal after success message
        onClose();
      });
      
      // Update ticket object locally to reflect changes immediately
      ticket.status = selectedStatus;
      ticket.updatedAt = new Date().toISOString();
      
      // Call parent callback if exists
      if (onStatusChange) {
        onStatusChange(ticket.id, selectedStatus);
      }
      
      // Refresh data if callback provided
      if (onRefresh) {
        await onRefresh();
      }
      
      // Reset selected status
      setSelectedStatus(null);
      
    } catch (error) {
      console.error('Error updating ticket status:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi cập nhật trạng thái.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderStars = (stars) => {
    const starElements = [];
    for (let i = 1; i <= 5; i++) {
      starElements.push(
        <span key={i} className={`${i <= stars ? 'text-yellow-500' : 'text-gray-300'}`}>
          {i <= stars ? (
            <StarIconSolid className="h-4 w-4" />
          ) : (
            <StarIcon className="h-4 w-4" />
          )}
        </span>
      );
    }
    return starElements;
  };

  const getStarsLabel = (stars) => {
    const labels = {
      1: 'Bình thường',
      2: 'Quan trọng',
      3: 'Khẩn cấp',
      4: 'Rất khẩn cấp',
      5: 'Cực kỳ khẩn cấp'
    };
    return labels[stars] || 'Bình thường';
  };

  // Early return nếu modal không mở hoặc không có ticket
  if (!isOpen || !ticket) return null;

  const priorityConfig = getPriorityConfig(ticket.priority);
  const statusConfig = getStatusConfig(ticket.status);

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-lg shadow-xl max-w-[80vw] w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết Ticket - {ticket.id}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {ticket.title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={() => {
                onClose();
                navigate(`/helpdesk/${ticket.id}`);
              }}
              className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <PencilIcon className="h-5 w-5" />
            </button> */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Info (1/5 width) */}
            <div className="lg:col-span-1 space-y-4">
              {/* Priority & Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Trạng thái & Ưu tiên</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái</label>
                    <div className={`mt-1 inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Độ ưu tiên</label>
                    <div className={`mt-1 inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                      {priorityConfig.icon}
                      <span className="ml-1">{priorityConfig.label}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Danh mục</label>
                    <p className="mt-1 text-sm text-gray-900">{ticket.category?.name || 'Chưa phân loại'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mức độ khẩn cấp</label>
                    <div className="mt-1 flex items-center space-x-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(ticket.urgencyLevel || 1)}
                      </div>
                      <span className="text-xs text-gray-600 ml-2">
                        {ticket.urgencyLevel || 1} sao - {getStarsLabel(ticket.urgencyLevel || 1)}
                      </span>
                    </div>
                  </div>
                  {ticket.slaBreached && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-800 font-medium">⚠️ SLA đã bị vi phạm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Tên</label>
                    <p className="text-sm text-gray-900">{ticket.customer?.name || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{ticket.customer?.email || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Điện thoại</label>
                    <p className="text-sm text-gray-900">{ticket.customer?.phoneNumber || 'Không có thông tin'}</p>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Phân công</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Được giao cho</label>
                    <p className="text-sm text-gray-900">
                      {ticket.assignedTo?.name || 'Chưa phân công'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Thời gian
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Tạo lúc</label>
                    <p className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Cập nhật lần cuối</label>
                    <p className="text-sm text-gray-900">{formatDate(ticket.updatedAt)}</p>
                  </div>
                  {ticket.dueDate && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Hạn xử lý</label>
                      <p className="text-sm text-gray-900">{formatDate(ticket.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content - 2/5 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin ticket</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                    <div 
                      className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border border-gray-200 min-h-[60px] 
                                [&_p]:mb-2 [&_p]:leading-relaxed [&_strong]:font-semibold [&_em]:italic 
                                [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2
                                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal
                                [&_li]:mb-1 [&_br]:block [&_br]:mb-1"
                      dangerouslySetInnerHTML={{ __html: renderHTMLContent(ticket.description) }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                    {ticket.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cập nhật trạng thái</h3>
                
                <div className="space-y-4">
                  {/* Current Status */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trạng thái hiện tại:</label>
                    <div className={`mt-1 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.icon}
                      <span className="ml-2">{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* New Status Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Chọn trạng thái mới:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['open', 'in_progress', 'pending', 'resolved'].map((status) => {
                        const config = getStatusConfig(status);
                        const isSelected = selectedStatus === status;
                        const isCurrent = ticket.status?.toLowerCase() === status;
                        
                        return (
                          <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            disabled={isCurrent}
                            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isCurrent
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : isSelected 
                                  ? `${config.bgColor} ${config.color} ring-2 ring-blue-500` 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {config.icon}
                            <span className="ml-1">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Button */}
                  {selectedStatus && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Thay đổi từ <strong>{statusConfig.label}</strong> thành <strong>{getStatusConfig(selectedStatus).label}</strong>
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedStatus(null)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleUpdateStatus}
                            disabled={isUpdatingStatus}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            {isUpdatingStatus && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {isUpdatingStatus ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Comments (2/5 width) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Comments Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Bình luận ({comments.length})
                  </h3>
                  <button
                    onClick={loadTicketLogs}
                    disabled={isLoadingLogs}
                    className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                  >
                    {isLoadingLogs ? 'Đang tải...' : 'Làm mới'}
                  </button>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600">Đang tải bình luận...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Chưa có bình luận nào
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className={`rounded-lg p-3 ${
                        comment.type === 'api' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                            {comment.type === 'api' && comment.user?.position && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {comment.user.position}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        placeholder="Thêm bình luận... (Enter để gửi, Shift+Enter để xuống dòng)"
                        rows={2}
                        disabled={isCreatingComment}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isCreatingComment}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {isCreatingComment && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isCreatingComment ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;