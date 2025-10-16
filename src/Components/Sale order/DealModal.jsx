import React, { useState, useEffect } from 'react'
import { getAllCustomers, getAllServices, getAllAddons, createSaleOrder, updateSaleOrder } from '../../Service/ApiService'

const DealModal = ({ isOpen, onClose, deal = null, onSave, stageId = null }) => {
  const [formData, setFormData] = useState(deal || {
    title: '',
    customerId: '',
    value: '',
    probability: 0,
    notes: '',
    serviceId: '',
    addonId: ''
  });

  // State for dropdown data
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    setLoading(true);
    try {
      const [customersResponse, servicesResponse, addonsResponse] = await Promise.all([
        getAllCustomers(),
        getAllServices(),
        getAllAddons()
      ]);

      setCustomers(customersResponse.data || []);
      setServices(servicesResponse.data || []);
      setAddons(addonsResponse.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      // Fallback to mock data if API fails
      setCustomers([
        { id: 1, name: 'Công ty ABC' },
        { id: 2, name: 'Công ty XYZ' },
        { id: 3, name: 'Startup DEF' }
      ]);
      setServices([
        { id: 1, name: 'Tư vấn chiến lược' },
        { id: 2, name: 'Phát triển phần mềm' },
        { id: 3, name: 'Marketing Digital' }
      ]);
      setAddons([
        { id: 1, name: 'Bảo trì 6 tháng' },
        { id: 2, name: 'Đào tạo người dùng' },
        { id: 3, name: 'Hỗ trợ 24/7' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get customer display name
  const getCustomerDisplayName = (customer) => {
    if (customer.customerType === 'individual') {
      return customer.name || 'N/A';
    } else {
      return customer.companyName || customer.name || 'N/A';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Tên deal là bắt buộc');
      return;
    }
    
    if (!formData.customerId) {
      alert('Khách hàng là bắt buộc');
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      alert('Giá trị phải lớn hơn 0');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data according to SaleOrder model
      const saleOrderData = {
        title: formData.title.trim(),
        customerId: parseInt(formData.customerId),
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability) || 0,
        notes: formData.notes.trim() || null,
        serviceId: formData.serviceId ? parseInt(formData.serviceId) : null,
        addonId: formData.addonId ? parseInt(formData.addonId) : null
      };
      
      // Call appropriate API
      if (deal && deal.id) {
        await updateSaleOrder(deal.id, saleOrderData);
      } else {
        await createSaleOrder(saleOrderData);
      }
      
      // Call parent callback if provided
      if (onSave) {
        onSave(saleOrderData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving sale order:', error);
      alert('Có lỗi xảy ra khi lưu sale order. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {deal ? 'Chỉnh sửa Sale Order' : 'Thêm Sale Order mới'}
          </h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Deal *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nhập tên Deal"
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
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                >
                  <option value="">Chọn khách hàng</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {getCustomerDisplayName(customer)}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dịch vụ
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">Chọn dịch vụ</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Addon
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.addonId}
                  onChange={(e) => setFormData({...formData, addonId: e.target.value})}
                >
                  <option value="">Chọn addon</option>
                  {addons.map(addon => (
                    <option key={addon.id} value={addon.id}>
                      {addon.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Probability Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Xác suất thành công
            </h3>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác suất thành công (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                value={formData.probability}
                onChange={(e) => setFormData({...formData, probability: e.target.value})}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-medium text-gray-700">{formData.probability}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Ghi chú
            </h3>
            <textarea
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Nhập ghi chú về sale order này..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.notes?.length || 0}/2000 ký tự
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
        )}
      </div>
    </div>
  );
};

export default DealModal
