import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getAllResions,
  createResion,
  updateResion,
  deleteResion,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
} from "../../utils/sweetAlert";

const ResionManagement = () => {
  const [resions, setResions] = useState([]);
  const [filteredResions, setFilteredResions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResion, setCurrentResion] = useState(null);
  const [formData, setFormData] = useState({
    city: "",
  });

  useEffect(() => {
    fetchResions();
  }, []);

  useEffect(() => {
    const filtered = resions.filter((resion) =>
      resion.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResions(filtered);
  }, [searchTerm, resions]);

  const fetchResions = async () => {
    try {
      showLoading("Đang tải dữ liệu...");
      const response = await getAllResions();
      setResions(response.data || []);
      setFilteredResions(response.data || []);
      closeLoading();
    } catch (error) {
      console.error("Error fetching resions:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể lấy danh sách khu vực");
    }
  };

  const handleOpenModal = (resion = null) => {
    if (resion) {
      setCurrentResion(resion);
      setFormData({
        city: resion.city || "",
      });
    } else {
      setCurrentResion(null);
      setFormData({
        city: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentResion(null);
    setFormData({
      city: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.city.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập tên thành phố");
      return;
    }

    try {
      showLoading(currentResion ? "Đang cập nhật..." : "Đang tạo mới...");

      if (currentResion) {
        const updateData = {
          ...formData,
          id: currentResion.id,
        };
        await updateResion(currentResion.id, updateData);
        closeLoading();
        await showSuccessAlert("Thành công", "Cập nhật thành phố thành công");
      } else {
        await createResion(formData);
        closeLoading();
        await showSuccessAlert("Thành công", "Tạo thành phố mới thành công");
      }

      handleCloseModal();
      fetchResions();
    } catch (error) {
      console.error("Error saving reasion:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu lý do"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa thành phố này?"
    );

    if (result.isConfirmed) {
      try {
        showLoading("Đang xóa...");
        await deleteResion(id);
        closeLoading();
        await showSuccessAlert("Thành công", "Xóa thành phố thành công");
        fetchResions();
      } catch (error) {
        console.error("Error deleting resion:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa thành phố"
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý khu vực (Resions)
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
            placeholder="Tìm kiếm lý do..."
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
                Thành phố
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
            {filteredResions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredResions.map((resion) => (
                <tr key={resion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {resion.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {resion.city}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {resion.createdAt
                      ? new Date(resion.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleOpenModal(resion)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(resion.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div 
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentResion ? "Chỉnh sửa thành phố" : "Thêm thành phố mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên thành phố"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentResion ? "Cập nhật" : "Tạo mới"}
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
    </div>
  );
};

export default ResionManagement;
