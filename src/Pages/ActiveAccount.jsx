import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { verifyActivationToken } from "../Service/ApiService";

function ActiveAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("initial"); // initial, verifying, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setStatus("error");
      setMessage("Link kích hoạt không hợp lệ hoặc đã hết hạn");
      return;
    }

    setToken(tokenFromUrl);
    setStatus("initial");
  }, [searchParams]);

  const handleVerifyToken = async () => {
    setStatus("verifying");
    setMessage("");
    setLoading(true);

    try {
      const response = await verifyActivationToken(token);

      console.log("Verify response:", response);
      console.log("Response data:", response.data);

      if (response.data) {
        const userData = response.data.user || response.data;

        setStatus("success");
        setMessage(
          "Xác thực thành công! Bạn có thể đăng nhập bằng mật khẩu tạm thời đã gửi qua email."
        );

        // Chuyển hướng về login sau 2 giây
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message:
                "Tài khoản đã được kích hoạt thành công. Vui lòng đăng nhập bằng mật khẩu tạm thời đã gửi qua email.",
              email: userData.email,
            },
          });
        }, 2000);
      } else {
        setStatus("error");
        setMessage("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Verify error:", error);
      console.error("Error response:", error.response);

      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Link kích hoạt không hợp lệ hoặc đã hết hạn"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleVerifyToken();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo or Brand */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
              <span className="text-white text-3xl font-bold">ERP</span>
            </div>
          </div>

          {/* Initial State - Show Verify Button */}
          {status === "initial" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kích hoạt tài khoản
              </h2>
              <p className="text-gray-600 mb-6">
                Nhấn nút bên dưới để xác thực và kích hoạt tài khoản của bạn
              </p>
              <button
                onClick={handleVerifyToken}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xác thực..." : "Xác thực tài khoản"}
              </button>
            </>
          )}

          {/* Verifying State */}
          {status === "verifying" && (
            <>
              <ArrowPathIcon className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xác thực link kích hoạt
              </h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Xác thực thành công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Đang chuyển hướng đến trang đăng nhập...</span>
              </div>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kích hoạt thất bại
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Đăng nhập
                </button>
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Cần hỗ trợ?{" "}
            <a
              href="mailto:support@crm.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Liên hệ với chúng tôi
            </a>
          </p>
          Kích hoạt thất bại
        </div>
        Kích hoạt thất bại
      </div>
    </div>
  );
}

export default ActiveAccount;
