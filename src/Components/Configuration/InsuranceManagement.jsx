import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteConfirm,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import {
  getAllInsurances,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  getInsuranceStatusById,
  toggleInsuranceStatus,
  getAllInsurancePolicy,
} from "../../Service/ApiService";

const InsuranceManagement = () => {
  const [insurances, setInsurances] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    employeeRate: 0,
    employerRate: 0,
    capBaseType: "GOV_BASE",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFixedTax, setIsFixedTax] = useState(false);

  // Fetch insurances on component mount
  useEffect(() => {
    fetchInsurances();
    fetchInsuranceStatus();
  }, []);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await getAllInsurancePolicy();
      setInsurances(response.data);
    } catch (error) {
      console.error("Error fetching insurances:", error);
      showErrorAlert("Không thể tải danh sách bảo hiểm");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceStatus = async () => {
    try {
      const response = await getInsuranceStatusById(1); // ID cố định là 1
      setIsFixedTax(response.data.status);
    } catch (error) {
      console.error("Error fetching insurance status:", error);
      // Không hiển thị alert để không làm phiền user
    }
  };

  const handleToggleFixedTax = async () => {
    try {
      showLoading("Đang cập nhật cấu hình thuế...");
      const response = await toggleInsuranceStatus(1); // ID cố định là 1
      setIsFixedTax(response.data.status);
      closeLoading();
      showSuccessAlert(
        response.data.status
          ? "Đã bật chế độ cố định thuế!"
          : "Đã tắt chế độ cố định thuế!"
      );
    } catch (error) {
      console.error("Error toggling insurance status:", error);
      closeLoading();
      showErrorAlert("Không thể thay đổi trạng thái cố định thuế");
      // Revert lại state nếu API thất bại
      fetchInsuranceStatus();
    }
  };

  const handleAdd = () => {
    setEditingInsurance(null);
    setFormData({
      code: "",
      name: "",
      employeeRate: 0,
      employerRate: 0,
      capBaseType: "GOV_BASE",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (insurance) => {
    setEditingInsurance(insurance);
    setFormData({
      code: insurance.code,
      name: insurance.name,
      employeeRate: insurance.employeeRate,
      employerRate: insurance.employerRate,
      capBaseType: insurance.capBaseType,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (insurance) => {
    const result = await showDeleteConfirm(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa "${insurance.name}"?`
    );

    if (result) {
      try {
        showLoading("Đang xóa...");
        await deleteInsurance(insurance.id);
        closeLoading();
        showSuccessAlert("Đã xóa bảo hiểm thành công!");
        fetchInsurances(); // Reload data
      } catch (error) {
        closeLoading();
        showErrorAlert(
          error.response?.data?.message || "Không thể xóa bảo hiểm"
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      showLoading(editingInsurance ? "Đang cập nhật..." : "Đang thêm mới...");

      if (editingInsurance) {
        // Update existing
        await updateInsurance(editingInsurance.id, formData);
        closeLoading();
        showSuccessAlert("Đã cập nhật bảo hiểm thành công!");
      } else {
        // Add new
        await createInsurance(formData);
        closeLoading();
        showSuccessAlert("Đã thêm bảo hiểm mới thành công!");
      }

      setIsModalOpen(false);
      fetchInsurances(); // Reload data
    } catch (error) {
      closeLoading();
      showErrorAlert(
        error.response?.data?.message ||
          (editingInsurance
            ? "Không thể cập nhật bảo hiểm"
            : "Không thể thêm bảo hiểm")
      );
    }
  };

  const filteredInsurances = insurances.filter((insurance) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      insurance.name?.toLowerCase().includes(searchLower) ||
      insurance.code?.toLowerCase().includes(searchLower) ||
      insurance.capBaseType?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý Bảo hiểm
          </h2>
          <div className="flex items-center gap-4">
            {/* Toggle Cố định bảo hiểm */}
            {/* <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Cố định bảo hiểm
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFixedTax}
                  onChange={handleToggleFixedTax}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div> */}

            {/* Nút thêm mới */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bảo hiểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên bảo hiểm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Công ty (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại cơ sở
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : filteredInsurances.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Không tìm thấy bảo hiểm nào
                </td>
              </tr>
            ) : (
              filteredInsurances.map((insurance) => (
                <tr key={insurance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {insurance.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {insurance.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {insurance.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {insurance.employeeRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {insurance.employerRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span
                      className={
                        insurance.capBaseType === "GOV_BASE"
                          ? "px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          : "px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                      }
                    >
                      {insurance.capBaseType === "GOV_BASE"
                        ? "Cơ sở nhà nước"
                        : "Lương tối thiểu vùng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(insurance)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(insurance)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingInsurance ? "Chỉnh sửa bảo hiểm" : "Thêm bảo hiểm mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã bảo hiểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: BHXH, BHYT, BHTN..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên bảo hiểm <span className="text-red-500">*</span>
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
                    placeholder="Ví dụ: Bảo hiểm Xã hội..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ lệ nhân viên (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.employeeRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employeeRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8.0"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ lệ % nhân viên đóng
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ lệ công ty (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.employerRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employerRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="17.5"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tỷ lệ % công ty đóng
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại cơ sở tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.capBaseType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capBaseType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="GOV_BASE">Cơ sở nhà nước</option>
                    <option value="REGION_MIN">Lương tối thiểu vùng</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cơ sở để tính mức đóng bảo hiểm
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Gợi ý:</strong> Tổng bảo hiểm bắt buộc: BHXH (NV:
                    8%, Cty: 17.5%), BHYT (NV: 1.5%, Cty: 3%), BHTN (NV: 1%,
                    Cty: 1%)
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingInsurance ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceManagement;
