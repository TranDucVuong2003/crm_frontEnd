import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import {
  updateContract,
  createMatchedTransaction,
  getAllMatchedTransactions,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
} from "../../utils/sweetAlert";

const MapPaymentModal = ({
  isOpen,
  onClose,
  contractId,
  contractAmount,
  saleOrderId,
  userId,
  currentStatus,
  onSuccess,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [matchedTransactionIds, setMatchedTransactionIds] = useState(new Set());

  // Fetch matched transactions từ API
  const fetchMatchedTransactions = async () => {
    try {
      const response = await getAllMatchedTransactions();
      // Lấy danh sách transactionId đã được match
      const matchedIds = new Set(response.data.map((mt) => mt.transactionId));
      setMatchedTransactionIds(matchedIds);
      return matchedIds;
    } catch (err) {
      console.error("Error fetching matched transactions:", err);
      return new Set();
    }
  };

  // Fetch transactions từ API
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Lấy danh sách các transaction đã được match
      const matchedIds = await fetchMatchedTransactions();

      // Sử dụng Vite proxy để tránh CORS
      const response = await axios.get("/api/sepay/transactions/list", {
        timeout: 10000,
      });

      if (response.data.status === 200 && response.data.messages.success) {
        // Chỉ lấy giao dịch tiền vào (amount_in > 0)
        const incomingTransactions = response.data.transactions.filter(
          (t) => parseFloat(t.amount_in) > 0
        );

        // Filter ra những giao dịch chưa được match
        const unmatchedTransactions = incomingTransactions.filter(
          (t) => !matchedIds.has(t.id)
        );

        setTransactions(unmatchedTransactions);
        setFilteredTransactions(unmatchedTransactions);
      } else {
        showErrorAlert("Lỗi", "Không thể tải dữ liệu giao dịch");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      showErrorAlert(
        "Lỗi",
        "Lỗi khi tải dữ liệu: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Load transactions khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
      setSelectedTransaction(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Search transactions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = transactions.filter(
      (t) =>
        t.transaction_content?.toLowerCase().includes(searchLower) ||
        t.reference_number?.toLowerCase().includes(searchLower) ||
        t.amount_in?.toString().includes(searchLower)
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  // Handle Match Payment
  const handleMapPayment = async () => {
    if (!selectedTransaction) {
      showErrorAlert("Lỗi", "Vui lòng chọn một giao dịch");
      return;
    }

    console.log(
      "Contract Amount received:",
      contractAmount,
      typeof contractAmount
    );

    // Parse contractAmount để đảm bảo nó là số
    const parsedContractAmount = parseFloat(contractAmount);

    if (
      !parsedContractAmount ||
      isNaN(parsedContractAmount) ||
      parsedContractAmount === 0
    ) {
      showErrorAlert(
        "Lỗi",
        `Không tìm thấy số tiền hợp đồng hợp lệ. Giá trị nhận được: ${contractAmount}`
      );
      return;
    }

    try {
      showLoading("Đang Match Payment...", "Vui lòng đợi");

      const transactionAmount = parseFloat(selectedTransaction.amount_in);
      const halfContractAmount = parsedContractAmount / 2;

      // Tính % chênh lệch
      const calculateDifference = (amount, target) => {
        return Math.abs((amount - target) / target) * 100;
      };

      // Xác định trạng thái mới dựa trên số tiền và trạng thái hiện tại
      let newStatus = "";
      let statusMessage = "";

      // Nếu đang ở trạng thái "Đã cọc 50%", chỉ cho phép thanh toán 50% còn lại
      if (currentStatus === "Đã cọc 50%") {
        if (calculateDifference(transactionAmount, halfContractAmount) < 5) {
          newStatus = "Đã thanh toán";
          statusMessage = "Hợp đồng đã được thanh toán đầy đủ (50% còn lại)";
        } else {
          closeLoading();
          showErrorAlert(
            "Lỗi",
            `Số tiền giao dịch ${formatCurrency(
              transactionAmount
            )} không khớp với 50% còn lại: ${formatCurrency(
              halfContractAmount
            )}\n(Cho phép chênh lệch 5%)`
          );
          return;
        }
      }
      // Nếu đang ở trạng thái "Đã ký", cho phép cọc 50% hoặc thanh toán full
      else {
        // Kiểm tra đã thanh toán đủ (chênh lệch < 5%)
        if (calculateDifference(transactionAmount, parsedContractAmount) < 5) {
          newStatus = "Đã thanh toán";
          statusMessage = "Hợp đồng đã được thanh toán đầy đủ";
        }
        // Kiểm tra đã cọc 50% (chênh lệch < 5% so với 1/2 số tiền)
        else if (
          calculateDifference(transactionAmount, halfContractAmount) < 5
        ) {
          newStatus = "Đã cọc 50%";
          statusMessage = "Hợp đồng đã được cọc 50%";
        }
        // Số tiền không khớp
        else {
          closeLoading();
          showErrorAlert(
            "Lỗi",
            `Số tiền giao dịch ${formatCurrency(
              transactionAmount
            )} không khớp với:\n` +
              `- Số tiền hợp đồng: ${formatCurrency(parsedContractAmount)}\n` +
              `- Cọc 50%: ${formatCurrency(halfContractAmount)}\n` +
              `(Cho phép chênh lệch 5%)`
          );
          return;
        }
      }

      // Chuẩn bị dữ liệu Match Payment
      // Chuyển đổi định dạng date từ "2025-11-18 15:22:00" sang "2025-11-18T15:22:00Z"
      const transactionDate = selectedTransaction.transaction_date
        ? selectedTransaction.transaction_date.replace(" ", "T") + "Z"
        : new Date().toISOString();

      const matchPaymentRequest = {
        transactionId: selectedTransaction.id,
        contractId: parseInt(contractId),
        amount: transactionAmount,
        referenceNumber: selectedTransaction.reference_number || null,
        status: newStatus,
        transactionDate: transactionDate,
        transactionContent: selectedTransaction.transaction_content || null,
        bankBrandName: selectedTransaction.bank_brand_name || null,
        accountNumber: selectedTransaction.account_number || null,
        notes: `Matched via MapPaymentModal - ${statusMessage}`,
      };

      // Call API để lưu matched transaction
      const matchedTransactionResponse = await createMatchedTransaction(
        matchPaymentRequest
      );
      console.log(
        "Matched transaction created:",
        matchedTransactionResponse.data
      );

      // Update contract status with saleOrderId and userId
      await updateContract(contractId, {
        status: newStatus,
        saleOrderId: parseInt(saleOrderId),
        userId: parseInt(userId),
      });

      closeLoading();
      showSuccessAlert(
        "Thành công",
        `${statusMessage}. Đã Match Payment thành công!`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error mapping payment:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể Match Payment"
      );
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Match Payment - Chọn Giao Dịch
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Chọn giao dịch ngân hàng để map với hợp đồng #{contractId}
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
          <div className="px-6 py-4">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo nội dung, mã giao dịch, số tiền..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Thông tin:</p>
                  <p>
                    • Chỉ hiển thị giao dịch chưa được match với hợp đồng nào
                  </p>
                  <p>• Sau khi match, giao dịch sẽ không hiển thị lại</p>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
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
                  <span className="ml-3 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Không có giao dịch nào
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => setSelectedTransaction(transaction)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTransaction?.id === transaction.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Button */}
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="transaction"
                            checked={selectedTransaction?.id === transaction.id}
                            onChange={() => setSelectedTransaction(transaction)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 flex items-start justify-between">
                          <div className="flex-1">
                            {/* Transaction Date */}
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <span className="font-medium">
                                {formatDate(transaction.transaction_date)}
                              </span>
                            </div>

                            {/* Transaction Content */}
                            <p className="text-gray-900 font-medium mb-2">
                              {transaction.transaction_content}
                            </p>

                            {/* Reference Number & Bank */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                Mã GD:{" "}
                                <span className="font-mono">
                                  {transaction.reference_number}
                                </span>
                              </span>
                              <span>
                                Ngân hàng: {transaction.bank_brand_name}
                              </span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="flex flex-col items-end ml-4">
                            <span className="text-lg font-bold text-green-600">
                              +{formatCurrency(transaction.amount_in)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedTransaction ? (
                <span className="font-medium text-blue-600">
                  Đã chọn: {selectedTransaction.reference_number}
                </span>
              ) : (
                <span>Chọn một giao dịch để Match Payment</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleMapPayment}
                disabled={!selectedTransaction}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  selectedTransaction
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Xác nhận Match Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPaymentModal;
