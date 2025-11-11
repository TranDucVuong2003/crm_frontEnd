import React, { useState, useEffect } from "react";
import { XMarkIcon, CubeIcon, CogIcon } from "@heroicons/react/24/outline";
import { getCategoryServiceAddonById } from "../../Service/ApiService";
import { showError } from "../../utils/sweetAlert";

const CategoryServiceAddonDetailModal = ({ isOpen, onClose, category }) => {
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'services', 'addons'

  useEffect(() => {
    if (isOpen && category?.id) {
      fetchCategoryDetails();
    }
  }, [isOpen, category]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);

      // Fetch full category details including services and addons
      const response = await getCategoryServiceAddonById(category.id);
      setCategoryDetails(response.data);
    } catch (error) {
      console.error("Error fetching category details:", error);
      showError("Lỗi!", "Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!isOpen || !category) return null;

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
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết Danh mục
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "info"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Thông tin
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "services"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dịch vụ ({categoryDetails?.services?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("addons")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "addons"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Addons ({categoryDetails?.addons?.length || 0})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600"
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
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <>
                {/* Info Tab */}
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        ID
                      </label>
                      <p className="text-lg text-gray-900">
                        #{categoryDetails?.id}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Tên danh mục
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {categoryDetails?.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Số lượng dịch vụ
                        </label>
                        <p className="text-2xl font-bold text-blue-900">
                          {categoryDetails?.services?.length || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-purple-700 mb-2">
                          Số lượng addon
                        </label>
                        <p className="text-2xl font-bold text-purple-900">
                          {categoryDetails?.addons?.length || 0}
                        </p>
                      </div>
                    </div>

                    {categoryDetails?.createdAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Ngày tạo
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(categoryDetails.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}

                    {categoryDetails?.updatedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Cập nhật lần cuối
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(categoryDetails.updatedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === "services" && (
                  <div>
                    {categoryDetails?.services &&
                    categoryDetails.services.length > 0 ? (
                      <div className="space-y-3">
                        {categoryDetails.services.map((service) => (
                          <div
                            key={service.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <CogIcon className="h-5 w-5 text-blue-500 mr-2" />
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {service.name}
                                  </h4>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {service.description || "Không có mô tả"}
                                </p>
                                <div className="mt-2 flex items-center space-x-4">
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPrice(service.price)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    SL: {service.quantity}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      service.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {service.isActive
                                      ? "Hoạt động"
                                      : "Không hoạt động"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Chưa có dịch vụ
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Danh mục này chưa có dịch vụ nào.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Addons Tab */}
                {activeTab === "addons" && (
                  <div>
                    {categoryDetails?.addons &&
                    categoryDetails.addons.length > 0 ? (
                      <div className="space-y-3">
                        {categoryDetails.addons.map((addon) => (
                          <div
                            key={addon.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <CubeIcon className="h-5 w-5 text-purple-500 mr-2" />
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {addon.name}
                                  </h4>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {addon.description || "Không có mô tả"}
                                </p>
                                <div className="mt-2 flex items-center space-x-4">
                                  <span className="text-sm font-medium text-green-600">
                                    {formatPrice(addon.price)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    SL: {addon.quantity}
                                  </span>
                                  {addon.type && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      {addon.type}
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      addon.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {addon.isActive
                                      ? "Hoạt động"
                                      : "Không hoạt động"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Chưa có addon
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Danh mục này chưa có addon nào.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t">
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

export default CategoryServiceAddonDetailModal;
