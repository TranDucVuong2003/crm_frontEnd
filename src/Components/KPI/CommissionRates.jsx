import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  getAllCommissionRates,
  createCommissionRate,
  updateCommissionRate,
  deleteCommissionRate,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";
import Swal from "sweetalert2";
import CommissionRateModal from "./CommissionRateModal";

const CommissionRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await getAllCommissionRates();

      if (response.data) {
        // Sort by tierLevel
        const sortedRates = response.data.sort(
          (a, b) => a.tierLevel - b.tierLevel
        );
        setRates(sortedRates);
      }
    } catch (error) {
      console.error("Error fetching commission rates:", error);
      showError("Không thể tải bậc hoa hồng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentRate(null);
    setShowModal(true);
  };

  const handleEdit = (rate) => {
    setCurrentRate(rate);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    console.log("🗑️ handleDelete called with id:", id);

    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa bậc hoa hồng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    console.log("✅ Swal result:", result);

    if (result) {
      console.log("🚀 Calling DELETE API for id:", id);
      try {
        const response = await deleteCommissionRate(id);
        console.log("📥 DELETE response:", response);

        if (response.status === 204 || response.status === 200) {
          showSuccess("Đã xóa bậc hoa hồng thành công");
          fetchRates();
        }
      } catch (error) {
        console.error("❌ Error deleting commission rate:", error);
        console.error("Error details:", error.response);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Không thể xóa bậc hoa hồng";
        showError(errorMessage);
      }
    } else {
      console.log("⛔ Delete cancelled by user");
    }
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchRates();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Không giới hạn";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRangeDisplay = (rate) => {
    const min = formatCurrency(rate.minAmount);
    const max = rate.maxAmount
      ? formatCurrency(rate.maxAmount)
      : "Không giới hạn";
    return `${min} - ${max}`;
  };

  const getTierColor = (tierLevel) => {
    const colors = {
      1: "bg-gray-100 text-gray-800 border-gray-300",
      2: "bg-blue-100 text-blue-800 border-blue-300",
      3: "bg-green-100 text-green-800 border-green-300",
      4: "bg-yellow-100 text-yellow-800 border-yellow-300",
      5: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[tierLevel] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-2 text-green-600" />
              Quản lý bậc hoa hồng
            </h1>
            <p className="text-gray-600 mt-1">
              Cấu hình tỷ lệ hoa hồng theo doanh số
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm bậc mới
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-blue-900 font-medium">
              Hướng dẫn cấu hình bậc hoa hồng
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Bậc hoa hồng được tính dựa trên tổng doanh số thực tế của nhân
              viên trong tháng. Hệ thống sẽ tự động chọn bậc phù hợp và tính hoa
              hồng tương ứng.
            </p>
          </div>
        </div>
      </div>

      {/* Commission Rates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CurrencyDollarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Chưa có bậc hoa hồng nào</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Tạo bậc hoa hồng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className={`bg-white rounded-lg shadow-lg border-2 hover:shadow-xl transition-shadow ${getTierColor(
                rate.tierLevel
              )}`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${getTierColor(
                        rate.tierLevel
                      )}`}
                    >
                      {rate.tierLevel}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">
                        Bậc {rate.tierLevel}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rate.isActive ? "Đang áp dụng" : "Ngưng hoạt động"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(rate)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rate.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Commission Rate */}
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-gray-900">
                    {rate.commissionPercentage}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Tỷ lệ hoa hồng</p>
                </div>

                {/* Range */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Khoảng doanh số</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getRangeDisplay(rate)}
                  </p>
                </div>

                {/* Description */}
                {rate.description && (
                  <p className="text-xs text-gray-600 italic">
                    {rate.description}
                  </p>
                )}

                {/* Example */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Ví dụ:</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      Doanh số: {formatCurrency(rate.minAmount + 10000000)}
                    </span>
                    <span className="font-medium text-green-600">
                      Hoa hồng:{" "}
                      {formatCurrency(
                        ((rate.minAmount + 10000000) *
                          rate.commissionPercentage) /
                          100
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Chart */}
      {rates.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ bậc hoa hồng
          </h2>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-4 min-w-max pb-4">
              {rates.map((rate) => (
                <div key={rate.id} className="flex flex-col items-center">
                  <div
                    className={`w-24 rounded-t-lg transition-all hover:opacity-80 ${getTierColor(
                      rate.tierLevel
                    )}`}
                    style={{
                      height: `${rate.commissionPercentage * 20}px`,
                      minHeight: "60px",
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xl font-bold">
                        {rate.commissionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">
                      Bậc {rate.tierLevel}
                    </p>
                    <p className="text-xs text-gray-500">
                      {rate.minAmount === 0
                        ? "0"
                        : `${rate.minAmount / 1000000}tr`}{" "}
                      - {rate.maxAmount ? `${rate.maxAmount / 1000000}tr` : "∞"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CommissionRateModal
          rate={currentRate}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default CommissionRates;
