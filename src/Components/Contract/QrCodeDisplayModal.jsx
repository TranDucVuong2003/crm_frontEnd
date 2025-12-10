import React from "react";
import {
  XMarkIcon,
  QrCodeIcon,
  BanknotesIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { showSuccess } from "../../utils/sweetAlert";

const QrCodeDisplayModal = ({ isOpen, onClose, qrData }) => {
  if (!isOpen || !qrData) return null;

  const { qrCodeUrl, paymentInfo, paymentTypeDisplay, contractNumber } = qrData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess("Đã sao chép!", `${label} đã được sao chép vào clipboard`);
    });
  };

  return (
    <div 
    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <QrCodeIcon className="h-6 w-6 text-indigo-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">
              Tạo mã QR thanh toán
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Contract Info */}
          <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hợp đồng số</p>
                <p className="text-2xl font-bold text-indigo-600">
                  #{contractNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{paymentTypeDisplay}</p>
                <p className="text-xl font-semibold text-green-600">
                  {paymentInfo.amountFormatted} đ
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin hợp đồng */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5" />
              Thông tin hợp đồng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-md p-3">
                <span className="text-gray-500 text-xs block mb-1">
                  Số hợp đồng:
                </span>
                <p className="font-semibold text-gray-900">#{contractNumber}</p>
              </div>
              <div className="bg-white rounded-md p-3">
                <span className="text-gray-500 text-xs block mb-1">
                  Tổng giá trị:
                </span>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(paymentInfo.totalAmount)}
                </p>
              </div>
              <div className="bg-white rounded-md p-3">
                <span className="text-gray-500 text-xs block mb-1">
                  Đã thanh toán:
                </span>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(paymentInfo.totalAmount - paymentInfo.amount)}
                </p>
              </div>
              <div className="bg-white rounded-md p-3">
                <span className="text-gray-500 text-xs block mb-1">
                  Còn lại:
                </span>
                <p className="font-semibold text-orange-600">
                  {formatCurrency(paymentInfo.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mb-6 text-center">
            <div className="inline-block bg-white p-4 rounded-lg shadow-md border-2 border-indigo-200">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64 mx-auto"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/256?text=QR+Error";
                }}
              />
              <p className="mt-3 text-sm text-gray-600">
                Quét mã QR để thanh toán
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Chọn phương thức thanh toán{" "}
              <span className="text-red-500">*</span>
            </h4>

            {/* Payment Options */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="50"
                    checked={paymentTypeDisplay.includes("50%")}
                    readOnly
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Thanh toán 50% (Đặt cọc)
                    </p>
                    <p className="text-xs text-gray-500">
                      Số tiền: {formatCurrency(paymentInfo.amount)}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-indigo-600">
                  {formatCurrency(paymentInfo.amount)}
                </span>
              </label>

              <label className="flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="100"
                    checked={paymentTypeDisplay.includes("100%")}
                    readOnly
                    className="h-4 w-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Thanh toán 100% (Toàn bộ)
                    </p>
                    <p className="text-xs text-gray-500">
                      Số tiền: {formatCurrency(paymentInfo.amount)}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-indigo-600">
                  {formatCurrency(paymentInfo.amount)}
                </span>
              </label>
            </div>

            {/* Bank Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Ngân hàng:</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {paymentInfo.bankName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {paymentInfo.bankCode}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-900">
                    {paymentInfo.accountNumber}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(paymentInfo.accountNumber, "Số tài khoản")
                    }
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                <span className="font-semibold text-gray-900">
                  {paymentInfo.accountName}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(paymentInfo.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nội dung:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-gray-900">
                    {paymentInfo.description}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        paymentInfo.description,
                        "Nội dung chuyển khoản"
                      )
                    }
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                {paymentInfo.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeDisplayModal;
