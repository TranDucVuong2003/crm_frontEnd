import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getAllPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
} from "../../utils/sweetAlert";

const PositionManagement = () => {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [formData, setFormData] = useState({
    positionName: "",
    level: "",
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    const filtered = positions.filter(
      (position) =>
        position.positionName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        position.level?.toString().includes(searchTerm)
    );
    setFilteredPositions(filtered);
  }, [searchTerm, positions]);

  const fetchPositions = async () => {
    try {
      showLoading("Đang tải dữ liệu...");
      const response = await getAllPositions();
      setPositions(response.data || []);
      setFilteredPositions(response.data || []);
      closeLoading();
    } catch (error) {
      console.error("Error fetching positions:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể tải danh sách chức vụ");
    }
  };

  const handleOpenModal = (position = null) => {
    if (position) {
      setCurrentPosition(position);
      setFormData({
        positionName: position.positionName || "",
        level: position.level || "",
      });
    } else {
      setCurrentPosition(null);
      setFormData({
        positionName: "",
        level: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPosition(null);
    setFormData({
      positionName: "",
      level: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.positionName.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập tên chức vụ");
      return;
    }

    try {
      showLoading(currentPosition ? "Đang cập nhật..." : "Đang tạo mới...");

      const submitData = {
        positionName: formData.positionName,
        level: formData.level ? parseInt(formData.level) : 0,
      };

      if (currentPosition) {
        // Gửi id qua cả URL và body
        const updateData = {
          ...submitData,
          id: currentPosition.id,
        };
        await updatePosition(currentPosition.id, updateData);
        closeLoading();
        await showSuccessAlert("Thành công", "Cập nhật chức vụ thành công");
      } else {
        await createPosition(submitData);
        closeLoading();
        await showSuccessAlert("Thành công", "Tạo chức vụ mới thành công");
      }

      handleCloseModal();
      fetchPositions();
    } catch (error) {
      console.error("Error saving position:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu chức vụ"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa chức vụ này?"
    );

    if (result) {
      try {
        showLoading("Đang xóa...");
        await deletePosition(id);
        closeLoading();
        await showSuccessAlert("Thành công", "Xóa chức vụ thành công");
        fetchPositions();
      } catch (error) {
        console.error("Error deleting position:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa chức vụ"
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý Chức vụ (Positions)
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
            placeholder="Tìm kiếm chức vụ..."
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
                Tên chức vụ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cấp bậc (Level)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPositions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {position.id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {position.positionName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {position.level || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleOpenModal(position)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(position.id)}
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
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentPosition ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chức vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.positionName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          positionName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên chức vụ"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cấp bậc (Level)
                    </label>
                    <input
                      type="number"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập cấp bậc"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentPosition ? "Cập nhật" : "Tạo mới"}
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

export default PositionManagement;
