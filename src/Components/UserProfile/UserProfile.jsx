import React, { useState } from "react";
import { UserIcon, BanknotesIcon, KeyIcon } from "@heroicons/react/24/outline";
import PersonalInfo from "./PersonalInfo";
import Salary from "./Salary";
import ChangePasswordForm from "./ChangePasswordForm";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    {
      id: "personal",
      label: "Thông tin cá nhân",
      icon: UserIcon,
    },
    {
      id: "salary",
      label: "Lương",
      icon: BanknotesIcon,
    },
    {
      id: "password",
      label: "Đổi mật khẩu",
      icon: KeyIcon,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalInfo />;
      case "salary":
        return <Salary />;
      case "password":
        return <ChangePasswordForm />;
      default:
        return <PersonalInfo />;
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

export default UserProfile;
