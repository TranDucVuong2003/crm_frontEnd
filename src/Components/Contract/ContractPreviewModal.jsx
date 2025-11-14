import React, { useState, useEffect } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { previewContract, exportContract } from "../../Service/ApiService";

const ContractPreviewModal = ({ contractId, isOpen, onClose }) => {
  const [previewHTML, setPreviewHTML] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch HTML content khi modal mở
  useEffect(() => {
    if (isOpen && contractId) {
      fetchPreview();
    }
  }, [isOpen, contractId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await previewContract(contractId);
      setPreviewHTML(response.data);
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Không thể tải xem trước hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await exportContract(contractId);

      // Tạo URL tạm thời cho blob
      const url = window.URL.createObjectURL(response.data);

      // Tạo link download
      const link = document.createElement("a");
      link.href = url;
      link.download = `contract_${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading contract:", error);
      alert("Không thể tải xuống hợp đồng. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

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
            {loading && (
              <div className="flex items-center justify-center h-[700px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-[700px]">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchPreview}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && previewHTML && (
              <iframe
                srcDoc={previewHTML}
                width="100%"
                height="700px"
                style={{ border: "none", borderRadius: "4px" }}
                title="Contract Preview"
                className="shadow-inner"
              />
            )}
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
