import React, { useEffect } from "react";
import {
  BellIcon,
  MagnifyingGlassIcon as SearchIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This will run when the component mounts
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const theme = 
{
    primary: 'bg-slate-800',
    primaryHover: 'hover:bg-slate-900',
    primaryText: 'text-slate-800',
    primaryLight: 'bg-slate-100',
    accent: 'bg-slate-600',
    border: 'border-slate-300',
    sidebar: 'bg-slate-800',
    sidebarActive: 'bg-slate-700'}
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="hidden md:block">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
