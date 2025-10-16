import React from 'react';
import { XMarkIcon, CogIcon } from '@heroicons/react/24/outline';

const ServiceDetailModal = ({ isOpen, onClose, service, formatPrice }) => {
  if (!isOpen || !service) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Chi tiết Dịch vụ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tên dịch vụ</label>
                <p className="mt-1 text-sm text-gray-900">{service.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Danh mục</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.category || 'Chưa phân loại'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Mô tả</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                {service.description || 'Không có mô tả'}
              </p>
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Giá và số lượng</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Giá</label>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  {formatPrice(service.price)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số lượng</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{service.quantity}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Trạng thái</label>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                service.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {service.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {service.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Ghi chú</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {service.notes}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Thời gian</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(service.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày cập nhật</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(service.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;