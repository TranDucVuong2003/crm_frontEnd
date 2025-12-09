import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  assignKpiPackage,
  getKpiPackageById,
  getAllUsers,
  getAllKpiTargets,
  getAllPositions,
} from "../../Service/ApiService";
import { showSuccess, showError } from "../../utils/sweetAlert";

const AssignKpiModal = ({ packageId, onClose, onSuccess }) => {
  const [packageInfo, setPackageInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [packageId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch package info
      const packageRes = await getKpiPackageById(packageId);
      if (packageRes.data.success) {
        setPackageInfo(packageRes.data.data);
      }

      // Fetch all users
      const usersRes = await getAllUsers();
      const allUsers = usersRes.data;

      // Fetch all positions
      const positionsRes = await getAllPositions();
      const allPositions = positionsRes.data;
      setPositions(allPositions);

      // Fetch all KPI targets để kiểm tra user nào đã được gán gói này
      const targetsRes = await getAllKpiTargets();
      const assignedUserIds = [];

      if (targetsRes.data.success) {
        // Lọc ra các user đã được gán gói KPI này
        targetsRes.data.data.forEach((target) => {
          if (target.kpiPackageId === packageId) {
            assignedUserIds.push(target.userId);
          }
        });
      }

      setUsers(allUsers);
      setSelectedUserIds(assignedUserIds); // Tự động tích cho users đã được gán
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPosition = selectedPosition
      ? user.positionId === parseInt(selectedPosition)
      : true;

    return matchSearch && matchPosition;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedUserIds.length === 0) {
      showError("Vui lòng chọn ít nhất 1 nhân viên");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        kpiPackageId: packageId,
        userIds: selectedUserIds,
        notes: notes.trim(),
      };

      const response = await assignKpiPackage(payload);

      if (response.data.success) {
        const summary = response.data.summary;
        showSuccess(
          `Đã gán KPI thành công cho ${summary.total} users\n` +
            `Tạo mới: ${summary.created}, Cập nhật: ${summary.updated}`
        );
        onSuccess();
      }
    } catch (error) {
      console.error("Error assigning KPI:", error);
      showError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gán gói KPI cho nhân viên
            </h2>
            {packageInfo && (
              <p className="text-sm text-gray-600 mt-1">
                {packageInfo.name} - Target:{" "}
                {formatCurrency(packageInfo.targetAmount)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto flex-1">
            {/* Search & Filter */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nhân viên..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả chức vụ</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.positionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select All */}
            <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedUserIds.length === filteredUsers.length &&
                    filteredUsers.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Chọn tất cả
                </span>
              </label>
              <span className="text-sm text-gray-600">
                Đã chọn: {selectedUserIds.length} / {filteredUsers.length}
              </span>
            </div>

            {/* Users List */}
            <div className="space-y-2 mb-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy nhân viên nào
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUserIds.includes(user.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleToggleUser(user.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {user.position?.positionName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user.department?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Ghi chú về việc gán KPI..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedUserIds.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Đang xử lý..."
                : `Gán KPI cho ${selectedUserIds.length} users`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignKpiModal;
