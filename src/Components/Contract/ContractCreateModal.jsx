import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  createContract,
  getAllCustomers,
  getAllUsers,
  getAllServices,
  getAllAddons,
  getAllTax,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
} from "../../utils/sweetAlert";

const ContractCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    customerId: "",
    userId: "",
    serviceId: "",
    addonsId: "",
    taxId: "",
    status: "Draft",
    paymentMethod: "Chuyển khoản",
    expiration: "",
    notes: "",
  });

  // Fetch all dropdown data
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    try {
      setIsLoading(true);
      const [customersRes, usersRes, servicesRes, addonsRes, taxesRes] =
        await Promise.all([
          getAllCustomers(),
          getAllUsers(),
          getAllServices(),
          getAllAddons(),
          getAllTax(),
        ]);

      setCustomers(customersRes.data || []);
      setUsers(usersRes.data || []);
      setServices(servicesRes.data || []);
      setAddons(addonsRes.data || []);
      setTaxes(taxesRes.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showErrorAlert("Lỗi", "Không thể tải dữ liệu dropdown");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      showLoading("Đang tạo hợp đồng...", "Vui lòng đợi");

      // Prepare data
      const contractData = {
        name: formData.name,
        customerId: parseInt(formData.customerId),
        userId: parseInt(formData.userId),
        serviceId: parseInt(formData.serviceId),
        addonsId: formData.addonsId ? parseInt(formData.addonsId) : null,
        taxId: parseInt(formData.taxId),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        expiration: formData.expiration,
        notes: formData.notes,
      };

      await createContract(contractData);
      closeLoading();
      showSuccessAlert("Thành công", "Tạo hợp đồng mới thành công!");

      // Reset form and close modal
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating contract:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tạo hợp đồng"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      customerId: "",
      userId: "",
      serviceId: "",
      addonsId: "",
      taxId: "",
      status: "Draft",
      paymentMethod: "Chuyển khoản",
      expiration: "",
      notes: "",
    });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tạo hợp đồng mới
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Điền thông tin để tạo hợp đồng mới
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Contract Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hợp đồng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Hợp đồng Hosting VPS Premium"
                  />
                </div>

                {/* Customer & User */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Người phụ trách <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn người phụ trách --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service & Addons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} -{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(service.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Addon (Tùy chọn)
                    </label>
                    <select
                      name="addonsId"
                      value={formData.addonsId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Không chọn --</option>
                      {addons.map((addon) => (
                        <option key={addon.id} value={addon.id}>
                          {addon.name} -{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(addon.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tax & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thuế <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn thuế --</option>
                      {taxes.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.rate}% - {tax.notes}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Draft">Nháp</option>
                      <option value="Active">Đang hoạt động</option>
                      <option value="Expired">Hết hạn</option>
                      <option value="Terminated">Đã kết thúc</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method & Expiration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phương thức thanh toán{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                      <option value="Ví điện tử">Ví điện tử</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn thanh toán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="expiration"
                      value={formData.expiration}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ghi chú thêm về hợp đồng..."
                  ></textarea>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Tạo hợp đồng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCreateModal;
