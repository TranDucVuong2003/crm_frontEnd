import React, { useState, useEffect } from "react";
import {
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getAllTicketCategories,
  deleteTicketCategory,
} from "../../Service/ApiService";
import {
  showSuccess,
  showError,
  showDeleteConfirm,
} from "../../utils/sweetAlert";
import TicketCategoryModal from "./TicketCategoryModal";

const TicketCategory = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTicketCategories();
      console.log("Categories response:", response.data);

      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else if (
          response.data.categories &&
          Array.isArray(response.data.categories)
        ) {
          setCategories(response.data.categories);
        } else {
          console.warn("Unexpected response structure:", response.data);
          setCategories([]);
        }
      } else {
        setCategories([]);
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

  const handleDeleteCategory = async (id) => {
    const result = await showDeleteConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa danh mục này?"
    );

    if (result.isConfirmed) {
      try {
        await deleteTicketCategory(id);
        showSuccess("Thành công!", "Đã xóa danh mục");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        showError("Lỗi!", "Không thể xóa danh mục");
      }
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(
        (category) =>
          category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TagIcon className="h-8 w-8 mr-2 text-indigo-600" />
              Quản lý Danh mục Ticket
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý các danh mục cho tickets
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
                  Mô tả
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
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
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Không tìm thấy danh mục nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
            <TagIcon className="h-10 w-10 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Modal */}
      <TicketCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={() => {
          fetchCategories();
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};

export default TicketCategory;
