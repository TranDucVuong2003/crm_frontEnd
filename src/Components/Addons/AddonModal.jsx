import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createAddon, updateAddon } from '../../Service/ApiService';
import { showSuccess, showError } from '../../utils/sweetAlert';

const AddonModal = ({ isOpen, onClose, onSave, addon, types = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1,
    type: '',
    isActive: true,
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addon) {
      setFormData({
        name: addon.name || '',
        description: addon.description || '',
        price: addon.price || '',
        quantity: addon.quantity || 1,
        type: addon.type || '',
        isActive: addon.isActive !== undefined ? addon.isActive : true,
        notes: addon.notes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: 1,
        type: '',
        isActive: true,
        notes: ''
      });
    }
    setErrors({});
  }, [addon, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên addon là bắt buộc';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Tên addon không được vượt quá 200 ký tự';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Giá phải là số và lớn hơn hoặc bằng 0';
    }

    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Số lượng phải là số nguyên và lớn hơn 0';
    }

    if (formData.type && formData.type.length > 50) {
      newErrors.type = 'Loại không được vượt quá 50 ký tự';
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Ghi chú không được vượt quá 2000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const addonData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      setLoading(true);
      
      try {
        if (addon) {
          // Update existing addon
          await updateAddon(addon.id, addonData);
          showSuccess('Cập nhật thành công!', 'Addon đã được cập nhật.');
        } else {
          // Create new addon
          await createAddon(addonData);
          showSuccess('Tạo thành công!', 'Addon mới đã được tạo.');
        }
        
        onSave(addonData); // Refresh the list
        onClose();
      } catch (error) {
        console.error('Error saving addon:', error);
        
        // Handle specific error messages from API
        if (error.response?.data?.message) {
          showError('Lỗi!', error.response.data.message);
        } else if (error.response?.status === 400) {
          showError('Lỗi!', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
        } else if (error.response?.status === 401) {
          showError('Lỗi!', 'Bạn không có quyền thực hiện thao tác này.');
        } else if (error.response?.status === 500) {
          showError('Lỗi!', 'Lỗi máy chủ. Vui lòng thử lại sau.');
        } else {
          showError('Lỗi!', 'Không thể lưu addon. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {addon ? 'Chỉnh sửa addon' : 'Thêm addon mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên addon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tên addon"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mô tả addon"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Loại addon
            </label>
            <div className="flex space-x-2">
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn loại</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hoặc nhập loại mới"
              />
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Đang hoạt động
            </label>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập ghi chú thêm"
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {addon ? 'Đang cập nhật...' : 'Đang tạo...'}
                </div>
              ) : (
                addon ? 'Cập nhật' : 'Tạo mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddonModal;