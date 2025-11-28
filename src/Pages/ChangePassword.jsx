import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { changePasswordFirstTime } from "../Service/ApiService";
import { showSuccess, showError } from "../utils/sweetAlert";

function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const mustChangePassword = location.state?.mustChangePassword || false;
  const welcomeMessage = location.state?.message || "";

  useEffect(() => {
    // Kiểm tra xem user có token không
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // Không có token, chuyển về login
      navigate("/login", { replace: true });
      return;
    }

    // Kiểm tra xem có phải từ trang login với firstLogin không
    if (!mustChangePassword && !location.state?.message) {
      // Nếu không có state từ login, có thể user đang cố truy cập trực tiếp
      // Kiểm tra xem đã authenticated chưa
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, mustChangePassword, location.state]);

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Mật khẩu phải có ít nhất 8 ký tự");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Phải chứa ít nhất 1 chữ hoa");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Phải chứa ít nhất 1 chữ thường");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Phải chứa ít nhất 1 số");
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await changePasswordFirstTime({
        newPassword,
        confirmPassword,
      });

      if (response.data) {
        // Hiển thị thông báo thành công và chờ user xác nhận
        await showSuccess(
          "Đổi mật khẩu thành công!",
          "Bạn sẽ được chuyển đến trang đăng nhập để đăng nhập lại với mật khẩu mới."
        );

        // Xóa token cũ từ localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Xóa cookies nếu có
        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Chỉ set success và chuyển hướng sau khi user đã xác nhận alert
        setSuccess(true);

        // Chuyển hướng về login
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.",
          },
        });
      }
    } catch (err) {
      // Dừng loading để hiển thị lỗi
      setLoading(false);

      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";

      // Hiển thị lỗi trong UI
      setError(errorMessage);

      // Hiển thị thông báo lỗi (không chờ nữa vì setError đã hiển thị)
      await showError("Đổi mật khẩu thất bại", errorMessage);

      return; // Dừng lại, không chuyển hướng
    } finally {
      // Chỉ set loading false nếu không có lỗi (lỗi đã set ở catch)
      if (!error) {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
                <span className="text-white text-3xl font-bold">ERP</span>
              </div>
            </div>

            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đổi mật khẩu thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có thể đăng nhập lại với mật khẩu mới
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>Đang chuyển hướng đến trang đăng nhập...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo or Brand */}
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <ShieldCheckIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đổi mật khẩu
            </h2>
            {mustChangePassword && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Bạn phải đổi mật khẩu trước khi tiếp tục sử dụng hệ thống
                </p>
              </div>
            )}
            {welcomeMessage && !mustChangePassword && (
              <p className="text-gray-600 text-sm mt-2">{welcomeMessage}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium mb-2">
                <strong>Yêu cầu mật khẩu:</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Tối thiểu 8 ký tự</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Ít nhất 1 chữ hoa (A-Z)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Ít nhất 1 chữ thường (a-z)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Ít nhất 1 số (0-9)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
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
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
