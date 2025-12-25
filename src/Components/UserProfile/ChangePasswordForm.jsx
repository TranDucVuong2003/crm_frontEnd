import React, { useState } from "react";
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../Context/AuthContext";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import {
  requestChangePasswordOTP,
  verifyOTPAndChangePassword,
} from "../../Service/ApiService";

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      // Validate password requirements
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
      } else if (!/[A-Z]/.test(formData.newPassword)) {
        newErrors.newPassword = "Phải chứa ít nhất 1 chữ hoa";
      } else if (!/[a-z]/.test(formData.newPassword)) {
        newErrors.newPassword = "Phải chứa ít nhất 1 chữ thường";
      } else if (!/[0-9]/.test(formData.newPassword)) {
        newErrors.newPassword = "Phải chứa ít nhất 1 số";
      } else if (!/[!@#$%^&*]/.test(formData.newPassword)) {
        newErrors.newPassword = "Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      showLoading("Đang gửi mã OTP...");

      // Gửi OTP về email của user
      await requestChangePasswordOTP(user.email);

      closeLoading();
      showSuccessAlert("Thành công", "Mã OTP đã được gửi đến email của bạn");

      // Hiển thị modal nhập OTP
      setShowOTPModal(true);
      setOtp("");
      setOtpError("");

      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error sending OTP:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể gửi mã OTP. Vui lòng thử lại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      showLoading("Đang gửi lại mã OTP...");
      await requestChangePasswordOTP(user.email);
      closeLoading();
      showSuccessAlert(
        "Thành công",
        "Mã OTP mới đã được gửi đến email của bạn"
      );

      // Start countdown again
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending OTP:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message ||
          "Không thể gửi lại mã OTP. Vui lòng thử lại"
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      showLoading("Đang xác thực và đổi mật khẩu...");

      // Xác thực OTP và đổi mật khẩu
      await verifyOTPAndChangePassword({
        email: user.email,
        otp: otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      closeLoading();
      showSuccessAlert("Thành công", "Đổi mật khẩu thành công!");

      // Đóng modal và reset form
      setShowOTPModal(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setOtp("");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      closeLoading();
      setOtpError(
        error.response?.data?.message ||
          "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Đổi mật khẩu
              </h2>
              <p className="text-sm text-gray-600">
                Cập nhật mật khẩu của bạn để bảo mật tài khoản
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="space-y-6">
              {/* Removed current password field */}

              {/* Mật khẩu mới */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <KeyIcon className="h-4 w-4" />
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <KeyIcon className="h-4 w-4" />
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Password requirements */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Yêu cầu mật khẩu:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Tối thiểu 8 ký tự</li>
                <li>Phải khác mật khẩu hiện tại</li>
                <li>Nên bao gồm chữ hoa, chữ thường và số</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Đặt lại
              </button>
            </div>
          </form>

          {/* Security notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý bảo mật:</strong> Không chia sẻ mật khẩu của bạn với
              bất kỳ ai. Hãy đổi mật khẩu định kỳ để bảo vệ tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Xác thực OTP
              </h3>
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                  setOtpError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Mã OTP đã được gửi đến email: <strong>{user?.email}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập mã OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setOtpError("");
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  otpError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mã OTP 6 số"
                maxLength={6}
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
            </div>

            <div className="mb-6 text-sm text-center">
              {countdown > 0 ? (
                <span className="text-gray-600">
                  Gửi lại mã sau{" "}
                  <span className="font-semibold text-blue-600">
                    {countdown}s
                  </span>
                </span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyOTP}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={() => {
                  setShowOTPModal(false);
                  setOtp("");
                  setOtpError("");
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordForm;
