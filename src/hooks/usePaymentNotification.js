import { useEffect, useState, useCallback } from "react";
import signalRService from "../Service/signalrService";

/**
 * Custom hook để lắng nghe thông báo thanh toán
 * @param {number} contractId - ID của contract cần theo dõi
 * @param {string} hubUrl - URL của SignalR Hub
 * @param {Function} onSuccess - Callback khi thanh toán thành công
 */
export const usePaymentNotification = (contractId, hubUrl, onSuccess) => {
  const [connectionState, setConnectionState] = useState("Disconnected");
  const [error, setError] = useState(null);

  // Memoize callback để tránh re-render không cần thiết
  const handleSuccess = useCallback(
    (data) => {
      if (data.contractId === contractId && onSuccess) {
        onSuccess(data);
      }
    },
    [contractId, onSuccess]
  );

  useEffect(() => {
    if (!contractId || !hubUrl) return;

    let isActive = true;

    const setupSignalR = async () => {
      try {
        // Kết nối SignalR
        await signalRService.connect(hubUrl);

        if (!isActive) return;

        setConnectionState(signalRService.getConnectionState());

        // Tham gia group
        await signalRService.joinContractGroup(contractId);

        // Lắng nghe sự kiện PaymentSuccess
        signalRService.onPaymentSuccess(handleSuccess);

        setError(null);
      } catch (err) {
        console.error("SignalR setup error:", err);
        setError(err.message);
      }
    };

    setupSignalR();

    // Cleanup
    return () => {
      isActive = false;

      if (contractId) {
        signalRService.leaveContractGroup(contractId).catch(console.error);
      }

      signalRService.offPaymentSuccess();
    };
  }, [contractId, hubUrl, handleSuccess]);

  return { connectionState, error };
};
