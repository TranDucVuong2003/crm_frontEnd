import React from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const ContractPreviewModal = ({ contractId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const baseURL = import.meta.env.VITE_BASE_URL || "https://localhost:7210";
  const previewURL = `${baseURL}/api/contracts/${contractId}/preview`;
  const exportURL = `${baseURL}/api/contracts/${contractId}/export-contract`;

  const handleDownload = () => {
    window.open(exportURL, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Xem trước hợp đồng
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Tải xuống PDF
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <iframe
              src={previewURL}
              width="100%"
              height="700px"
              style={{ border: "none", borderRadius: "4px" }}
              title="Contract Preview"
              className="shadow-inner"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreviewModal;
