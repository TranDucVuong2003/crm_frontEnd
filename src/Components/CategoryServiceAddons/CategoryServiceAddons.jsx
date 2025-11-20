import React, { useState, useEffect } from "react";
import {
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  getAllCategoryServiceAddons,
  deleteCategoryServiceAddon,
  getCategoryServiceAddonById,
} from "../../Service/ApiService";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import CategoryServiceAddonModal from "./CategoryServiceAddonModal";
import CategoryServiceAddonDetailModal from "./CategoryServiceAddonDetailModal";

const CategoryServiceAddons = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCategoryServiceAddons();


      // Handle different response structures
      let categoriesList = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          categoriesList = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          categoriesList = response.data.data;
        } else if (
          response.data.categories &&
          Array.isArray(response.data.categories)
        ) {
          categoriesList = response.data.categories;
        } else {
          console.warn("Unexpected response structure:", response.data);
          categoriesList = [];
        }
      }

      // If services and addons are not included, fetch details for each category
      // This ensures we have the count for display
      if (categoriesList.length > 0 && !categoriesList[0].services) {
        console.log("Fetching detailed info for each category...");
        const detailedCategories = await Promise.all(
          categoriesList.map(async (cat) => {
            try {
              const detailResponse = await getCategoryServiceAddonById(cat.id);
              return detailResponse.data;
            } catch (err) {
              console.error(`Error fetching category ${cat.id}:`, err);
              return cat; // Return original if fetch fails
            }
          })
        );
        setCategories(detailedCategories);
      } else {
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showError("Lỗi!", "Không thể tải danh sách danh mục");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleViewCategory = (category) => {
    setViewingCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    const result = await showDeleteConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa danh mục này?"
    );

    if (result.isConfirmed) {
      try {
        await deleteCategoryServiceAddon(id);
        showSuccess("Thành công!", "Đã xóa danh mục");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        showError("Lỗi!", "Không thể xóa danh mục");
      }
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CubeIcon className="h-8 w-8 mr-2 text-indigo-600" />
              Quản lý Danh mục Dịch vụ & Addon
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các danh mục cho dịch vụ và addon
            </p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Danh mục
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Addon
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
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
                      <span className="ml-3 text-gray-600">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{category.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.services?.length || 0} dịch vụ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {category.addons?.length || 0} addon
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCategory(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Không có danh mục
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bắt đầu bằng cách tạo danh mục mới.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm Danh mục
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CategoryServiceAddonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={fetchCategories}
      />

      <CategoryServiceAddonDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingCategory(null);
        }}
        category={viewingCategory}
      />
    </div>
  );
};

export default CategoryServiceAddons;
