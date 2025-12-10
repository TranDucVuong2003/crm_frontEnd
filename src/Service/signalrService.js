import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Khởi tạo kết nối SignalR
   * @param {string} hubUrl - URL của SignalR Hub (VD: "https://api.yourdomain.com/paymentHub")
   * @param {string} accessToken - JWT token (optional, nếu cần authentication)
   */
  async connect(hubUrl, accessToken = null) {
    if (this.isConnected) {
      console.log("✅ SignalR already connected");
      return this.connection;
    }

    try {
      const builder = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => accessToken || "",
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Retry sau 0s, 2s, 10s, 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          },
        })
        .configureLogging(signalR.LogLevel.Information);

      this.connection = builder.build();

      // Event handlers
      this.connection.onclose(() => {
        this.isConnected = false;
        console.log("❌ SignalR connection closed");
      });

      this.connection.onreconnecting((error) => {
        this.isConnected = false;
        console.log("🔄 SignalR reconnecting...", error);
      });

      this.connection.onreconnected(() => {
        this.isConnected = true;
        console.log("✅ SignalR reconnected");
      });

      await this.connection.start();
      this.isConnected = true;
      console.log("✅ SignalR connected successfully");

      return this.connection;
    } catch (error) {
      console.error("❌ SignalR connection error:", error);
      throw error;
    }
  }

  /**
   * Tham gia nhóm theo Contract ID
   * @param {number} contractId - ID của contract
   */
  async joinContractGroup(contractId) {
    if (!this.isConnected || !this.connection) {
      throw new Error("SignalR not connected. Call connect() first.");
    }

    try {
      await this.connection.invoke("JoinContractGroup", contractId);
      console.log(`🔗 Joined Contract_${contractId} group`);
    } catch (error) {
      console.error("❌ Error joining contract group:", error);
      throw error;
    }
  }

  /**
   * Rời khỏi nhóm
   * @param {number} contractId - ID của contract
   */
  async leaveContractGroup(contractId) {
    if (!this.isConnected || !this.connection) return;

    try {
      await this.connection.invoke("LeaveContractGroup", contractId);
      console.log(`🔌 Left Contract_${contractId} group`);
    } catch (error) {
      console.error("❌ Error leaving contract group:", error);
    }
  }

  /**
   * Lắng nghe sự kiện PaymentSuccess
   * @param {Function} callback - Callback function khi nhận được thông báo
   */
  onPaymentSuccess(callback) {
    if (!this.connection) {
      throw new Error("SignalR not connected. Call connect() first.");
    }

    this.connection.on("PaymentSuccess", (data) => {
      console.log("✅ Payment success received:", data);
      callback(data);
    });
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  offPaymentSuccess() {
    if (this.connection) {
      this.connection.off("PaymentSuccess");
    }
  }

  /**
   * Ngắt kết nối
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      console.log("🔌 SignalR disconnected");
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  getConnectionState() {
    if (!this.connection) return "Disconnected";

    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return "Connected";
      case signalR.HubConnectionState.Connecting:
        return "Connecting";
      case signalR.HubConnectionState.Reconnecting:
        return "Reconnecting";
      case signalR.HubConnectionState.Disconnected:
        return "Disconnected";
      default:
        return "Unknown";
    }
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
