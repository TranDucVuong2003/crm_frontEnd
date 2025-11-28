import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllResions,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
} from "../../utils/sweetAlert";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [resions, setResions] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    resionId: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchResions();
  }, []);

  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.resion?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDepartments(filtered);
  }, [searchTerm, departments]);

  const fetchDepartments = async () => {
    try {
      showLoading("Đang tải dữ liệu...");
      const response = await getAllDepartments();
      setDepartments(response.data || []);
      setFilteredDepartments(response.data || []);
      closeLoading();
    } catch (error) {
      console.error("Error fetching departments:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể tải danh sách phòng ban");
    }
  };

  const fetchResions = async () => {
    try {
      const response = await getAllResions();
      setResions(response.data || []);
    } catch (error) {
      console.error("Error fetching resions:", error);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setCurrentDepartment(department);
      setFormData({
        name: department.name || "",
        resionId: department.resionId || "",
      });
    } else {
      setCurrentDepartment(null);
      setFormData({
        name: "",
        resionId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDepartment(null);
    setFormData({
      name: "",
      resionId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập tên phòng ban");
      return;
    }

    try {
      showLoading(currentDepartment ? "Đang cập nhật..." : "Đang tạo mới...");

      const submitData = {
        name: formData.name,
        resionId: formData.resionId ? parseInt(formData.resionId) : 1,
      };

      if (currentDepartment) {
        // Gửi id qua cả URL và body
        const updateData = {
          ...submitData,
          id: currentDepartment.id,
        };
        await updateDepartment(currentDepartment.id, updateData);
        closeLoading();
        await showSuccessAlert("Thành công", "Cập nhật phòng ban thành công");
      } else {
        await createDepartment(submitData);
        closeLoading();
        await showSuccessAlert("Thành công", "Tạo phòng ban mới thành công");
      }

      handleCloseModal();
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu phòng ban"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa phòng ban này?"
    );

    if (result.isConfirmed) {
      try {
        showLoading("Đang xóa...");
        await deleteDepartment(id);
        closeLoading();
        await showSuccessAlert("Thành công", "Xóa phòng ban thành công");
        fetchDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa phòng ban"
        );
      }
    }
  };

  const getResionCity = (resion) => {
    return resion?.city || "-";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý Phòng ban (Departments)
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
            placeholder="Tìm kiếm phòng ban..."
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
                Tên phòng ban
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
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{dept.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getResionCity(dept.resion)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dept.createdAt
                      ? new Date(dept.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleOpenModal(dept)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
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
                {currentDepartment
                  ? "Chỉnh sửa phòng ban"
                  : "Thêm phòng ban mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên phòng ban <span className="text-red-500">*</span>
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
                      placeholder="Nhập tên phòng ban"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố
                    </label>
                    <select
                      value={formData.resionId}
                      onChange={(e) =>
                        setFormData({ ...formData, resionId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn thành phố --</option>
                      {resions.map((resion) => (
                        <option key={resion.id} value={resion.id}>
                          {resion.city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentDepartment ? "Cập nhật" : "Tạo mới"}
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

export default DepartmentManagement;
