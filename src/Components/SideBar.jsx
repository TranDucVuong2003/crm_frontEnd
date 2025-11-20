import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  LifebuoyIcon as SupportIcon,
  DocumentChartBarIcon as DocumentReportIcon,
  CogIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../Context/AuthContext";
import { getSidebarMenu } from "../Service/ApiService";

const iconMap = {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  LifebuoyIcon: SupportIcon,
  DocumentChartBarIcon: DocumentReportIcon,
  CogIcon,
};

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  // Fetch menu từ API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await getSidebarMenu();

        if (response.data) {
          setMenuItems(response.data.menu || []);
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error("Error fetching sidebar menu:", error);
        // Fallback to empty menu nếu API fail
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [user]); // Re-fetch khi user thay đổi

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-700 text-white"
        >
          {isOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-slate-800 text-white transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 flex-shrink-0 bg-slate-700">
            <h1 className="text-lg lg:text-xl font-bold text-white">
              ERP System
            </h1>
          </div>

          {/* User Role Badge */}
          {userRole && (
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    userRole === "Admin" ? "bg-purple-400" : "bg-blue-400"
                  }`}
                ></div>
                <span className="text-xs font-medium text-slate-300">
                  {userRole === "Admin" ? "👑 Admin Access" : "👤 User Access"}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No menu items available
              </div>
            ) : (
              menuItems.map((item) => {
                const IconComponent = iconMap[item.icon] || HomeIcon;

                // Check if this is a parent menu with children
                if (item.children) {
                  const isExpanded = expandedMenus[item.name];
                  const hasActiveChild = item.children.some(
                    (child) => location.pathname === child.path
                  );

                  return (
                    <div key={item.name}>
                      {/* Parent Menu Item */}
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          hasActiveChild
                            ? "bg-slate-700 text-white"
                            : "text-gray-300 hover:bg-slate-700 hover:text-white"
                        }
                      `}
                      >
                        <div className="flex items-center">
                          <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                        )}
                      </button>

                      {/* Submenu Items with smooth animation */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.path}
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }) => `
                              w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                              ${
                                isActive
                                  ? "bg-slate-600 text-white"
                                  : "text-gray-400 hover:bg-slate-700 hover:text-white"
                              }
                            `}
                            >
                              <span className="truncate">{child.name}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Regular menu item without children
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                    ${
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    }
                  `}
                  >
                    <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })
            )}
          </nav>

          {/* User info at bottom */}
          <div className="flex-shrink-0">
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.fullName?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-400 capitalize truncate">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SideBar;
