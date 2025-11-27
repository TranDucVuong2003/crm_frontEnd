import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { verifyActivationToken, login } from "../Service/ApiService";

function ActiveAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("initial"); // initial, verifying, login, success, error
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
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

      if (response.data) {
        setUserEmail(response.data.user.email);
        setUserName(response.data.user.name);
        setStatus("login");
        setMessage(
          "Token hợp lệ. Vui lòng đăng nhập bằng mật khẩu tạm thời đã gửi qua email."
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Link kích hoạt không hợp lệ hoặc đã hết hạn"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const loginData = {
        email: userEmail,
        password: password,
        deviceInfo: navigator.userAgent,
      };

      const response = await login(loginData);

      if (response.data) {
        // Lưu access token
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.firstLogin) {
          // Nếu là lần đầu đăng nhập, chuyển đến trang đổi mật khẩu
          setStatus("success");
          setMessage(
            response.data.message ||
              "Đăng nhập thành công! Bạn cần đổi mật khẩu trước khi tiếp tục."
          );

          setTimeout(() => {
            navigate("/change-password", {
              state: {
                message: response.data.message,
                mustChangePassword: true,
              },
            });
          }, 2000);
        } else {
          // Redirect to dashboard
          setStatus("success");
          setMessage("Đăng nhập thành công!");
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu."
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

          {/* Login State */}
          {status === "login" && (
            <>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Kích hoạt tài khoản
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  Xin chào, <strong>{userName}</strong>
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu tạm thời
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Nhập mật khẩu từ email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Mật khẩu đã được gửi qua email
                    </p>
                  </div>

                  {message && message.includes("Token hợp lệ") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-600">{message}</p>
                    </div>
                  )}

                  {message && !message.includes("Token hợp lệ") && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{message}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xử lý..." : "Đăng nhập"}
                  </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Sau khi đăng nhập, bạn sẽ được yêu cầu đổi mật khẩu</p>
                </div>
              </div>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Thành công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Đang chuyển hướng...</span>
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
