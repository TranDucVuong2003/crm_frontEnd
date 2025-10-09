import React, { useState } from 'react';
import { 
  PlusIcon, 
  EllipsisVerticalIcon as DotsVerticalIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const SalesPipeline = () => {
  const [stages] = useState([
    { id: 'lead', name: 'Lead mới' },
    { id: 'qualified', name: 'Đã xác thực' },
    { id: 'proposal', name: 'Đề xuất' },
    { id: 'negotiation', name: 'Đàm phán' },
    { id: 'closed-won', name: 'Thành công' },
    { id: 'closed-lost', name: 'Thất bại' }
  ]);

  const [deals, setDeals] = useState([
    {
      id: 1,
      title: 'Dự án website công ty ABC',
      customer: 'Công ty ABC',
      value: 50000000,
      expectedCloseDate: '2025-11-15',
      priority: 'high',
      probability: 80,
      stage: 'proposal',
      notes: 'Khách hàng quan tâm cao'
    },
    {
      id: 2,
      title: 'Hệ thống CRM cho XYZ',
      customer: 'Công ty XYZ',
      value: 120000000,
      expectedCloseDate: '2025-12-01',
      priority: 'medium',
      probability: 60,
      stage: 'negotiation',
      notes: 'Đang thảo luận giá'
    },
    {
      id: 3,
      title: 'App mobile cho DEF',
      customer: 'Startup DEF',
      value: 80000000,
      expectedCloseDate: '2025-10-30',
      priority: 'high',
      probability: 90,
      stage: 'qualified',
      notes: 'Gần như chốt deal'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const handleAddDeal = (stageId) => {
    setSelectedStage(stageId);
    setEditingDeal(null);
    setIsModalOpen(true);
  };

  const handleSaveDeal = (dealData) => {
    if (editingDeal) {
      setDeals(deals.map(d => 
        d.id === editingDeal.id ? { ...dealData, id: editingDeal.id } : d
      ));
    } else {
      const newDeal = {
        ...dealData,
        id: Math.max(...deals.map(d => d.id), 0) + 1,
        stage: selectedStage
      };
      setDeals([...deals, newDeal]);
    }
  };

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="mt-2 text-sm text-gray-700">Quản lý cơ hội bán hàng và theo dõi tiến trình</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => handleAddDeal('lead')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm deal mới
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{deals.length}</div>
            <div className="text-sm text-gray-600">Tổng số deals</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalValue())}</div>
            <div className="text-sm text-gray-600">Tổng giá trị</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{getDealsByStage('closed-won').length}</div>
            <div className="text-sm text-gray-600">Deals thành công</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {deals.length > 0 ? Math.round((getDealsByStage('closed-won').length / deals.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ chốt deal</div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 lg:p-6">
          <div className="overflow-x-auto">
            <div className="flex space-x-4" style={{ minWidth: '100%' }}>
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  deals={getDealsByStage(stage.id)}
                  onAddDeal={handleAddDeal}
                />
              ))}
            </div>
          </div>
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
    </div>
  );
};

const PipelineColumn = ({ stage, deals, onAddDeal }) => {
  const getColumnColor = (stageId) => {
    switch (stageId) {
      case 'lead': return 'border-blue-200 bg-blue-50';
      case 'qualified': return 'border-yellow-200 bg-yellow-50';
      case 'proposal': return 'border-orange-200 bg-orange-50';
      case 'negotiation': return 'border-purple-200 bg-purple-50';
      case 'closed-won': return 'border-green-200 bg-green-50';
      case 'closed-lost': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`flex-none w-1/4 min-w-0 border rounded-lg ${getColumnColor(stage.id)}`} style={{ minWidth: 'calc(25% - 12px)' }} >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate flex-1">{stage.name}</h3>
          <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 ml-2 flex-shrink-0">
            {deals.length}
          </span>
        </div>
        <div className="text-xs text-gray-600 truncate">
          Tổng: {formatCurrency(totalValue)}
        </div>
        <button 
          onClick={() => onAddDeal(stage.id)}
          className="mt-2 w-full flex items-center justify-center px-2 py-2 border border-dashed border-gray-300 rounded-md text-xs text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Thêm deal
        </button>
      </div>

      {/* Deals List */}
      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-6">
            Chưa có deal nào
          </div>
        )}
      </div>
    </div>
  );
};

const DealCard = ({ deal }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-medium text-gray-900 line-clamp-2 flex-1 mr-1">{deal.title}</h4>
        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <DotsVerticalIcon className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center text-xs text-gray-600">
          <CurrencyDollarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="font-medium truncate text-xs">{formatCurrency(deal.value)}</span>
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <UserIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{deal.customer}</span>
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{deal.expectedCloseDate}</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(deal.priority)}`}>
            {deal.priority === 'high' ? 'Cao' : deal.priority === 'medium' ? 'TB' : 'Thấp'}
          </span>
          <div className="text-xs text-gray-500">
            {deal.probability}% cơ hội
          </div>
        </div>
      </div>
    </div>
  );
};

const DealModal = ({ isOpen, onClose, deal = null, onSave, stageId = null }) => {
  const [formData, setFormData] = useState(deal || {
    title: '',
    customer: '',
    customerId: '',
    value: '',
    expectedCloseDate: '',
    actualCloseDate: '',
    priority: 'medium',
    probability: 50,
    stage: stageId || 'lead',
    notes: '',
    assignedTo: '',
    createdBy: ''
  });

  // Mock data for dropdowns - replace with actual data from your API
  const users = [
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Lê Văn C' }
  ];

  const customers = [
    { id: 1, name: 'Công ty ABC' },
    { id: 2, name: 'Công ty XYZ' },
    { id: 3, name: 'Startup DEF' }
  ];

  const stages = [
    { id: 'lead', name: 'Lead mới' },
    { id: 'qualified', name: 'Đã xác thực' },
    { id: 'proposal', name: 'Đề xuất' },
    { id: 'negotiation', name: 'Đàm phán' },
    { id: 'closed-won', name: 'Thành công' },
    { id: 'closed-lost', name: 'Thất bại' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: parseFloat(formData.value) || 0,
      customerId: parseInt(formData.customerId) || null,
      assignedTo: parseInt(formData.assignedTo) || null,
      createdBy: parseInt(formData.createdBy) || null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {deal ? 'Chỉnh sửa deal' : 'Thêm deal mới'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên deal *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nhập tên deal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khách hàng *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.customerId}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    const customer = customers.find(c => c.id === parseInt(customerId));
                    setFormData({
                      ...formData, 
                      customerId: customerId,
                      customer: customer ? customer.name : ''
                    });
                  }}
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị (VNĐ) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giai đoạn
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                >
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày dự kiến chốt
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày chốt thực tế
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.actualCloseDate}
                  onChange={(e) => setFormData({...formData, actualCloseDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Phân công
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người phụ trách
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                >
                  <option value="">Chọn người phụ trách</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Người tạo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({...formData, createdBy: e.target.value})}
                >
                  <option value="">Chọn người tạo</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Probability and Notes Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Chi tiết khác
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỷ lệ thành công: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Nhập ghi chú về deal này..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.notes?.length || 0}/2000 ký tự
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {deal ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPipeline;