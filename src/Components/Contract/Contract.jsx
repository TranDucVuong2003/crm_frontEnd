import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { getAllContracts, deleteContract } from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showErrorAlert,
  showSuccess,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import ContractCreateModal from "./ContractCreateModal";
import ContractEditModal from "./ContractEditModal";
import ContractPreviewModal from "./ContractPreviewModal";
import QrPaymentModal from "./QrPaymentModal";

const Contract = () => {
  const location = useLocation();
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [editContractId, setEditContractId] = useState(null);
  const [selectedContractForQr, setSelectedContractForQr] = useState(null);

  // Fetch contracts from API
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllContracts();
      if (response.data) {
        setContracts(response.data);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      showErrorAlert("Lỗi", "Không thể tải danh sách hợp đồng");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handlePreviewContract = (contractId) => {
    setSelectedContractId(contractId);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedContractId(null);
  };

  const handleEditContract = (contractId) => {
    setEditContractId(contractId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditContractId(null);
  };

  const handleOpenQrModal = (contract) => {
    setSelectedContractForQr(contract);
    setShowQrModal(true);
  };

  const handleGenerateQR = async (contractId, paymentType, amount) => {
    try {
      showLoading("Đang tạo mã QR...");
      // TODO: Call API to generate QR code
      // const response = await generateQRCode(contractId, paymentType, amount);

      // Tạm thời log để test
      console.log("Generate QR for:", { contractId, paymentType, amount });

      closeLoading();
      // showSuccess("Tạo mã QR thành công!");
      // TODO: Hiển thị QR code trong modal mới hoặc download
    } catch (error) {
      closeLoading();
      console.error("Error generating QR:", error);
      showErrorAlert("Lỗi", "Không thể tạo mã QR");
    }
  };

  const handleDeleteContract = async (contractId, contractTitle) => {
    const confirmed = await showDeleteConfirm(
      "Xóa hợp đồng",
      `Bạn có chắc chắn muốn xóa hợp đồng "${contractTitle}"? Hành động này không thể hoàn tác.`
    );

    if (confirmed) {
      try {
        await deleteContract(contractId);
        showSuccess("Thành công!", "Đã xóa hợp đồng");
        fetchContracts(); // Reload the contracts list
      } catch (error) {
        console.error("Error deleting contract:", error);
        showErrorAlert("Lỗi!", "Không thể xóa hợp đồng. Vui lòng thử lại.");
      }
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      (contract.saleOrder?.title?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (contract.saleOrder?.customer?.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (contract.user?.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesFilter =
      filterStatus === "all" || contract.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý hợp đồng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tất cả hợp đồng của khách hàng
            </p>
          </div>
          {/* <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo hợp đồng mới
          </button> */}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo số hợp đồng, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Hết hạn</option>
              <option value="terminated">Đã kết thúc</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
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
                      <span className="ml-3 text-gray-600">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Contract Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contract.saleOrder?.title || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-2">
                      <div className="text-sm text-gray-900">
                        {contract.saleOrder?.customer?.companyName ||
                          contract.saleOrder?.customer?.name ||
                          "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contract.saleOrder?.customer?.phoneNumber || ""}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-6 py-4">
                      {contract.saleOrder?.services &&
                      contract.saleOrder.services.length > 0 ? (
                        <div className="text-sm font-medium text-gray-900">
                          {contract.saleOrder.services[0].serviceName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.user?.name || "N/A"}
                      </div>
                    </td>

                    {/* Expiration */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.expiration
                          ? new Date(contract.expiration).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(contract.totalAmount || 0)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contract.status}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenQrModal(contract)}
                          disabled={contract.status === "Paid"}
                          className={`p-1 rounded transition-colors ${
                            contract.status === "Paid"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-green-600 hover:text-green-900 hover:bg-green-50"
                          }`}
                          title={
                            contract.status === "Paid"
                              ? "Hợp đồng đã thanh toán"
                              : "Tạo mã QR thanh toán"
                          }
                        >
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePreviewContract(contract.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Xem trước hợp đồng"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditContract(contract.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteContract(
                              contract.id,
                              contract.saleOrder?.title || "Hợp đồng"
                            )
                          }
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Không tìm thấy hợp đồng nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tổng hợp đồng */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.length}
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        {/* Hợp đồng mới */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mới</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  contracts.filter(
                    (c) => c.status === "Mới" || c.status === "New"
                  ).length
                }
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        {/* Đã đặt cọc 50% */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đặt cọc 50%</p>
              <p className="text-2xl font-bold text-orange-600">
                {
                  contracts.filter(
                    (c) =>
                      c.status === "Đặt cọc 50%" || c.status === "Deposit 50%"
                  ).length
                }
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        {/* Đã thanh toán toàn bộ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  contracts.filter(
                    (c) => c.status === "Paid" || c.status === "Đã thanh toán"
                  ).length
                }
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Create Contract Modal */}
      <ContractCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchContracts}
      />

      {/* Edit Contract Modal */}
      {editContractId && (
        <ContractEditModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={fetchContracts}
          contractId={editContractId}
        />
      )}

      {/* Contract Preview Modal */}
      {selectedContractId && (
        <ContractPreviewModal
          contractId={selectedContractId}
          isOpen={showPreviewModal}
          onClose={handleClosePreview}
        />
      )}

      {/* QR Payment Modal */}
      <QrPaymentModal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setSelectedContractForQr(null);
        }}
        contract={selectedContractForQr}
        onGenerateQR={handleGenerateQR}
        onPaymentSuccess={fetchContracts}
      />
    </div>
  );
};

export default Contract;
