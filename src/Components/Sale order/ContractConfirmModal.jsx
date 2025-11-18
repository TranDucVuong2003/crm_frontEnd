import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { createContract, getAllTax } from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";

const ContractConfirmModal = ({
  isOpen,
  onClose,
  deal,
  customers,
  services,
  addons,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    status: "Draft",
    paymentMethod: "Chuyển khoản",
    expiration: "",
    notes: "",
  });

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();

      // Pre-fill form data from deal
      if (deal) {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        setFormData({
          status: "Mới",
          paymentMethod: "Chuyển khoản",
          expiration: expirationDate.toISOString().slice(0, 16),
          notes: deal.notes || "",
        });
      }
    }
  }, [isOpen, deal]);

  const fetchDropdownData = async () => {
    try {
      const taxesResponse = await getAllTax();
      setTaxes(taxesResponse.data || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showError("Lỗi!", "Không thể tải dữ liệu dropdown");
    }
  };

  const getCustomerName = () => {
    // Ưu tiên lấy từ deal.customer nếu có
    if (deal && deal.customer) {
      return deal.customer;
    }

    const customer = customers.find((c) => c.id === formData.customerId);
    if (!customer) return "N/A";

    if (customer.customerType === "individual") {
      return customer.name || "N/A";
    } else {
      return customer.companyName || customer.name || "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!deal || !deal.id) {
      showError("Lỗi!", "Không tìm thấy thông tin Sale Order");
      return;
    }

    if (!user || !user.id) {
      showError("Lỗi!", "Không tìm thấy thông tin người dùng");
      return;
    }

    if (!formData.expiration) {
      showError("Lỗi!", "Vui lòng chọn ngày hết hạn");
      return;
    }

    setLoading(true);

    try {
      // Prepare contract data theo API mới
      const contractData = {
        saleOrderId: deal.id,
        userId: user.id,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        expiration: new Date(formData.expiration).toISOString(),
        notes: formData.notes.trim() || "",
      };

      await createContract(contractData);

      showSuccess("Thành công!", "Tạo hợp đồng thành công");

      if (onSuccess) {
        onSuccess();
      }

      onClose();

      // Navigate to contract page
      navigate("/contract");
    } catch (error) {
      console.error("Error creating contract:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo hợp đồng";
      showError("Lỗi!", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              Xác nhận tạo hợp đồng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin Sale Order */}
            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Thông tin Sale Order
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Tiêu đề:</span>
                  <p className="font-medium text-gray-900">
                    {deal?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Khách hàng:</span>
                  <p className="font-medium text-gray-900">
                    {getCustomerName()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Được tạo bởi:</span>
                  <p className="font-medium text-gray-900">
                    {user?.fullName || user?.username || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Giá trị:</span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(deal?.value || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dịch vụ */}
            {deal &&
              deal.saleOrderServices &&
              deal.saleOrderServices.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dịch vụ ({deal.saleOrderServices.length})
                  </label>
                  <div className="space-y-2">
                    {deal.saleOrderServices.map((service, index) => (
                      <div
                        key={index}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {service.serviceName}
                            </p>
                            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                              <p>
                                Duration:{" "}
                                <span className="font-medium text-gray-900">
                                  {service.duration} tháng
                                </span>
                              </p>
                              <p>
                                Template:{" "}
                                <span className="font-medium text-gray-900">
                                  {service.template}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-600 ml-4">
                            {formatCurrency(service.unitPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Addon */}
            {deal &&
              deal.saleOrderAddons &&
              deal.saleOrderAddons.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Addon ({deal.saleOrderAddons.length})
                  </label>
                  <div className="space-y-2">
                    {deal.saleOrderAddons.map((addon, index) => (
                      <div
                        key={index}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {addon.addonName}
                            </p>
                            <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                              <p>
                                Duration:{" "}
                                <span className="font-medium text-gray-900">
                                  {addon.duration} tháng
                                </span>
                              </p>
                              <p>
                                Template:{" "}
                                <span className="font-medium text-gray-900">
                                  {addon.template}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-600 ml-4">
                            {formatCurrency(addon.unitPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Mới">Mới</option>
                <option value="Cũ">Cũ</option>
                <option value="Expired">Expired</option>
                <option value="Terminated">Terminated</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                <option value="Ví điện tử">Ví điện tử</option>
              </select>
            </div>

            {/* Ngày hết hạn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày hết hạn <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.expiration}
                onChange={(e) =>
                  setFormData({ ...formData, expiration: e.target.value })
                }
              />
            </div>

            {/* Ghi chú */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Nhập ghi chú cho hợp đồng..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo hợp đồng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractConfirmModal;
