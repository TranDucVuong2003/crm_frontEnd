import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  getAllCustomers,
  getAllServices,
  getAllAddons,
} from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";

const QuoteModal = ({ isOpen, onClose, onSubmit, quote = null }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    serviceId: "",
    addonId: "",
    amount: 0,
  });

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchServices();
      fetchAddons();

      if (quote) {
        // Edit mode
        setFormData({
          customerId: quote.customerId || "",
          serviceId: quote.serviceId || "",
          addonId: quote.addonId || "",
          amount: quote.amount || 0,
        });
        // Find and set selected service/addon for display
        if (quote.service) setSelectedService(quote.service);
        if (quote.addon) setSelectedAddon(quote.addon);
      } else {
        // Create mode
        setFormData({
          customerId: "",
          serviceId: "",
          addonId: "",
          amount: 0,
        });
        setSelectedService(null);
        setSelectedAddon(null);
      }
    }
  }, [isOpen, quote]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showError("Lỗi!", "Không thể tải danh sách khách hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getAllServices();
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Lỗi!", "Không thể tải danh sách dịch vụ");
    }
  };

  const fetchAddons = async () => {
    try {
      const response = await getAllAddons();
      setAddons(response.data || []);
    } catch (error) {
      console.error("Error fetching addons:", error);
      showError("Lỗi!", "Không thể tải danh sách addon");
    }
  };

  const handleServiceChange = (serviceId) => {
    const service = services.find((s) => s.id === parseInt(serviceId));
    setSelectedService(service);
    setFormData({ ...formData, serviceId });
    calculateAmount(service, selectedAddon);
  };

  const handleAddonChange = (addonId) => {
    const addon = addons.find((a) => a.id === parseInt(addonId));
    setSelectedAddon(addon);
    setFormData({ ...formData, addonId });
    calculateAmount(selectedService, addon);
  };

  const calculateAmount = (service, addon) => {
    const servicePrice = service?.price || 0;
    const addonPrice = addon?.price || 0;
    const total = servicePrice + addonPrice;
    setFormData((prev) => ({ ...prev, amount: total }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      showError("Lỗi!", "Vui lòng chọn khách hàng");
      return;
    }

    if (!formData.serviceId) {
      showError("Lỗi!", "Vui lòng chọn dịch vụ");
      return;
    }

    const quoteData = {
      customerId: parseInt(formData.customerId),
      serviceId: parseInt(formData.serviceId),
      addonId: formData.addonId ? parseInt(formData.addonId) : null,
      amount: formData.amount,
    };

    onSubmit(quoteData);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700">
          <h2 className="text-xl font-semibold text-white">
            {quote ? "Chỉnh sửa Báo giá" : "Tạo Báo giá mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Customer Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Khách hàng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn Khách hàng --</option>
                    {customers.map((customer) => {
                      const displayName =
                        customer.customerType === "individual"
                          ? customer.name || customer.fullName || "N/A"
                          : customer.companyName || "N/A";
                      const phone =
                        customer.phoneNumber ||
                        customer.representativePhone ||
                        "";
                      return (
                        <option key={customer.id} value={customer.id}>
                          {displayName} {phone ? `- ${phone}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Service Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn Dịch vụ --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {formatPrice(service.price)}
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Giá dịch vụ:</span>{" "}
                        {formatPrice(selectedService.price)}
                      </p>
                      {selectedService.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedService.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Addon Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Addon (Tùy chọn)
                  </label>
                  <select
                    value={formData.addonId}
                    onChange={(e) => handleAddonChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Không chọn Addon --</option>
                    {addons.map((addon) => (
                      <option key={addon.id} value={addon.id}>
                        {addon.name} - {formatPrice(addon.price)}
                      </option>
                    ))}
                  </select>
                  {selectedAddon && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Giá addon:</span>{" "}
                        {formatPrice(selectedAddon.price)}
                      </p>
                      {selectedAddon.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedAddon.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount Display */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">
                      Tổng tiền báo giá:
                    </span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(formData.amount)}
                    </span>
                  </div>
                  {selectedService && selectedAddon && (
                    <div className="mt-3 pt-3 border-t border-indigo-200 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Dịch vụ:</span>
                        <span>{formatPrice(selectedService.price)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Addon:</span>
                        <span>{formatPrice(selectedAddon.price)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              disabled={isLoading}
            >
              {quote ? "Cập nhật" : "Tạo báo giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteModal;
