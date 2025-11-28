import React, { useEffect, useState, useRef } from "react";
import {
  BellIcon,
  MagnifyingGlassIcon as SearchIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Cog6ToothIcon as CogIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
} from "../utils/sweetAlert";
import TaxModal from "./Tax/TaxModal";

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    try {
      setIsLoggingOut(true);
      showLoading("Đang đăng xuất...", "Vui lòng đợi");

      await logout();

      closeLoading();
      showSuccessAlert("Đăng xuất thành công!", "Hẹn gặp lại");

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi đăng xuất",
        "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại."
      );
      setIsLoggingOut(false);
    }
  };

  const theme = {
    primary: "bg-slate-800",
    primaryHover: "hover:bg-slate-900",
    primaryText: "text-slate-800",
    primaryLight: "bg-slate-100",
    accent: "bg-slate-600",
    border: "border-slate-300",
    sidebar: "bg-slate-800",
    sidebarActive: "bg-slate-700",
  };
  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900 ml-12 md:ml-0">
              {title}
            </h1>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  theme?.primary
                    ? `focus:ring-${theme.primary.replace("bg-", "")}`
                    : "focus:ring-indigo-500"
                }`}
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200"
              >
                <div
                  className={`w-8 h-8 ${
                    theme?.accent || "bg-indigo-500"
                  } rounded-full flex items-center justify-center`}
                >
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name || user?.fullName || "User"}
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ease-out ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 
                  transform transition-all duration-200 ease-out origin-top-right
                  ${
                    showUserMenu
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
              >
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to settings page
                      navigate("/settings");
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <CogIcon className="h-5 w-5 mr-3 text-gray-500" />
                    <span>Cài đặt</span>
                  </button> */}

                  {/* Cấu hình - chỉ hiển thị cho Admin */}
                  {user?.role?.toLowerCase() === "admin" && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/configuration");
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <CalculatorIcon className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Cấu hình </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                      isLoggingOut
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {isLoggingOut ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
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
                        <span>Đang xuất...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
                        <span>Đăng xuất</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tax Configuration Modal */}
      <TaxModal isOpen={showTaxModal} onClose={() => setShowTaxModal(false)} />
    </div>
  );
};

export default Header;
