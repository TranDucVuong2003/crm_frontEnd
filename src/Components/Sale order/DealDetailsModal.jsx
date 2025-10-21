import React, { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyDollarIcon, CalendarIcon, UserIcon, BuildingOfficeIcon, PencilIcon, CheckIcon, XMarkIcon as CancelIcon } from '@heroicons/react/24/outline';
import { updateSaleOrder } from '../../Service/ApiService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const DealDetailsModal = ({ isOpen, onClose, deal, customers, services, addons, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deal) {
      setEditData({
        probability: deal.probability,
        notes: deal.notes || '',
        expectedCloseDate: deal.expectedCloseDate || ''
      });
    }
  }, [deal]);

  if (!isOpen || !deal) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCustomerDetails = () => {
    const customer = customers.find(c => c.id === deal.customerId);
    return customer || null;
  };

  const getServiceName = () => {
    const service = services.find(s => s.id === deal.serviceId);
    return service?.name || 'Không có dịch vụ';
  };

  const getAddonName = () => {
    const addon = addons.find(a => a.id === deal.addonId);
    return addon?.name || 'Không có addon';
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const getStageText = (stage) => {
    switch (stage) {
      case 'low': return 'Tỉ lệ thấp (1-35%)';
      case 'medium': return 'Tỉ lệ trung bình (36-70%)';
      case 'high': return 'Tỉ lệ cao (71-99%)';
      case 'closed-won': return 'Thành công (100%)';
      case 'closed-lost': return 'Thất bại (0%)';
      default: return 'Không xác định';
    }
  };

  const getStageByProbability = (probability) => {
    if (probability === 100) return 'closed-won';
    if (probability === 0) return 'closed-lost';
    if (probability >= 71) return 'high';
    if (probability >= 36) return 'medium';
    return 'low';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset data
      setEditData({
        probability: deal.probability,
        notes: deal.notes || '',
        expectedCloseDate: deal.expectedCloseDate || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData = {
        probability: parseInt(editData.probability),
        notes: editData.notes,
        expectedCloseDate: editData.expectedCloseDate
      };
      
      // Call API to update
      await updateSaleOrder(deal.id, updateData);
      
      showSuccess('Thành công!', 'Đã cập nhật thông tin sale order.');
      setIsEditing(false);
      
      // Notify parent component to refresh data
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Error updating sale order:', error);
      showError('Lỗi!', 'Không thể cập nhật sale order.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'closed-won': return 'bg-green-100 text-green-800';
      case 'closed-lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const customer = getCustomerDetails();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"  style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="relative top-20 mx-auto p-5 w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Chỉnh sửa Sale Order' : 'Chi tiết Sale Order'}
          </h3>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={handleEditToggle}
                  disabled={loading}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  <CancelIcon className="h-4 w-4 mr-1" />
                  Hủy
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tiêu đề:</span>
                    <p className="text-sm text-gray-900">{deal.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Giai đoạn:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStageColor(getStageByProbability(isEditing ? editData.probability : deal.probability))}`}>
                      {getStageText(getStageByProbability(isEditing ? editData.probability : deal.probability))}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ưu tiên:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      deal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      deal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getPriorityText(deal.priority)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin tài chính</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Giá trị:</span>
                    <span className="ml-2 text-sm font-bold text-green-600">{formatCurrency(deal.value)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tỷ lệ thành công:</span>
                    {isEditing ? (
                      <div className="mt-2">
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={editData.probability}
                            onChange={(e) => handleInputChange('probability', e.target.value)}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editData.probability}
                              onChange={(e) => handleInputChange('probability', e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {editData.probability == 0 ? 'Thất bại' : 
                           editData.probability == 100 ? 'Thành công' :
                           editData.probability >= 71 ? 'Tỉ lệ cao' :
                           editData.probability >= 36 ? 'Tỉ lệ trung bình' : 'Tỉ lệ thấp'}
                        </div>
                      </div>
                    ) : (
                      <span className="ml-2 text-sm text-gray-900">{deal.probability}%</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {customer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {customer.customerType === 'individual' ? (
                        <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                      ) : (
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-600">Tên:</span>
                      <span className="ml-2 text-sm text-gray-900">{deal.customer}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Loại:</span>
                      <span className="ml-2 text-sm text-gray-900">
                        {customer.customerType === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'}
                      </span>
                    </div>
                    {customer.email && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="ml-2 text-sm text-gray-900">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Điện thoại:</span>
                        <span className="ml-2 text-sm text-gray-900">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Service & Addon Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Dịch vụ & Addon</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dịch vụ:</span>
                    <p className="text-sm text-gray-900">{getServiceName()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Addon:</span>
                    <p className="text-sm text-gray-900">{getAddonName()}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Thời gian</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-600">Dự kiến chốt:</span>
                    </div>
                    {isEditing ? (
                      <div className="mt-2">
                        <input
                          type="date"
                          value={editData.expectedCloseDate ? new Date(editData.expectedCloseDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <span className="ml-6 text-sm text-gray-900">{formatDate(deal.expectedCloseDate)}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ngày tạo:</span>
                    <span className="ml-2 text-sm text-gray-900">{formatDate(deal.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Cập nhật lần cuối:</span>
                    <span className="ml-2 text-sm text-gray-900">{formatDate(deal.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Ghi chú</h4>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Nhập ghi chú..."
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {deal.notes || 'Chưa có ghi chú'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mr-auto">
              <div className="flex">
                <div className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Thay đổi tỷ lệ thành công sẽ tự động cập nhật giai đoạn của deal.
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {isEditing ? 'Hủy & Đóng' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealDetailsModal;
