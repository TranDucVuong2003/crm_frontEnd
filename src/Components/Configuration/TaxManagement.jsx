import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  getAllTax,
  createTax,
  updateTax,
  deleteTax,
} from "../../Service/ApiService";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
  showConfirm,
} from "../../utils/sweetAlert";

const TaxManagement = () => {
  const [taxes, setTaxes] = useState([]);
  const [filteredTaxes, setFilteredTaxes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTax, setCurrentTax] = useState(null);
  const [formData, setFormData] = useState({
    rate: "",
    notes: "",
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  useEffect(() => {
    const filtered = taxes.filter(
      (tax) =>
        tax.rate?.toString().includes(searchTerm) ||
        tax.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTaxes(filtered);
  }, [searchTerm, taxes]);

  const fetchTaxes = async () => {
    try {
      showLoading("Đang tải dữ liệu...");
      const response = await getAllTax();
      setTaxes(response.data || []);
      setFilteredTaxes(response.data || []);
      closeLoading();
    } catch (error) {
      console.error("Error fetching taxes:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể tải danh sách thuế");
    }
  };

  const handleOpenModal = (tax = null) => {
    if (tax) {
      setCurrentTax(tax);
      setFormData({
        rate: tax.rate.toString(),
        notes: tax.notes || "",
      });
    } else {
      setCurrentTax(null);
      setFormData({
        rate: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTax(null);
    setFormData({
      rate: "",
      notes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rate.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập tỷ lệ thuế");
      return;
    }

    if (!formData.notes.trim()) {
      showErrorAlert("Lỗi", "Vui lòng nhập ghi chú");
      return;
    }

    try {
      showLoading(currentTax ? "Đang cập nhật..." : "Đang tạo mới...");

      const submitData = {
        rate: parseFloat(formData.rate),
        notes: formData.notes,
      };

      if (currentTax) {
        const updateData = {
          ...submitData,
          id: currentTax.id,
        };
        await updateTax(currentTax.id, updateData);
        closeLoading();
        await showSuccessAlert(
          "Thành công",
          "Cập nhật cấu hình thuế thành công"
        );
      } else {
        await createTax(submitData);
        closeLoading();
        await showSuccessAlert(
          "Thành công",
          "Tạo cấu hình thuế mới thành công"
        );
      }

      handleCloseModal();
      fetchTaxes();
    } catch (error) {
      console.error("Error saving tax:", error);
      closeLoading();
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể lưu cấu hình thuế"
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa cấu hình thuế này?"
    );

    if (result) {
      try {
        showLoading("Đang xóa...");
        await deleteTax(id);
        closeLoading();
        await showSuccessAlert("Thành công", "Xóa cấu hình thuế thành công");
        fetchTaxes();
      } catch (error) {
        console.error("Error deleting tax:", error);
        closeLoading();
        showErrorAlert(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa cấu hình thuế"
        );
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý Thuế (Tax)
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
            placeholder="Tìm kiếm cấu hình thuế..."
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
                Tỷ lệ thuế (%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghi chú
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
            {filteredTaxes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredTaxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{tax.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                      {tax.rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tax.notes || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {tax.createdAt
                      ? new Date(tax.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button
                      onClick={() => handleOpenModal(tax)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tax.id)}
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
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentTax
                  ? "Chỉnh sửa cấu hình thuế"
                  : "Thêm cấu hình thuế mới"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỷ lệ thuế (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: e.target.value,
                        })
                      }
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notes: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: VAT chuẩn 10% áp dụng cho tất cả dịch vụ..."
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentTax ? "Cập nhật" : "Tạo mới"}
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

export default TaxManagement;
