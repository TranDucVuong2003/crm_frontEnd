import React, { useState } from "react";
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

const menuItems = [
  { name: "Dashboard", path: "/", icon: "HomeIcon" },
  { name: "Customer", path: "/customers", icon: "UsersIcon" },
  {
    name: "Sale",
    icon: "ChartBarIcon",
    children: [
      { name: "Sales order", path: "/sales" },
      { name: "Contract", path: "/contract" },
    ],
  },
  { name: "Task", path: "/tasks", icon: "CalendarIcon" },
  {
    name: "Service",
    icon: "CogIcon",
    children: [
      { name: "Service", path: "/service" },
      { name: "Addons", path: "/addons" },
    ],
  },
  { name: "Support", path: "/sessions", icon: "LifebuoyIcon" },
  { name: "Report", path: "/reports", icon: "DocumentChartBarIcon" },
  { name: "User management", path: "/usermanagement", icon: "CogIcon" },
  {
    name: "HelpDesk",
    icon: "LifebuoyIcon",
    children: [
      { name: "Tickets", path: "/helpdesk" },
      { name: "Categories", path: "/ticket-categories" },
    ],
  },
];

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
  const { user } = useAuth();
  const location = useLocation();

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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
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
            })}
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
