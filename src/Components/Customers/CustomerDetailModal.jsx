import React from 'react';
import { 
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'potential': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'potential': return 'Tiềm năng';
      default: return status || 'N/A';
    }
  };

  const isIndividual = customer.customerType === 'individual';
  const displayName = isIndividual 
    ? (customer.name?.trim() || 'N/A')
    : (customer.companyName?.trim() || 'N/A');

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="relative top-10 mx-auto p-6 w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-2/3 shadow-lg rounded-lg bg-white min-h-[80vh] max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
              {isIndividual ? (
                <UserIcon className="h-6 w-6 text-white" />
              ) : (
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(customer.status)}`}>
                {getStatusText(customer.status)}
              </span>
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
        <div className="max-h-[70vh] overflow-y-auto">
          {isIndividual ? (
            // Individual Customer Details
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Tên đầy đủ:</span>
                      <p className="font-medium">{customer.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">CCCD/CMND:</span>
                      <p className="font-medium">{customer.idNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Ngày sinh:</span>
                      <p className="font-medium">{formatDate(customer.birthDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Domain:</span>
                      <p className="font-medium">{customer.domain || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Số điện thoại:</span>
                      <p className="font-medium">{customer.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{customer.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="w-full">
                      <span className="text-sm text-gray-500">Địa chỉ:</span>
                      <p className="font-medium">{customer.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Company Customer Details
            <div className="space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Thông tin công ty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Tên công ty:</span>
                      <p className="font-medium">{customer.companyName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Mã số thuế:</span>
                      <p className="font-medium">{customer.taxCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Ngày thành lập:</span>
                      <p className="font-medium">{formatDate(customer.establishedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Domain công ty:</span>
                      <p className="font-medium">{customer.companyDomain || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="w-full">
                      <span className="text-sm text-gray-500">Địa chỉ công ty:</span>
                      <p className="font-medium">{customer.companyAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Representative Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Người đại diện
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Tên đại diện:</span>
                      <p className="font-medium">{customer.representativeName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Chức vụ:</span>
                      <p className="font-medium">{customer.representativePosition || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">CCCD/CMND:</span>
                      <p className="font-medium">{customer.representativeIdNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Số điện thoại:</span>
                      <p className="font-medium">{customer.representativePhone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="w-full">
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{customer.representativeEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Contact */}
              {(customer.techContactName || customer.techContactPhone || customer.techContactEmail) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Liên hệ kỹ thuật</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Tên:</span>
                        <p className="font-medium">{customer.techContactName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Số điện thoại:</span>
                        <p className="font-medium">{customer.techContactPhone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center md:col-span-2">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="w-full">
                        <span className="text-sm text-gray-500">Email:</span>
                        <p className="font-medium">{customer.techContactEmail || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Section */}
          {customer.notes && (
            <div className=" mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Ghi chú
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;