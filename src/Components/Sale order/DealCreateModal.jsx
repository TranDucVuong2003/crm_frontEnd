import React, { useState, useEffect } from "react";
import {
  getAllCustomers,
  getAllServices,
  getAllAddons,
  getAllTax,
  createSaleOrder,
  updateSaleOrder,
} from "../../Service/ApiService";
import ServiceSelectionModal from "./ServiceSelectionModal";
import AddonSelectionModal from "../Addons/AddonSelectionModal";

const DealModal = ({
  isOpen,
  onClose,
  deal = null,
  onSave,
  stageId = null,
}) => {
  const [formData, setFormData] = useState(
    deal || {
      title: "",
      customerId: "",
      value: "",
      probability: 0,
      notes: "",
      taxId: "",
    }
  );

  // State for dropdown data
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for service selection modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  // State for addon selection modal
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Update formData when deal prop changes
  useEffect(() => {
    if (deal) {
      setFormData(deal);
    } else {
      setFormData({
        title: "",
        customerId: "",
        value: "",
        probability: 0,
        notes: "",
        taxId: "",
      });
    }
  }, [deal, isOpen]);

  // Load dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    setLoading(true);
    try {
      const [
        customersResponse,
        servicesResponse,
        addonsResponse,
        taxesResponse,
      ] = await Promise.all([
        getAllCustomers(),
        getAllServices(),
        getAllAddons(),
        getAllTax(),
      ]);

      setCustomers(customersResponse.data || []);
      setServices(servicesResponse.data || []);
      setAddons(addonsResponse.data || []);
      setTaxes(taxesResponse.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      // Fallback to mock data if API fails
      setCustomers([
        { id: 1, name: "Công ty ABC" },
        { id: 2, name: "Công ty XYZ" },
        { id: 3, name: "Startup DEF" },
      ]);
      setServices([
        { id: 1, name: "Tư vấn chiến lược" },
        { id: 2, name: "Phát triển phần mềm" },
        { id: 3, name: "Marketing Digital" },
      ]);
      setAddons([
        { id: 1, name: "Bảo trì 6 tháng" },
        { id: 2, name: "Đào tạo người dùng" },
        { id: 3, name: "Hỗ trợ 24/7" },
      ]);
      setTaxes([
        { id: 1, name: "VAT 10%", rate: 10 },
        { id: 2, name: "VAT 8%", rate: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get customer display name
  const getCustomerDisplayName = (customer) => {
    if (customer.customerType === "individual") {
      return customer.name || "N/A";
    } else {
      return customer.companyName || customer.name || "N/A";
    }
  };

  // Handle service selection
  const handleOpenServiceModal = () => {
    setIsServiceModalOpen(true);
  };

  const handleServiceSelectionSave = (services) => {
    // Kiểm tra tổng số items không vượt quá 3
    const totalItems = services.length + selectedAddons.length;

    if (totalItems > 3) {
      alert(
        `Tổng số services và addons không được vượt quá 3!\nHiện tại: ${services.length} services + ${selectedAddons.length} addons = ${totalItems} items`
      );
      return;
    }

    setSelectedServices(services);
    updateTotalValue(services, selectedAddons);
  };

  // Handle addon selection
  const handleOpenAddonModal = () => {
    // Kiểm tra số lượng services đã chọn
    if (selectedServices.length >= 3) {
      alert("Đã chọn đủ 3 services! Không thể chọn thêm addon.");
      return;
    }

    setIsAddonModalOpen(true);
  };

  const handleAddonSelectionSave = (addons) => {
    // Kiểm tra tổng số items không vượt quá 3
    const totalItems = selectedServices.length + addons.length;

    if (totalItems > 3) {
      const maxAddons = 3 - selectedServices.length;
      alert(
        `Chỉ có thể chọn tối đa ${maxAddons} addon!\n(Đã có ${selectedServices.length} services, tổng tối đa 3 items)`
      );
      return;
    }

    setSelectedAddons(addons);
    updateTotalValue(selectedServices, addons);
  };

  const updateTotalValue = (
    services = selectedServices,
    addons = selectedAddons
  ) => {
    let totalValue = services.reduce(
      (total, service) => total + (service.thanhTien || 0),
      0
    );

    // Add addons price
    totalValue += addons.reduce(
      (total, addon) => total + (addon.thanhTien || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      value: totalValue.toString(),
    }));
  };

  const formatSelectedServicesDisplay = () => {
    if (selectedServices.length === 0) {
      return "Chọn dịch vụ...";
    }

    if (selectedServices.length === 1) {
      return selectedServices[0].serviceName;
    }

    return `${selectedServices.length} dịch vụ đã chọn`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      alert("Tên deal là bắt buộc");
      return;
    }

    if (!formData.customerId) {
      alert("Khách hàng là bắt buộc");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    // Validate duration and template for services
    for (const service of selectedServices) {
      if (!service.duration || !service.template) {
        alert("Vui lòng nhập đầy đủ Duration và Template cho tất cả dịch vụ");
        return;
      }
    }

    // Validate duration and template for addons if any
    for (const addon of selectedAddons) {
      if (!addon.duration || !addon.template) {
        alert("Vui lòng nhập đầy đủ Duration và Template cho tất cả addon");
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare data according to new API structure
      const saleOrderData = {
        title: formData.title.trim(),
        customerId: parseInt(formData.customerId),
        probability: parseInt(formData.probability) || 0,
        notes: formData.notes.trim() || null,
        taxId: formData.taxId ? parseInt(formData.taxId) : null,
        services: selectedServices.map((service) => ({
          serviceId: service.serviceId,
          duration: parseInt(service.duration),
          template: service.template,
        })),
        addons:
          selectedAddons.length > 0
            ? selectedAddons.map((addon) => ({
                addonId: addon.addonId,
                duration: parseInt(addon.duration),
                template: addon.template,
              }))
            : [],
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
      console.error("Error saving sale order:", error);
      alert("Có lỗi xảy ra khi lưu sale order. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {deal ? "Chỉnh sửa Sale Order" : "Thêm Sale Order mới"}
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
              {/* <h3 className="text-md font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Thông tin cơ bản
            </h3> */}
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {getCustomerDisplayName(customer)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thuế
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  >
                    <option value="">Chọn thuế</option>
                    {taxes.map((tax) => (
                      <option key={tax.id} value={tax.id}>
                        {tax.name} ({tax.rate}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dịch vụ
                    <span className="ml-2 text-xs text-gray-500">
                      ({selectedServices.length + selectedAddons.length}/3
                      items)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      onClick={handleOpenServiceModal}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer bg-white"
                      value={formatSelectedServicesDisplay()}
                      placeholder="Click để chọn dịch vụ..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {selectedServices.length + selectedAddons.length === 3 && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Đã đạt giới hạn 3 items (services + addons)
                    </div>
                  )}
                  {selectedServices.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="bg-gray-50 rounded-md p-3">
                        <div className="space-y-1">
                          {selectedServices.map((service, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span>{service.serviceName}</span>
                              <span className="font-medium text-green-600">
                                {formatPrice(service.thanhTien)}
                              </span>
                            </div>
                          ))}
                          <hr className="my-2" />
                          <div className="flex justify-between items-center font-semibold">
                            <span>Tổng cộng:</span>
                            <span className="text-green-600">
                              {formatPrice(
                                selectedServices.reduce(
                                  (total, service) =>
                                    total + (service.thanhTien || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Addon
                    {selectedServices.length >= 3 ? (
                      <span className="ml-2 text-xs text-red-500">
                        (Không thể chọn - đã có 3 services)
                      </span>
                    ) : (
                      <span className="ml-2 text-xs text-gray-500">
                        (Tối đa {3 - selectedServices.length} addon)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled={selectedServices.length >= 3}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer ${
                        selectedServices.length >= 3
                          ? "bg-gray-100 cursor-not-allowed opacity-50"
                          : "bg-gray-50"
                      }`}
                      value={
                        selectedAddons.length > 0
                          ? `Đã chọn ${selectedAddons.length} addon(s)`
                          : selectedServices.length >= 3
                          ? "Không thể chọn addon (đã có 3 services)"
                          : "Nhấn để chọn addon"
                      }
                      onClick={handleOpenAddonModal}
                      placeholder="Nhấn để chọn addon"
                    />
                  </div>
                  {/* Display selected addons summary */}
                  {selectedAddons.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="bg-gray-50 rounded-md p-3">
                        <div className="space-y-1">
                          {selectedAddons.map((addon, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span>{addon.addonName}</span>
                              <span className="font-medium text-green-600">
                                {formatPrice(addon.thanhTien)}
                              </span>
                            </div>
                          ))}
                          <hr className="my-2" />
                          <div className="flex justify-between items-center font-semibold">
                            <span>Tổng cộng:</span>
                            <span className="text-green-600">
                              {formatPrice(
                                selectedAddons.reduce(
                                  (total, addon) =>
                                    total + (addon.thanhTien || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* {selectedAddons.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                    <strong>Addons đã chọn:</strong>
                    {selectedAddons.map((addon, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{addon.addonName} {addon.maMau && `(Mã: ${addon.maMau})`} {addon.thoiHan && `- ${addon.thoiHan} tháng`}</span>
                        <span className="font-medium">{formatPrice(addon.thanhTien)}</span>
                      </div>
                    ))}
                  </div>
                )} */}
                </div>

                <div className="md:col-span-2">
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
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Giá trị sẽ được tính tự động khi chọn dịch vụ, hoặc bạn có
                    thể nhập thủ công
                  </p>

                  {/* Price Breakdown */}
                  {(selectedServices.length > 0 ||
                    selectedAddons.length > 0) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Chi tiết giá:
                      </h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        {selectedServices.length > 0 && (
                          <div>
                            <span>Dịch vụ ({selectedServices.length}): </span>
                            <span className="font-medium">
                              {formatPrice(
                                selectedServices.reduce(
                                  (total, service) =>
                                    total + (service.thanhTien || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        )}
                        {selectedAddons.length > 0 && (
                          <div>
                            <span>Addon ({selectedAddons.length}): </span>
                            <span className="font-medium">
                              {formatPrice(
                                selectedAddons.reduce(
                                  (total, addon) =>
                                    total + (addon.thanhTien || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        )}
                        <hr className="border-blue-300" />
                        <div className="font-semibold">
                          <span>Tổng cộng: </span>
                          <span className="text-blue-900">
                            {formatPrice(
                              selectedServices.reduce(
                                (total, service) =>
                                  total + (service.thanhTien || 0),
                                0
                              ) +
                                selectedAddons.reduce(
                                  (total, addon) =>
                                    total + (addon.thanhTien || 0),
                                  0
                                )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium text-gray-700">
                    {formData.probability}%
                  </span>
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
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
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
                {deal ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleServiceSelectionSave}
        initialServices={selectedServices}
      />

      {/* Addon Selection Modal */}
      <AddonSelectionModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        onSave={handleAddonSelectionSave}
        initialAddons={selectedAddons}
      />
    </div>
  );
};

export default DealModal;
