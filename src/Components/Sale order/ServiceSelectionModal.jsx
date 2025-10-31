import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getAllServices } from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";

const ServiceSelectionModal = ({
  isOpen,
  onClose,
  onSave,
  initialServices = [],
}) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      // Initialize with existing services if editing
      if (initialServices.length > 0) {
        setSelectedServices(initialServices);
      } else {
        // Start with one empty row
        setSelectedServices([
          {
            stt: 1,
            serviceId: "",
            serviceName: "",
            duration: "",
            template: "",
            price: 0,
            thanhTien: 0,
          },
        ]);
      }
    }
  }, [isOpen, initialServices]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getAllServices();
      setServices(response.data.filter((service) => service.isActive));
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Lỗi!", "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    const newRow = {
      stt: selectedServices.length + 1,
      serviceId: "",
      serviceName: "",
      duration: "",
      template: "",
      price: 0,
      thanhTien: 0,
    };
    setSelectedServices([...selectedServices, newRow]);
  };

  const removeRow = (index) => {
    if (selectedServices.length > 1) {
      const updatedServices = selectedServices.filter((_, i) => i !== index);
      // Update STT numbers
      const renumberedServices = updatedServices.map((service, i) => ({
        ...service,
        stt: i + 1,
      }));
      setSelectedServices(renumberedServices);
    }
  };

  const handleServiceChange = (index, serviceId) => {
    const selectedService = services.find((s) => s.id === parseInt(serviceId));
    const updatedServices = [...selectedServices];

    if (selectedService) {
      updatedServices[index] = {
        ...updatedServices[index],
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        thanhTien: selectedService.price,
      };
    } else {
      updatedServices[index] = {
        ...updatedServices[index],
        serviceId: "",
        serviceName: "",
        price: 0,
        thanhTien: 0,
      };
    }

    setSelectedServices(updatedServices);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedServices = [...selectedServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    setSelectedServices(updatedServices);
  };

  const calculateTotal = () => {
    return selectedServices.reduce(
      (total, service) => total + (service.thanhTien || 0),
      0
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSave = () => {
    // Validate that at least one service is selected
    const validServices = selectedServices.filter(
      (service) => service.serviceId
    );

    if (validServices.length === 0) {
      showError("Lỗi!", "Vui lòng chọn ít nhất một dịch vụ.");
      return;
    }

    // Pass the selected services back to parent
    onSave(validServices);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Chọn Dịch vụ</h3>
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
                      Duration (tháng)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Template
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
                  {selectedServices.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {service.stt}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <select
                          value={service.serviceId}
                          onChange={(e) =>
                            handleServiceChange(index, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                          <option value="">Chọn dịch vụ</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} - {formatPrice(s.price)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "duration",
                              parseInt(e.target.value) || ""
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Nhập số tháng"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                        <input
                          type="text"
                          value={service.template}
                          onChange={(e) =>
                            handleFieldChange(index, "template", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          placeholder="Nhập template"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <span className="font-medium text-green-600">
                          {formatPrice(service.thanhTien)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {selectedServices.length > 1 && (
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
                  <span className="text-sm font-medium text-gray-700">
                    Tổng tiền:
                  </span>
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

export default ServiceSelectionModal;
