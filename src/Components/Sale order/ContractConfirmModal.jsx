import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  DocumentTextIcon,
  UserIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import {
  createContract,
  getAllTax,
  getContractQRCode,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";
import QrCodeDisplayModal from "../Contract/QrCodeDisplayModal";

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
    exportInvoices: false,
  });

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();

      // Pre-fill form data from deal
      if (deal) {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        setFormData({
          status: "New",
          paymentMethod: "Chuyển khoản",
          expiration: expirationDate.toISOString().slice(0, 16),
          notes: deal.notes || "",
          exportInvoices: false,
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
    // API mới: deal.customer là object
    if (deal && deal.customer) {
      // customerType === "individual": chỉ có field name
      // customerType === "company": chỉ có field name (là company name)
      return deal.customer.name || "Unknown";
    }

    return "Unknown";
  };

  const getCreatedByName = () => {
    // API mới: deal.createdByUser là object
    if (deal && deal.createdByUser) {
      return deal.createdByUser.name || "Unknown";
    }

    // Fallback: Lấy từ user hiện tại nếu không có createdByUser
    return user?.fullName || user?.username || "N/A";
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
        exportInvoices: formData.exportInvoices,
      };

      const contractResponse = await createContract(contractData);
      const createdContractId = contractResponse.data.id;

      showSuccess("Thành công!", "Tạo hợp đồng thành công");

      // Đóng modal hiện tại
      onClose();

      if (onSuccess) {
        onSuccess();
      }

      // Navigate đến trang Contract
      setTimeout(() => {
        navigate("/contract");
      }, 500);
    } catch (error) {
      console.error("Error creating contract:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo hợp đồng";
      showError("Lỗi!", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setQrData(null);
    onClose();
    // Navigate to contract page
    navigate("/contract");
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
            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Thông tin Sale Order
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-md p-3">
                  <span className="text-gray-500 text-xs block mb-1">
                    Tiêu đề:
                  </span>
                  <p className="font-semibold text-gray-900">
                    {deal?.title || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-md p-3">
                  <span className="text-gray-500 text-xs block mb-1">
                    Khách hàng:
                  </span>
                  <p className="font-semibold text-gray-900">
                    {getCustomerName()}
                  </p>
                </div>
                <div className="bg-white rounded-md p-3">
                  <span className="text-gray-500 text-xs block mb-1">
                    Được tạo bởi:
                  </span>
                  <p className="font-semibold text-gray-900">
                    {getCreatedByName()}
                  </p>
                </div>
                <div className="bg-white rounded-md p-3">
                  <span className="text-gray-500 text-xs block mb-1">
                    Giá trị:
                  </span>
                  <p className="font-semibold text-green-600 text-base">
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
                <option value="New">New</option>
                <option value="Old">Old</option>
                <option value="Paid">Paid</option>
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

            {/* Xuất hóa đơn */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exportInvoices}
                  onChange={(e) =>
                    setFormData({ ...formData, exportInvoices: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Xuất hóa đơn cho hợp đồng này
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-7">
                Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng
              </p>
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

      {/* QR Code Display Modal */}
      <QrCodeDisplayModal
        isOpen={showQrModal}
        onClose={handleCloseQrModal}
        qrData={qrData}
      />
    </div>
  );
};

export default ContractConfirmModal;
