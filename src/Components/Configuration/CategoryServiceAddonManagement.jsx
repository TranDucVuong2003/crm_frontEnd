import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  getAllCategoryServiceAddons,
  createCategoryServiceAddon,
  updateCategoryServiceAddon,
  deleteCategoryServiceAddon,
  getCategoryServiceAddonById,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
} from "../../utils/sweetAlert";

const CategoryServiceAddonManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      showLoading("Đang tải dữ liệu...");
      const response = await getAllCategoryServiceAddons();
      const categoriesData = response.data || [];

      // Fetch chi tiết từng category để lấy đầy đủ services và addons
      const categoriesWithDetails = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const detailResponse = await getCategoryServiceAddonById(
              category.id
            );
            return detailResponse.data;
          } catch (error) {
            console.error(`Error fetching category ${category.id}:`, error);
            return category;
          }
        })
      );

      setCategories(categoriesWithDetails);
      setFilteredCategories(categoriesWithDetails);
      closeLoading();
    } catch (error) {
      console.error("Error fetching categories:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể tải danh sách danh mục");
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name || "",
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        name: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setFormData({
      name: "",
    });
  };

  const handleOpenDetailModal = (category) => {
    setViewingCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập tên danh mục");
      return;
    }

    try {
      showLoading(currentCategory ? "Đang cập nhật..." : "Đang tạo mới...");

      const submitData = {
        name: formData.name,
      };

      if (currentCategory) {
        const updateData = {
          ...submitData,
          id: currentCategory.id,
        };
        await updateCategoryServiceAddon(currentCategory.id, updateData);
        closeLoading();
        await showSuccessAlert("Thành công", "Cập nhật danh mục thành công");
      } else {
        await createCategoryServiceAddon(submitData);
        closeLoading();
        await showSuccessAlert("Thành công", "Tạo danh mục mới thành công");
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu danh mục"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa danh mục này?"
    );

    if (result) {
      try {
        showLoading("Đang xóa...");
        await deleteCategoryServiceAddon(id);
        closeLoading();
        await showSuccessAlert("Thành công", "Xóa danh mục thành công");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa danh mục"
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý Danh mục Dịch vụ & Addon
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên danh mục
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số Dịch vụ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số Addon
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {category.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                      {category.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.services?.length || 0} dịch vụ
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {category.addons?.length || 0} addon
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleOpenDetailModal(category)}
                      className="text-green-600 hover:text-green-800 mr-3"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Xóa"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên danh mục"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentCategory ? "Cập nhật" : "Tạo mới"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailModalOpen && viewingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết danh mục: {viewingCategory.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>ID:</strong> {viewingCategory.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tên:</strong> {viewingCategory.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ngày tạo:</strong>{" "}
                    {viewingCategory.createdAt
                      ? new Date(viewingCategory.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Dịch vụ ({viewingCategory.services?.length || 0})
                  </h4>
                  {viewingCategory.services?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {viewingCategory.services.map((service) => (
                        <li key={service.id}>
                          {service.name || service.serviceName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có dịch vụ</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Addon ({viewingCategory.addons?.length || 0})
                  </h4>
                  {viewingCategory.addons?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {viewingCategory.addons.map((addon) => (
                        <li key={addon.id}>{addon.name || addon.addonName}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có addon</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryServiceAddonManagement;
