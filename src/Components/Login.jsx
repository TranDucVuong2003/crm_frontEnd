import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { login as apiLogin } from "../Service/ApiService";
import { useAuth } from "../Context/AuthContext";

// Utility function to get device information
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browserName = "Unknown Browser";
  let browserVersion = "Unknown";
  let osName = "Unknown OS";

  // Detect Browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browserName = "Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Firefox")) {
    browserName = "Firefox";
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browserName = "Safari";
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Edg")) {
    browserName = "Edge";
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("MSIE") || ua.includes("Trident")) {
    browserName = "Internet Explorer";
  }

  // Detect OS
  if (ua.includes("Windows NT 10.0")) {
    // Windows 11 và Windows 10 đều có NT 10.0
    // Phát hiện Windows 11 qua User Agent Client Hints API hoặc platform version
    const isWindows11 =
      navigator.userAgentData?.platform === "Windows" &&
      navigator.userAgentData?.platformVersion?.startsWith("13");
    osName = isWindows11 ? "Windows 11" : "Windows 10/11";
  } else if (ua.includes("Windows NT 11.0")) {
    osName = "Windows 11";
  } else if (ua.includes("Windows NT 6.3")) {
    osName = "Windows 8.1";
  } else if (ua.includes("Windows NT 6.2")) {
    osName = "Windows 8";
  } else if (ua.includes("Windows NT 6.1")) {
    osName = "Windows 7";
  } else if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    osName = match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
  } else if (ua.includes("Linux")) {
    osName = "Linux";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+)/);
    osName = match ? `Android ${match[1]}` : "Android";
  } else if (
    ua.includes("iOS") ||
    ua.includes("iPhone") ||
    ua.includes("iPad")
  ) {
    const match = ua.match(/OS (\d+)/);
    osName = match ? `iOS ${match[1]}` : "iOS";
  }

  return `${browserName} ${browserVersion} on ${osName}`;
};

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setValidationErrors({});

    // Simple validation
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email";
    }
    if (!formData.password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Get device information
      const deviceInfo = getDeviceInfo();

      // Call real login API with device info
      const response = await apiLogin({
        email: formData.email,
        password: formData.password,
        deviceInfo: deviceInfo,
      });

      // Check if login successful
      if (response.data) {
        // Handle new response structure from backend
        const { accessToken, user, expiresAt, message, firstLogin } =
          response.data;

        if (accessToken && user) {
          // Check if user needs to change password on first login
          if (firstLogin) {
            // Store token temporarily in localStorage (not in AuthContext)
            // This allows the change password API to work, but doesn't authenticate the user
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));

            // Redirect to change password page
            navigate("/change-password", {
              replace: true,
              state: {
                message:
                  message ||
                  "Bạn phải đổi mật khẩu trước khi đăng nhập vào hệ thống",
                mustChangePassword: true,
              },
            });
          } else {
            // Use AuthContext login method with new token structure
            // This authenticates the user and allows access to protected routes
            login(accessToken, user);

            // Redirect to intended page or dashboard
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
          }
        } else {
          setError("Không nhận được token từ server");
        }
      } else {
        setError("Phản hồi từ server không hợp lệ");
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError(err.response.data.message ? "Email hoặc mật khẩu không đúng": "");
        } else if (err.response.status === 400) {
          console.log("looooooooooooooooooooooooooooo", err.response.data.message)
          setError(err.response.data.message);
        } else {
          setError(err.response.data.message ? "Có lỗi xảy ra từ server. Vui lòng thử lại." : "");
        }
      } else if (err.request) {
        // Network error
        setError("Không thể kết nối đến server. Kiểm tra kết nối mạng.");
      } else {
        // Other errors
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          ERP System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đăng nhập để tiếp tục
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          {/* Success Message from previous action (like password change) */}
          {location.state?.message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{location.state.message}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    validationErrors.email
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    validationErrors.password
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Login Error */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              {/* <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Tài khoản demo</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 ERP System. Bảo mật thông tin với JWT & RBAC.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
