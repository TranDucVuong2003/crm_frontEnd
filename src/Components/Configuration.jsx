import React, { useState } from "react";
import {
  UserIcon,
  DocumentTextIcon,
  FolderIcon,
  CubeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import RoleManagement from "./Configuration/RoleManagement";
import PositionManagement from "./Configuration/PositionManagement";
import DepartmentManagement from "./Configuration/DepartmentManagement";
import TaxManagement from "./Configuration/TaxManagement";
import ResionManagement from "./Configuration/ReasionManagement";
import CategoryServiceAddonManagement from "./Configuration/CategoryServiceAddonManagement";
import InsuranceManagement from "./Configuration/InsuranceManagement";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    {
      id: "personal",
      label: "Phân quyền",
      icon: UserIcon,
    },
    {
      id: "profile",
      label: "Chức vụ",
      icon: DocumentTextIcon,
    },
    {
      id: "storage",
      label: "Phòng ban",
      icon: FolderIcon,
    },
    {
      id: "tax",
      label: "Thuế",
      icon: DocumentTextIcon,
    },
    {
      id: "insurance",
      label: "Bảo hiểm",
      icon: ShieldCheckIcon,
    },
    {
      id: "resion",
      label: "Khu vực",
      icon: FolderIcon,
    },
    {
      id: "category",
      label: "Danh mục dịch vụ",
      icon: CubeIcon,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <RoleManagement />;
      case "profile":
        return <PositionManagement />;
      case "storage":
        return <DepartmentManagement />;
      case "tax":
        return <TaxManagement />;
      case "insurance":
        return <InsuranceManagement />;
      case "resion":
        return <ResionManagement />;
      case "category":
        return <CategoryServiceAddonManagement />;
      default:
        return <RoleManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-9xl mx-auto">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative cursor-pointer ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Configuration;
