import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../Context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: 'HomeIcon' },
  { name: 'Customer', path: '/customers', icon: 'UsersIcon' },
  { name: 'Sales order', path: '/sales', icon: 'ChartBarIcon' },
  { name: 'Task', path: '/tasks', icon: 'CalendarIcon' },
  { name: 'Service', path: '/service', icon: 'CogIcon' },
  { name: 'Addons', path: '/addons', icon: 'CogIcon' },
  { name: 'Suppoet', path: '/support', icon: 'LifebuoyIcon' },
  { name: 'Report', path: '/reports', icon: 'DocumentChartBarIcon' },
  { name: 'User management', path: '/usermanagement', icon: 'CogIcon' },
  { name: "HelpDesk", path: "/helpdesk", icon: "LifebuoyIcon" },
];

const iconMap = {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  LifebuoyIcon: SupportIcon,
  DocumentChartBarIcon: DocumentReportIcon,
  CogIcon
};

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-700 text-white"
        >
          {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
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
      <div className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-slate-800 text-white transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 flex-shrink-0 bg-slate-700">
            <h1 className="text-lg lg:text-xl font-bold text-white">ERP System</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = iconMap[item.icon] || HomeIcon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="flex-shrink-0">
            {/* Logout Button */}
            <div className="px-4 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 text-gray-300 hover:bg-red-600 hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">Log-out</span>
              </button>
            </div>

            {/* User info */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">Q</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">Administrator</p>
                  <p className="text-xs text-gray-400 capitalize truncate">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SideBar
