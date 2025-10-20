import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getAllAddons } from '../../Service/ApiService';
import { showError } from '../../utils/sweetAlert';

const AddonSelectionModal = ({ isOpen, onClose, onSave, initialAddons = [] }) => {
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAddons();
      // Initialize with existing addons if editing
      if (initialAddons.length > 0) {
        setSelectedAddons(initialAddons);
      } else {
        // Start with one empty row
        setSelectedAddons([{
          stt: 1,
          addonId: '',
          addonName: '',
          maMau: '',
          thoiHan: '',
          price: 0,
          thanhTien: 0
        }]);
      }
    }
  }, [isOpen, initialAddons]);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const response = await getAllAddons();
      setAddons(response.data.filter(addon => addon.isActive));
    } catch (error) {
      console.error('Error fetching addons:', error);
      showError('Lỗi!', 'Không thể tải danh sách addon.');
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    const newRow = {
      stt: selectedAddons.length + 1,
      addonId: '',
      addonName: '',
      maMau: '',
      thoiHan: '',
      price: 0,
      thanhTien: 0
    };
    setSelectedAddons([...selectedAddons, newRow]);
  };

  const removeRow = (index) => {
    if (selectedAddons.length > 1) {
      const updatedAddons = selectedAddons.filter((_, i) => i !== index);
      // Update STT numbers
      const renumberedAddons = updatedAddons.map((addon, i) => ({
        ...addon,
        stt: i + 1
      }));
      setSelectedAddons(renumberedAddons);
    }
  };

  const handleAddonChange = (index, addonId) => {
    const selectedAddon = addons.find(a => a.id === parseInt(addonId));
    const updatedAddons = [...selectedAddons];
    
    if (selectedAddon) {
      updatedAddons[index] = {
        ...updatedAddons[index],
        addonId: selectedAddon.id,
        addonName: selectedAddon.name,
        price: selectedAddon.price,
        thanhTien: selectedAddon.price
      };
    } else {
      updatedAddons[index] = {
        ...updatedAddons[index],
        addonId: '',
        addonName: '',
        price: 0,
        thanhTien: 0
      };
    }
    
    setSelectedAddons(updatedAddons);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedAddons = [...selectedAddons];
    updatedAddons[index] = {
      ...updatedAddons[index],
      [field]: value
    };
    setSelectedAddons(updatedAddons);
  };

  const calculateTotal = () => {
    return selectedAddons.reduce((total, addon) => total + (addon.thanhTien || 0), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSave = () => {
    // Validate that at least one addon is selected
    const validAddons = selectedAddons.filter(addon => addon.addonId);
    
    if (validAddons.length === 0) {
      showError('Lỗi!', 'Vui lòng chọn ít nhất một addon.');
      return;
    }

    // Pass the selected addons back to parent
    onSave(validAddons);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Chọn Addon</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4">
              <button
                onClick={addNewRow}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Thêm dòng
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Khoản mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Mã mẫu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Thời hạn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Thành tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedAddons.map((addon, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {addon.stt}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <select
                          value={addon.addonId}
                          onChange={(e) => handleAddonChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                          <option value="">Chọn addon</option>
                          {addons.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name} - {formatPrice(a.price)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <input
                          type="text"
                          value={addon.maMau}
                          onChange={(e) => handleFieldChange(index, 'maMau', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Nhập mã mẫu"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <select
                          value={addon.thoiHan}
                          onChange={(e) => handleFieldChange(index, 'thoiHan', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                          <option value="">Chọn thời hạn</option>
                          <option value="3">3 tháng</option>
                          <option value="6">6 tháng</option>
                          <option value="12">12 tháng</option>
                          <option value="24">24 tháng</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <span className="font-medium text-green-600">
                          {formatPrice(addon.thanhTien)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {selectedAddons.length > 1 && (
                          <button
                            onClick={() => removeRow(index)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Xóa dòng"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-50 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Tổng tiền:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>


            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddonSelectionModal;