import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  XMarkIcon,
  QrCodeIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { showError, showSuccess } from "../../utils/sweetAlert";
import { getContractQRCode } from "../../Service/ApiService";
import { usePaymentNotification } from "../../hooks/usePaymentNotification";
import API_ENDPOINT from "../../Constant/apiEndpoint.constant";
import domtoimage from "dom-to-image-more";

const QrPaymentModal = ({
  isOpen,
  onClose,
  contract,
  onGenerateQR,
  onPaymentSuccess,
}) => {
  const [paymentOption, setPaymentOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const paymentInfoRef = useRef(null);

  // SignalR Hub URL
  const SIGNALR_HUB_URL = API_ENDPOINT.BASE_URL + "/paymentHub";

  // Callback khi thanh toán thành công
  const handlePaymentSuccess = useCallback(
    (data) => {
      console.log("🎉 Payment success received:", data);

      // Hiển thị thông báo thành công với thời gian 3 giây
      showSuccess(
        "Thanh toán thành công!",
        data.message || "Giao dịch đã được xác nhận",
        {
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }
      );

      // Cập nhật UI
      setPaymentCompleted(true);

      // Đóng modal và reload data sau 3 giây
      setTimeout(() => {
        handleClose();
        // Gọi callback để refetch data thay vì reload toàn bộ trang
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 3000);
    },
    [onPaymentSuccess]
  );

  // Sử dụng custom hook để lắng nghe SignalR
  const { connectionState, error } = usePaymentNotification(
    contract?.id,
    SIGNALR_HUB_URL,
    handlePaymentSuccess
  );

  // Reset payment completed khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setPaymentCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen || !contract) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalAmount = contract.saleOrder?.value || 0;
  const paidAmount = contract.paidAmount || 0;
  const remainingAmount = totalAmount - paidAmount;

  // Xác định các tùy chọn thanh toán dựa trên status
  const paymentOptions = [];

  // Kiểm tra status để xác định options
  const status = contract.status;

  if (status === "Mới" || status === "New") {
    // Chưa thanh toán gì - hiển thị 2 options
    paymentOptions.push(
      {
        value: "50",
        label: "Thanh toán 50% (Đặt cọc)",
        amount: totalAmount * 0.5,
      },
      { value: "100", label: "Thanh toán 100% (Toàn bộ)", amount: totalAmount }
    );
  } else if (status === "Deposit 50%" || status === "Đặt cọc 50%") {
    // Đã cọc 50% - chỉ hiển thị thanh toán nốt
    paymentOptions.push({
      value: "remaining",
      label: "Thanh toán nốt 50%",
      amount: totalAmount * 0.5,
    });
  }
  // Nếu status là "Paid" thì không có options nào (modal không nên mở)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentOption) {
      showError("Lỗi!", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    setLoading(true);
    try {
      // Xác định paymentType dựa trên lựa chọn
      let paymentType = "";
      if (paymentOption === "50") {
        paymentType = "deposit50";
      } else if (paymentOption === "100") {
        paymentType = "full100";
      } else if (paymentOption === "remaining") {
        paymentType = "final50";
      }

      // Gọi API để lấy QR code
      const response = await getContractQRCode(contract.id, paymentType);
      setQrData(response.data);
      setShowQR(true);

      // Gọi callback nếu có
      if (onGenerateQR) {
        await onGenerateQR(contract.id, paymentOption);
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      showError("Lỗi!", "Không thể tạo mã QR. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentOption("");
    setQrData(null);
    setShowQR(false);
    setPaymentCompleted(false);
    onClose();
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full transition-all duration-300 ${
          showQR ? "max-w-5xl" : "max-w-md"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Tạo mã QR thanh toán
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {/* Copy Button */}
            {showQR && qrData && (
              <button
                onClick={async () => {
                  try {
                    if (!paymentInfoRef.current) return;

                    // Clone element và xóa tất cả border trước khi chụp
                    const allElements =
                      paymentInfoRef.current.querySelectorAll("*");
                    const originalStyles = [];

                    // Lưu style cũ và xóa border
                    allElements.forEach((el, index) => {
                      originalStyles[index] = {
                        border: el.style.border,
                        outline: el.style.outline,
                        boxShadow: el.style.boxShadow,
                        display: el.style.display,
                      };
                      el.style.border = "none";
                      el.style.outline = "none";

                      // Ẩn element có data-html2canvas-ignore
                      if (
                        el.getAttribute("data-html2canvas-ignore") === "true"
                      ) {
                        el.style.display = "none";
                      }
                    });

                    // Sử dụng dom-to-image-more thay vì html2canvas
                    const blob = await domtoimage.toBlob(
                      paymentInfoRef.current,
                      {
                        quality: 1.0,
                        width: paymentInfoRef.current.scrollWidth * 2,
                        height: paymentInfoRef.current.scrollHeight * 2,
                        style: {
                          transform: "scale(2)",
                          transformOrigin: "top left",
                          width: paymentInfoRef.current.scrollWidth + "px",
                          height: paymentInfoRef.current.scrollHeight + "px",
                        },
                      }
                    );

                    // Restore style cũ
                    allElements.forEach((el, index) => {
                      el.style.border = originalStyles[index].border;
                      el.style.outline = originalStyles[index].outline;
                      el.style.boxShadow = originalStyles[index].boxShadow;
                      el.style.display = originalStyles[index].display;
                    });

                    if (!blob) {
                      showError("Lỗi!", "Không thể tạo ảnh. Vui lòng thử lại.");
                      return;
                    }

                    // Copy blob vào clipboard
                    try {
                      if (navigator.clipboard && navigator.clipboard.write) {
                        await navigator.clipboard.write([
                          new ClipboardItem({
                            "image/png": blob,
                          }),
                        ]);
                        showSuccess(
                          "Đã sao chép!",
                          "Hình ảnh thông tin thanh toán đã được sao chép",
                          { timer: 2000, showConfirmButton: false }
                        );
                      } else {
                        showError(
                          "Lỗi!",
                          "Trình duyệt không hỗ trợ sao chép hình ảnh."
                        );
                      }
                    } catch (err) {
                      console.error("Error copying image:", err);
                      showError(
                        "Lỗi!",
                        "Không thể sao chép hình ảnh. (Lỗi Clipboard)"
                      );
                    }
                  } catch (error) {
                    console.error("Error capturing image:", error);
                    showError(
                      "Lỗi!",
                      "Không thể chụp ảnh. Chi tiết: " + error.message
                    );
                  }
                }}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                Sao chép
              </button>
            )}
            {/* Connection Status */}
            {showQR && (
              <div className="flex items-center gap-2">
                {connectionState === "Connected" ? (
                  <span className="flex items-center text-xs text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5"></span>
                    Đang chờ thanh toán...
                  </span>
                ) : connectionState === "Reconnecting" ? (
                  <span className="flex items-center text-xs text-yellow-600 font-medium">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-1.5"></span>
                    Đang kết nối lại...
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-red-600 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                    Mất kết nối
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={`grid ${showQR ? "grid-cols-2 divide-x" : "grid-cols-1"}`}
        >
          {/* Left Side - Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Thông tin hợp đồng */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Thông tin hợp đồng
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên hợp đồng:</span>
                  <span className="font-medium">
                    {contract.saleOrder?.title || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá trị:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Còn lại:</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tùy chọn thanh toán */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn phương thức thanh toán{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentOption === option.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentOption"
                        value={option.value}
                        checked={paymentOption === option.value}
                        onChange={(e) => setPaymentOption(e.target.value)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Số tiền: {formatCurrency(option.amount)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(option.amount)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !paymentOption}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <QrCodeIcon className="h-5 w-5" />
                {loading ? "Đang tạo..." : "Tạo mã QR"}
              </button>
            </div>
          </form>

          {/* Right Side - QR Code Display */}
          {showQR && qrData && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div
                ref={paymentInfoRef}
                className="flex flex-col items-center justify-center h-full p-6"
              >
                {/* Success Badge - Ẩn khi chụp ảnh */}
                <div
                  className="mb-4 flex items-center gap-2 text-green-600"
                  data-html2canvas-ignore="true"
                >
                  <CheckCircleIcon className="h-6 w-6" />
                  <span className="font-semibold">Tạo mã QR thành công!</span>
                </div>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                  <img
                    src={qrData.qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>

                {/* Payment Information */}
                <div className="w-full max-w-sm space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                      Thông tin thanh toán
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-medium text-right">
                          {qrData.paymentInfo.bankName}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Số tài khoản:</span>
                        <span className="font-mono font-semibold">
                          {qrData.paymentInfo.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Người nhận:</span>
                        <span className="font-medium">
                          {qrData.paymentInfo.accountName}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 pt-2">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-bold text-lg text-green-600">
                          {qrData.paymentInfo.amountFormatted} ₫
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Nội dung:</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {qrData.paymentInfo.description}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Loại thanh toán:</span>
                        <span className="font-medium text-indigo-600">
                          {qrData.paymentTypeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-red-600">
                      {/* <strong>Lưu ý:</strong>  */}
                      Quý khách vui lòng không thay đổi nội dung chuyển khoản.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Success Overlay */}
        {paymentCompleted && (
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="absolute inset-0 bg-opacity-70 flex items-center justify-center z-50 rounded-lg"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md animate-scale-in">
              <div className="mb-4 flex justify-center">
                <CheckBadgeIcon className="h-20 w-20 text-green-500 animate-bounce-in" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-gray-600 mb-4">
                Giao dịch đã được xác nhận. Đang cập nhật dữ liệu...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrPaymentModal;
