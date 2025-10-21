// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllTickets } from '../../Service/ApiService';
// import {
//   PlusIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   TagIcon,
//   ChevronDownIcon,
//   EyeIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   MinusIcon,
//   StarIcon,
//   UserIcon
// } from '@heroicons/react/24/outline';
// import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
// import TicketForm from './TicketForm';
// import ViewAllTicketsModal from './ViewAllTicketsModal';
// import TicketDetailModal from './TicketDetailModal';
// import PriorityTicketCard from './PriorityTicketCard';


// const Helpdesk = () => {

//     const navigate = useNavigate();

//   // ==================== STATES ====================
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//       id: 'TCK-001',
//       title: 'Không thể đăng nhập vào hệ thống',
//       description: 'Khách hàng báo cáo không thể đăng nhập sau khi đổi mật khẩu',
//       customer: {
//         id: 1,
//         name: 'Nguyễn Văn A',
//         email: 'nguyenvana@email.com',
//         phone: '0901234567'
//       },
//       priority: 'high',
//       status: 'open',
//       category: 'technical',
//       stars: 4,
//       assignedTo: {
//         id: 1,
//         name: 'Trần Thị B',
//         email: 'tranthib@company.com'
//       },
//       createdAt: '2025-10-06T09:00:00Z',
//       updatedAt: '2025-10-06T14:30:00Z',
//       dueDate: '2025-10-08T17:00:00Z',
//       slaBreached: false,
//       tags: ['login', 'password', 'urgent'],
//       attachments: [],
//       comments: [
//         {
//           id: 1,
//           author: 'Trần Thị B',
//           content: 'Đã liên hệ khách hàng và hướng dẫn reset mật khẩu',
//           createdAt: '2025-10-06T14:30:00Z',
//           type: 'internal'
//         }
//       ]
//     },
//     {
//       id: 'TCK-002', 
//       title: 'Yêu cầu thêm tính năng báo cáo',
//       description: 'Khách hàng muốn thêm tính năng xuất báo cáo theo tháng',
//       customer: {
//         id: 2,
//         name: 'Lê Văn C',
//         email: 'levanc@email.com', 
//         phone: '0907654321'
//       },
//       priority: 'medium',
//       status: 'in_progress',
//       category: 'feature_request',
//       stars: 2,
//       assignedTo: {
//         id: 2,
//         name: 'Phạm Văn D',
//         email: 'phamvand@company.com'
//       },
//       createdAt: '2025-10-05T14:00:00Z',
//       updatedAt: '2025-10-06T16:00:00Z',
//       dueDate: '2025-10-12T17:00:00Z',
//       slaBreached: false,
//       tags: ['feature', 'report', 'enhancement'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-003',
//       title: 'Lỗi hiển thị dữ liệu khách hàng',
//       description: 'Danh sách khách hàng không load được, hiển thị màn hình trống',
//       customer: {
//         id: 3,
//         name: 'Hoàng Thị E',
//         email: 'hoangthie@email.com',
//         phone: '0909876543'
//       },
//       priority: 'critical',
//       status: 'escalated',
//       category: 'bug',
//       stars: 5,
//       assignedTo: {
//         id: 3,
//         name: 'Vũ Văn F',
//         email: 'vuvanf@company.com'
//       },
//       createdAt: '2025-10-04T08:30:00Z',
//       updatedAt: '2025-10-06T10:15:00Z',
//       dueDate: '2025-10-06T20:00:00Z',
//       slaBreached: true,
//       tags: ['bug', 'critical', 'data'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-004',
//       title: 'Sự cố máy chủ database',
//       description: 'Database không phản hồi, ảnh hưởng đến toàn bộ hệ thống',
//       customer: {
//         id: 4,
//         name: 'Phạm Văn G',
//         email: 'phamvang@email.com',
//         phone: '0908765432'
//       },
//       priority: 'high',
//       status: 'new',
//       category: 'technical',
//       stars: 4,
//       assignedTo: {
//         id: 1,
//         name: 'Trần Thị B',
//         email: 'tranthib@company.com'
//       },
//       createdAt: '2025-10-06T15:00:00Z',
//       updatedAt: '2025-10-06T15:00:00Z',
//       dueDate: '2025-10-07T15:00:00Z',
//       slaBreached: false,
//       tags: ['database', 'server', 'critical-system'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-005',
//       title: 'Cập nhật thông tin tài khoản',
//       description: 'Khách hàng yêu cầu thay đổi thông tin liên hệ và quyền truy cập',
//       customer: {
//         id: 5,
//         name: 'Trần Thị H',
//         email: 'tranthih@email.com',
//         phone: '0907654321'
//       },
//       priority: 'medium',
//       status: 'open',
//       category: 'account',
//       stars: 2,
//       assignedTo: {
//         id: 2,
//         name: 'Phạm Văn D',
//         email: 'phamvand@company.com'
//       },
//       createdAt: '2025-10-05T11:00:00Z',
//       updatedAt: '2025-10-05T11:00:00Z',
//       dueDate: '2025-10-07T17:00:00Z',
//       slaBreached: false,
//       tags: ['account', 'profile', 'access'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-006',
//       title: 'Vấn đề thanh toán',
//       description: 'Giao dịch thanh toán không thành công, cần kiểm tra và xử lý',
//       customer: {
//         id: 6,
//         name: 'Nguyễn Văn I',
//         email: 'nguyenvani@email.com',
//         phone: '0906543210'
//       },
//       priority: 'medium',
//       status: 'pending',
//       category: 'billing',
//       stars: 3,
//       assignedTo: {
//         id: 3,
//         name: 'Vũ Văn F',
//         email: 'vuvanf@company.com'
//       },
//       createdAt: '2025-10-05T16:30:00Z',
//       updatedAt: '2025-10-06T09:00:00Z',
//       dueDate: '2025-10-07T16:30:00Z',
//       slaBreached: false,
//       tags: ['payment', 'transaction', 'billing'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-007',
//       title: 'Câu hỏi về tính năng',
//       description: 'Khách hàng cần tư vấn về cách sử dụng các tính năng mới',
//       customer: {
//         id: 7,
//         name: 'Lê Thị J',
//         email: 'lethij@email.com',
//         phone: '0905432109'
//       },
//       priority: 'low',
//       status: 'new',
//       category: 'general',
//       stars: 1,
//       assignedTo: {
//         id: 1,
//         name: 'Trần Thị B',
//         email: 'tranthib@company.com'
//       },
//       createdAt: '2025-10-06T13:00:00Z',
//       updatedAt: '2025-10-06T13:00:00Z',
//       dueDate: '2025-10-09T13:00:00Z',
//       slaBreached: false,
//       tags: ['question', 'features', 'consultation'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-008',
//       title: 'Yêu cầu hướng dẫn sử dụng',
//       description: 'Khách hàng mới cần hướng dẫn chi tiết về cách sử dụng hệ thống',
//       customer: {
//         id: 8,
//         name: 'Hoàng Văn K',
//         email: 'hoangvank@email.com',
//         phone: '0904321098'
//       },
//       priority: 'low',
//       status: 'open',
//       category: 'general',
//       stars: 1,
//       assignedTo: {
//         id: 2,
//         name: 'Phạm Văn D',
//         email: 'phamvand@company.com'
//       },
//       createdAt: '2025-10-05T08:00:00Z',
//       updatedAt: '2025-10-05T08:00:00Z',
//       dueDate: '2025-10-08T08:00:00Z',
//       slaBreached: false,
//       tags: ['tutorial', 'guidance', 'new-user'],
//       attachments: [],
//       comments: []
//     },
//     {
//       id: 'TCK-009',
//       title: 'Góp ý cải tiến giao diện',
//       description: 'Khách hàng đề xuất cải tiến giao diện để dễ sử dụng hơn',
//       customer: {
//         id: 9,
//         name: 'Vũ Thị L',
//         email: 'vuthil@email.com',
//         phone: '0903210987'
//       },
//       priority: 'low',
//       status: 'open',
//       category: 'feature_request',
//       stars: 1,
//       assignedTo: {
//         id: 3,
//         name: 'Vũ Văn F',
//         email: 'vuvanf@company.com'
//       },
//       createdAt: '2025-10-04T10:00:00Z',
//       updatedAt: '2025-10-04T10:00:00Z',
//       dueDate: '2025-10-07T10:00:00Z',
//       slaBreached: false,
//       tags: ['ui', 'improvement', 'feedback'],
//       attachments: [],
//       comments: []
//     }
//   ]);

//   // Modal states
//   const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
//   const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
//   const [defaultPriorityFilter, setDefaultPriorityFilter] = useState('all');

//   // ==================== API CALLS ====================
//   useEffect(() => {
//     const fetchTickets = async () => {
//       try {
//         setLoading(true);
//         const response = await getAllTickets();
        
//         // Handle different API response structures
//         const ticketsData = Array.isArray(response.data?.data) 
//           ? response.data.data 
//           : Array.isArray(response.data) 
//           ? response.data 
//           : [];

//         setTickets(ticketsData);
//         console.log('Fetched tickets:', ticketsData);
        
//       } catch (error) {
//         console.error('Error fetching tickets:', error);
//         // Fallback to empty array if API fails
//         setTickets([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTickets();
//   }, []);

//   // ==================== CONSTANTS ====================
//   const STATUSES = [
//     { id: 'new', name: 'Mới', color: 'bg-blue-100 text-blue-800' },
//     { id: 'open', name: 'Đang mở', color: 'bg-yellow-100 text-yellow-800' },
//     { id: 'in_progress', name: 'Đang xử lý', color: 'bg-orange-100 text-orange-800' },
//     { id: 'pending', name: 'Chờ phản hồi', color: 'bg-purple-100 text-purple-800' },
//     { id: 'escalated', name: 'Leo thang', color: 'bg-red-100 text-red-800' },
//     { id: 'resolved', name: 'Đã giải quyết', color: 'bg-green-100 text-green-800' },
//     { id: 'closed', name: 'Đã đóng', color: 'bg-gray-100 text-gray-800' }
//   ];

//   const PRIORITIES = [
//     { id: 'low', name: 'Thấp', color: 'bg-green-100 text-green-800', sla: 72 },
//     { id: 'medium', name: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', sla: 48 },
//     { id: 'high', name: 'Cao', color: 'bg-orange-100 text-orange-800', sla: 24 },
//     { id: 'critical', name: 'Khẩn cấp', color: 'bg-red-100 text-red-800', sla: 4 }
//   ];

//   const CATEGORIES = [
//     { id: 'technical', name: 'Kỹ thuật', icon: '🔧' },
//     { id: 'bug', name: 'Lỗi hệ thống', icon: '🐛' },
//     { id: 'feature_request', name: 'Yêu cầu tính năng', icon: '💡' },
//     { id: 'account', name: 'Tài khoản', icon: '👤' },
//     { id: 'billing', name: 'Thanh toán', icon: '💳' },
//     { id: 'general', name: 'Tổng quát', icon: '📋' }
//   ];

//   const AGENTS = [
//     { id: 1, name: 'Trần Thị B', email: 'tranthib@company.com', department: 'Technical' },
//     { id: 2, name: 'Phạm Văn D', email: 'phamvand@company.com', department: 'Product' },
//     { id: 3, name: 'Vũ Văn F', email: 'vuvanf@company.com', department: 'Technical' }
//   ];

//   // ==================== EVENT HANDLERS ====================
//   const handleViewTicket = (ticket) => {
//     setSelectedTicket(ticket);
//     setIsTicketDetailModalOpen(true);
//   };

//   const handleEditTicket = (ticket) => {
//     setSelectedTicket(ticket);
//     setIsTicketModalOpen(true);
//   };

//   // const handleCreateTicket = () => {
//   //   setSelectedTicket(null);
//   //   setIsTicketModalOpen(true);
//   // };

// // Modern Ticket Card Component
// const ModernTicketCard = ({ ticket, onView, onStatusChange }) => {
//   const getPriorityConfig = (priority) => {
//     const configs = {
//       low: { color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', label: 'Thấp' },
//       medium: { color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Trung bình' },
//       high: { color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', label: 'Cao' },
//       critical: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', label: 'Khẩn cấp' }
//     };
//     return configs[priority] || configs.low;
//   };

//   const getStatusConfig = (status) => {
//     const configs = {
//       new: { color: 'bg-blue-100 text-blue-800', label: 'Mới' },
//       open: { color: 'bg-green-100 text-green-800', label: 'Mở' },
//       'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'Đang xử lý' },
//       resolved: { color: 'bg-purple-100 text-purple-800', label: 'Đã giải quyết' },
//       closed: { color: 'bg-gray-100 text-gray-800', label: 'Đã đóng' },
//       escalated: { color: 'bg-red-100 text-red-800', label: 'Đã leo thang' }
//     };
//     return configs[status] || configs.new;
//   };

//   const priorityConfig = getPriorityConfig(ticket.priority);
//   const statusConfig = getStatusConfig(ticket.status);

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div 
//       className="bg-gradient-to-r from-white to-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
//       onClick={() => onView(ticket)}
//     >
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex-1 min-w-0">
//           <h3 className="font-semibold text-slate-900 text-sm truncate mb-1">
//             {ticket.title}
//           </h3>
//           <p className="text-xs text-slate-600 line-clamp-2">
//             {ticket.description}
//           </p>
//         </div>
//         <div className="flex items-center space-x-2 ml-3">
//           <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
//             {priorityConfig.label}
//           </span>
//         </div>
//       </div>
      
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3 text-xs text-slate-500">
//           <span className="flex items-center">
//             <UserIcon className="h-3 w-3 mr-1" />
//             {ticket.customer?.name}
//           </span>
//           <span className="flex items-center">
//             <ClockIcon className="h-3 w-3 mr-1" />
//             {formatDate(ticket.createdAt)}
//           </span>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           {ticket.stars > 0 && (
//             <div className="flex items-center">
//               <StarIconSolid className="h-3 w-3 text-yellow-400" />
//               <span className="text-xs text-slate-600 ml-1">{ticket.stars}</span>
//             </div>
//           )}
//           <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
//             {statusConfig.label}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Status change function now handled inside component

//   const handleAssignTicket = (ticketId, agentId) => {
//     const agent = AGENTS.find(a => a.id === parseInt(agentId));
//     setTickets(tickets.map(ticket =>
//       ticket.id === ticketId
//         ? { 
//             ...ticket, 
//             assignedTo: agent,
//             updatedAt: new Date().toISOString()
//           }
//         : ticket
//     ));
//   };

//   const handlePriorityChange = (ticketId, newPriority) => {
//     setTickets(tickets.map(ticket =>
//       ticket.id === ticketId
//         ? { 
//             ...ticket, 
//             priority: newPriority,
//             updatedAt: new Date().toISOString()
//           }
//         : ticket
//     ));
//   };

//   const handleViewAllTickets = (priority = 'all') => {
//     setDefaultPriorityFilter(priority);
//     setIsViewAllModalOpen(true);
//   };

//   // Helper functions for statistics
//   const getTicketsByStatus = (status) => {
//     return tickets.filter(ticket => ticket.status === status);
//   };

//   const getTicketsByPriority = (priority) => {
//     return tickets.filter(ticket => ticket.priority === priority);
//   };

//   const getTicketsResolvedToday = () => {
//     const today = new Date().toDateString();
//     return tickets.filter(ticket => 
//       ticket.status === 'closed' && 
//       new Date(ticket.updatedAt).toDateString() === today
//     ).length;
//   };

//   const getTicketsResolvedLastWeek = () => {
//     const lastWeek = new Date();
//     lastWeek.setDate(lastWeek.getDate() - 7);
//     return tickets.filter(ticket => 
//       ticket.status === 'closed' && 
//       new Date(ticket.updatedAt) >= lastWeek
//     ).length;
//   };

//   const getAverageRating = () => {
//     const ratedTickets = tickets.filter(ticket => ticket.stars && ticket.stars > 0);
//     if (ratedTickets.length === 0) return 0;
//     const totalStars = ratedTickets.reduce((sum, ticket) => sum + ticket.stars, 0);
//     return totalStars / ratedTickets.length;
//   };

//   const getTicketsWithRating = () => {
//     return tickets.filter(ticket => ticket.stars && ticket.stars > 0);
//   };

//   const handleStatusChange = (ticketId, newStatus) => {
//     setTickets(tickets.map(ticket =>
//       ticket.id === ticketId
//         ? { 
//             ...ticket, 
//             status: newStatus, 
//             updatedAt: new Date().toISOString(),
//             ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString() }),
//             ...(newStatus === 'closed' && { closedAt: new Date().toISOString() })
//           }
//         : ticket
//     ));
//   };

//   return (
//     <div className="p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
//       {/* Modern Header */}
//       <div className="mb-8">
//         <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               📞 Helpdesk Dashboard
//             </h1>
//             <p className="text-slate-600 mt-2 text-sm lg:text-base">Quản lý và theo dõi phiếu hỗ trợ khách hàng</p>
//           </div>
//           <button
//             onClick={() => navigate('/helpdesk/create')}
//             className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//           >
//             <PlusIcon className="h-5 w-5 mr-2" />
//             Tạo phiếu hỗ trợ mới
//           </button>
//         </div>
//       </div>

//       {/* Main Layout: 2 Columns */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Left Column: Phiếu Hỗ Trợ Của Tôi */}
//         <div className="lg:col-span-8">
//           <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
//               <h2 className="text-xl font-bold flex items-center">
//                 <TagIcon className="h-6 w-6 mr-3" />
//                 Phiếu Hỗ Trợ Của Tôi
//               </h2>
//               <p className="mt-2 text-blue-100">Danh sách các phiếu hỗ trợ đang xử lý</p>
//             </div>
            
//             {/* Ticket Stats Row */}
//             <div className="p-6 border-b border-slate-100">
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-green-600 text-sm font-medium">Mở</p>
//                       <p className="text-2xl font-bold text-green-700">{getTicketsByStatus('open').length}</p>
//                     </div>
//                     <div className="bg-green-100 p-2 rounded-lg">
//                       <ClockIcon className="h-5 w-5 text-green-600" />
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-4 rounded-xl border border-blue-200">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-blue-600 text-sm font-medium">Đang xử lý</p>
//                       <p className="text-2xl font-bold text-blue-700">{getTicketsByStatus('in-progress').length}</p>
//                     </div>
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-orange-600 text-sm font-medium">Khẩn cấp</p>
//                       <p className="text-2xl font-bold text-orange-700">{getTicketsByPriority('critical').length}</p>
//                     </div>
//                     <div className="bg-orange-100 p-2 rounded-lg">
//                       <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-purple-600 text-sm font-medium">Đã đóng</p>
//                       <p className="text-2xl font-bold text-purple-700">{getTicketsByStatus('closed').length}</p>
//                     </div>
//                     <div className="bg-purple-100 p-2 rounded-lg">
//                       <CheckCircleIcon className="h-5 w-5 text-purple-600" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Tickets List */}
//             <div className="p-6">
//               {tickets.length > 0 ? (
//                 <div className="space-y-4">
//                   {tickets.slice(0, 5).map((ticket) => (
//                     <ModernTicketCard 
//                       key={ticket.id} 
//                       ticket={ticket} 
//                       onView={handleViewTicket}
//                       onStatusChange={handleStatusChange}
//                     />
//                   ))}
                  
//                   {tickets.length > 5 && (
//                     <div className="text-center pt-4">
//                       <button
//                         onClick={handleViewAllTickets}
//                         className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
//                       >
//                         Xem tất cả ({tickets.length} phiếu)
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <TagIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-slate-600 mb-2">Chưa có phiếu hỗ trợ nào</h3>
//                   <p className="text-slate-500 mb-4">Bắt đầu bằng cách tạo phiếu hỗ trợ đầu tiên</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Column: Hiệu Suất */}
//         <div className="lg:col-span-4">
//           <div className="space-y-6">
//             {/* Performance Overview */}
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//               <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
//                 <h2 className="text-xl font-bold flex items-center">
//                   <ArrowTrendingUpIcon className="h-6 w-6 mr-3" />
//                   Hiệu Suất Của Tôi
//                 </h2>
//                 <p className="mt-2 text-emerald-100">Thống kê và đánh giá</p>
//               </div>
              
//               <div className="p-6 space-y-6">
//                 {/* Today Performance */}
//                 <div className="text-center">
//                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
//                     <h3 className="text-lg font-semibold text-slate-700 mb-4">Hôm nay</h3>
//                     <div className="text-3xl font-bold text-blue-600 mb-2">
//                       {getTicketsResolvedToday()}
//                     </div>
//                     <p className="text-sm text-slate-600">Phiếu hỗ trợ đã đóng</p>
//                   </div>
//                 </div>

//                 {/* Weekly Stats */}
//                 <div>
//                   <h4 className="text-sm font-semibold text-slate-700 mb-3">Trung bình trong 7 ngày qua</h4>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-slate-600">Giải quyết/ngày</span>
//                       <span className="font-semibold text-slate-800">{Math.round(getTicketsResolvedLastWeek() / 7 * 10) / 10}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Daily Target */}
//                 <div>
//                   <h4 className="text-sm font-semibold text-slate-700 mb-3">Mục tiêu hàng ngày</h4>
//                   <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-orange-700">Tiến độ</span>
//                       <span className="font-semibold text-orange-800">{Math.min(Math.round((getTicketsResolvedToday() / 5) * 100), 100)}%</span>
//                     </div>
//                     <div className="w-full bg-orange-200 rounded-full h-2">
//                       <div 
//                         className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-300"
//                         style={{ width: `${Math.min((getTicketsResolvedToday() / 5) * 100, 100)}%` }}
//                       ></div>
//                     </div>
//                     <p className="text-xs text-orange-600 mt-2">Mục tiêu: 5 phiếu/ngày</p>
//                   </div>
//                 </div>

//                 {/* Customer Satisfaction */}
//                 <div>
//                   <h4 className="text-sm font-semibold text-slate-700 mb-3">Đánh giá khách hàng</h4>
//                   <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
//                     <div className="flex items-center justify-center mb-2">
//                       <div className="flex items-center space-x-1">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <StarIconSolid
//                             key={star}
//                             className={`h-5 w-5 ${
//                               star <= getAverageRating() ? 'text-yellow-400' : 'text-gray-300'
//                             }`}
//                           />
//                         ))}
//                       </div>
//                       <span className="ml-2 text-lg font-bold text-slate-700">
//                         {getAverageRating().toFixed(1)}
//                       </span>
//                     </div>
//                     <p className="text-xs text-center text-amber-700">
//                       Dựa trên {getTicketsWithRating().length} đánh giá
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
//               <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
//                 <h3 className="font-bold">⚡ Thao tác nhanh</h3>
//               </div>
//               <div className="p-4 space-y-3">
//                 <button
//                   onClick={handleViewAllTickets}
//                   className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
//                 >
//                   <span className="text-sm font-medium text-slate-700">Xem tất cả phiếu</span>
//                   <EyeIcon className="h-4 w-4 text-slate-500" />
//                 </button>
                
//                 <button
//                   onClick={() => navigate('/helpdesk/create')}
//                   className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
//                 >
//                   <span className="text-sm font-medium text-slate-700">Tạo phiếu mới</span>
//                   <PlusIcon className="h-4 w-4 text-slate-500" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {isTicketModalOpen && (
//         <TicketForm
//           isOpen={isTicketModalOpen}
//           onClose={() => setIsTicketModalOpen(false)}
//           ticket={selectedTicket}
//           onSubmit={(ticketData) => {
//             if (selectedTicket) {
//               setTickets(tickets.map(t => 
//                 t.id === selectedTicket.id 
//                   ? { ...t, ...ticketData, updatedAt: new Date().toISOString() }
//                   : t
//               ));
//             } else {
//               const newTicket = {
//                 id: `TCK-${String(tickets.length + 1).padStart(3, '0')}`,
//                 ...ticketData,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString(),
//                 comments: []
//               };
//               setTickets([...tickets, newTicket]);
//             }
//             setIsTicketModalOpen(false);
//           }}
//         />
//       )}

//       {isViewAllModalOpen && (
//         <ViewAllTicketsModal
//           isOpen={isViewAllModalOpen}
//           onClose={() => setIsViewAllModalOpen(false)}
//           tickets={tickets}
//           defaultPriorityFilter={defaultPriorityFilter}
//           statuses={STATUSES}
//           priorities={PRIORITIES}
//           categories={CATEGORIES}
//           agents={AGENTS}
//           onStatusChange={handleStatusChange}
//           onAssignTicket={handleAssignTicket}
//           onPriorityChange={handlePriorityChange}
//           onViewTicket={handleViewTicket}
//           onEditTicket={handleEditTicket}
//         />
//       )}

//       {isTicketDetailModalOpen && (
//         <TicketDetailModal
//           isOpen={isTicketDetailModalOpen}
//           onClose={() => setIsTicketDetailModalOpen(false)}
//           ticket={selectedTicket}
//           onStatusChange={handleStatusChange}
//           onEdit={handleEditTicket}
//         />
//       )}
//     </div>
//   );
// };

// // Helpdesk Overview Component
// const HelpdeskOverview = ({ tickets }) => {
//   const stats = {
//     total: tickets.length,
//     high: tickets.filter(t => t.priority === 'high').length,
//     medium: tickets.filter(t => t.priority === 'medium').length,
//     low: tickets.filter(t => t.priority === 'low').length,
//     critical: tickets.filter(t => t.priority === 'critical').length,
//     open: tickets.filter(t => ['new', 'open', 'in_progress'].includes(t.status)).length,
//     resolved: tickets.filter(t => t.status === 'resolved').length,
//     slaBreached: tickets.filter(t => t.slaBreached).length,
//   };

//   const priorityCards = [
//     {
//       title: 'Critical Priority',
//       count: stats.critical,
//       color: 'bg-red-500',
//       textColor: 'text-red-600',
//       bgColor: 'bg-red-50',
//       icon: ExclamationTriangleIcon,
//       trend: '+12%'
//     },
//     {
//       title: 'High Priority',
//       count: stats.high,
//       color: 'bg-orange-500',
//       textColor: 'text-orange-600',
//       bgColor: 'bg-orange-50',
//       icon: ArrowTrendingUpIcon,
//       trend: '+5%'
//     },
//     {
//       title: 'Medium Priority',
//       count: stats.medium,
//       color: 'bg-yellow-500',
//       textColor: 'text-yellow-600',
//       bgColor: 'bg-yellow-50',
//       icon: MinusIcon,
//       trend: '-2%'
//     },
//     {
//       title: 'Low Priority',
//       count: stats.low,
//       color: 'bg-green-500',
//       textColor: 'text-green-600',
//       bgColor: 'bg-green-50',
//       icon: ArrowTrendingDownIcon,
//       trend: '-8%'
//     }
//   ];

//   const overallStats = [
//     {
//       title: 'Total Tickets',
//       value: stats.total,
//       icon: TagIcon,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50'
//     },
//     {
//       title: 'Open Tickets',
//       value: stats.open,
//       icon: ClockIcon,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50'
//     },
//     {
//       title: 'Resolved',
//       value: stats.resolved,
//       icon: CheckCircleIcon,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50'
//     },
//     {
//       title: 'SLA Breached',
//       value: stats.slaBreached,
//       icon: XCircleIcon,
//       color: 'text-red-600',
//       bgColor: 'bg-red-50'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//       {/* Priority Statistics */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Priority Overview</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {priorityCards.map((card, index) => (
//             <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-100`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">{card.title}</p>
//                   <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.count}</p>
//                   <p className="text-sm text-gray-500 mt-1">vs last week {card.trend}</p>
//                 </div>
//                 {/* <div className={`p-3 rounded-full ${card.color}`}>
//                   <card.icon className="h-6 w-6 text-white" />
//                 </div> */}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Overall Statistics */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Statistics</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {overallStats.map((stat, index) => (
//             <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-100`}>
//               <div className="flex items-center">
//                 <div className={`p-2 rounded-md ${stat.color} bg-white`}>
//                   <stat.icon className="h-5 w-5" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                   <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };


// export default Helpdesk;
