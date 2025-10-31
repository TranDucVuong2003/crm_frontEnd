import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon as CancelIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { updateSaleOrder } from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";
import ContractConfirmModal from "./ContractConfirmModal";

const DealDetailsModal = ({
  isOpen,
  onClose,
  deal,
  customers,
  services,
  addons,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  useEffect(() => {
    if (deal) {
      setEditData({
        probability: deal.probability,
        notes: deal.notes || "",
        expectedCloseDate: deal.expectedCloseDate || "",
      });
    }
  }, [deal]);

  if (!isOpen || !deal) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCustomerDetails = () => {
    const customer = customers.find((c) => c.id === deal.customerId);
    return customer || null;
  };

  const getServiceName = () => {
    const service = services.find((s) => s.id === deal.serviceId);
    return service?.name || "Không có dịch vụ";
  };

  const getAddonName = () => {
    const addon = addons.find((a) => a.id === deal.addonId);
    return addon?.name || "Không có addon";
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  const getStageText = (stage) => {
    switch (stage) {
      case "low":
        return "Tỉ lệ thấp (1-35%)";
      case "medium":
        return "Tỉ lệ trung bình (36-70%)";
      case "high":
        return "Tỉ lệ cao (71-99%)";
      case "closed-won":
        return "Thành công (100%)";
      case "closed-lost":
        return "Thất bại (0%)";
      default:
        return "Không xác định";
    }
  };

  const getStageByProbability = (probability) => {
    if (probability === 100) return "closed-won";
    if (probability === 0) return "closed-lost";
    if (probability >= 71) return "high";
    if (probability >= 36) return "medium";
    return "low";
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset data
      setEditData({
        probability: deal.probability,
        notes: deal.notes || "",
        expectedCloseDate: deal.expectedCloseDate || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleExportContract = () => {
    setIsContractModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare update data
      const updateData = {
        probability: parseInt(editData.probability),
        notes: editData.notes,
        expectedCloseDate: editData.expectedCloseDate,
      };

      // Call API to update
      await updateSaleOrder(deal.id, updateData);

      showSuccess("Thành công!", "Đã cập nhật thông tin sale order.");
      setIsEditing(false);

      // Notify parent component to refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating sale order:", error);
      showError("Lỗi!", "Không thể cập nhật sale order.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-purple-100 text-purple-800";
      case "closed-won":
        return "bg-green-100 text-green-800";
      case "closed-lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const customer = getCustomerDetails();

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-white rounded-t-lg sticky top-0 z-10">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? "Chỉnh sửa Sale Order" : "Chi tiết Sale Order"}
          </h3>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleExportContract}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Xuất hợp đồng
                </button>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Chỉnh sửa
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={handleEditToggle}
                  disabled={loading}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  <CancelIcon className="h-4 w-4 mr-1" />
                  Hủy
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Basic & Financial Info */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                  Thông tin cơ bản
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Tiêu đề:</span>
                    <p className="text-gray-900 mt-0.5">{deal.title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Giai đoạn:
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStageColor(
                          getStageByProbability(
                            isEditing ? editData.probability : deal.probability
                          )
                        )}`}
                      >
                        {getStageText(
                          getStageByProbability(
                            isEditing ? editData.probability : deal.probability
                          )
                        )}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Ưu tiên:</span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          deal.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : deal.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getPriorityText(deal.priority)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                  Thông tin tài chính
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-600">Giá trị:</span>
                    <span className="ml-auto text-sm font-bold text-green-600">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Tỷ lệ thành công:
                    </span>
                    {isEditing ? (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={editData.probability}
                            onChange={(e) =>
                              handleInputChange("probability", e.target.value)
                            }
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.probability}
                            onChange={(e) =>
                              handleInputChange("probability", e.target.value)
                            }
                            className="w-14 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {editData.probability == 0
                            ? "Thất bại"
                            : editData.probability == 100
                            ? "Thành công"
                            : editData.probability >= 71
                            ? "Tỉ lệ cao"
                            : editData.probability >= 36
                            ? "Tỉ lệ trung bình"
                            : "Tỉ lệ thấp"}
                        </div>
                      </div>
                    ) : (
                      <span className="ml-2 text-gray-900">
                        {deal.probability}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {customer && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      {customer.customerType === "individual" ? (
                        <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                      ) : (
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                      )}
                      <span className="font-medium text-gray-600">Tên:</span>
                      <span className="ml-2 text-gray-900">
                        {deal.customer}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Loại:</span>
                      <span className="ml-2 text-gray-900">
                        {customer.customerType === "individual"
                          ? "Cá nhân"
                          : "Doanh nghiệp"}
                      </span>
                    </div>
                    {customer.email && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Email:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {customer.email}
                        </span>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <span className="font-medium text-gray-600">SĐT:</span>
                        <span className="ml-2 text-gray-900">
                          {customer.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column - Services */}
            <div className="space-y-4">
              {/* Services Info */}
              {deal.saleOrderServices && deal.saleOrderServices.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                    Dịch vụ ({deal.saleOrderServices.length})
                  </h4>
                  <div className="space-y-2">
                    {deal.saleOrderServices.map((service, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded-md border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-xs font-medium text-gray-900 leading-tight">
                            {service.serviceName}
                          </span>
                          <span className="text-xs font-semibold text-green-600 ml-2 whitespace-nowrap">
                            {formatCurrency(service.unitPrice)}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium text-gray-900">
                              {service.duration} tháng
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Template:</span>
                            <span className="font-medium text-gray-900 truncate ml-2">
                              {service.template}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Info */}
              {deal.tax && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                    Thông tin thuế
                  </h4>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Thuế suất:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {deal.tax.rate}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Addons & Timeline */}
            <div className="space-y-4">
              {/* Addons Info */}
              {deal.saleOrderAddons && deal.saleOrderAddons.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                    Addon ({deal.saleOrderAddons.length})
                  </h4>
                  <div className="space-y-2">
                    {deal.saleOrderAddons.map((addon, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded-md border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-xs font-medium text-gray-900 leading-tight">
                            {addon.addonName}
                          </span>
                          <span className="text-xs font-semibold text-green-600 ml-2 whitespace-nowrap">
                            {formatCurrency(addon.unitPrice)}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium text-gray-900">
                              {addon.duration} tháng
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Template:</span>
                            <span className="font-medium text-gray-900 truncate ml-2">
                              {addon.template}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                  Thời gian
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center mb-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                      <span className="font-medium text-gray-600">
                        Dự kiến chốt:
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={
                          editData.expectedCloseDate
                            ? new Date(editData.expectedCloseDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange("expectedCloseDate", e.target.value)
                        }
                        className="block w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <span className="ml-5 text-gray-900">
                        {formatDate(deal.expectedCloseDate)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Ngày tạo:</span>
                    <span className="ml-2 text-gray-900">
                      {formatDate(deal.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Cập nhật:</span>
                    <span className="ml-2 text-gray-900">
                      {formatDate(deal.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-200">
                  Ghi chú
                </h4>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Nhập ghi chú..."
                    className="block w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                ) : (
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {deal.notes || "Chưa có ghi chú"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 text-xs text-yellow-800">
              <strong>Lưu ý:</strong> Thay đổi tỷ lệ thành công sẽ tự động cập
              nhật giai đoạn của deal.
            </div>
          )}
          <div className={`flex space-x-2 ${!isEditing ? "ml-auto" : ""}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {isEditing ? "Hủy & Đóng" : "Đóng"}
            </button>
          </div>
        </div>
      </div>

      {/* Contract Confirm Modal */}
      <ContractConfirmModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        deal={deal}
        customers={customers}
        services={services}
        addons={addons}
        onSuccess={() => {
          setIsContractModalOpen(false);
          showSuccess("Thành công!", "Hợp đồng đã được tạo thành công");
          if (onUpdate) {
            onUpdate();
          }
        }}
      />
    </div>
  );
};

export default DealDetailsModal;
