import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  createBatchMonthlyAttendances,
  getAllUsers,
} from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";

const AttendanceBatchModal = ({
  month: initialMonth,
  year: initialYear,
  existingAttendances,
  onClose,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    // Reset selections when month/year changes
    setSelectedUsers([]);
    setAttendanceData([]);
  }, [selectedMonth, selectedYear]);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const allUsers = response.data || [];

      // Filter out users who already have attendance for this month
      const usersWithoutAttendance = allUsers.filter(
        (user) => !existingAttendances.some((att) => att.userId === user.id)
      );

      setUsers(usersWithoutAttendance);
    } catch (error) {
      console.error("Error fetching users:", error);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tải danh sách nhân viên"
      );
    }
  };

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);

    if (isSelected) {
      // Remove user
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      setAttendanceData(attendanceData.filter((a) => a.userId !== user.id));
    } else {
      // Add user
      setSelectedUsers([...selectedUsers, user]);
      setAttendanceData([
        ...attendanceData,
        { userId: user.id, actualWorkDays: "" },
      ]);
    }
  };

  const handleWorkDaysChange = (userId, value) => {
    setAttendanceData(
      attendanceData.map((item) =>
        item.userId === userId
          ? { ...item, actualWorkDays: parseFloat(value) || 0 }
          : item
      )
    );
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
    setAttendanceData(attendanceData.filter((a) => a.userId !== userId));
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      // Deselect all
      setSelectedUsers([]);
      setAttendanceData([]);
    } else {
      // Select all filtered users
      setSelectedUsers(filteredUsers);
      setAttendanceData(
        filteredUsers.map((user) => ({
          userId: user.id,
          actualWorkDays: "",
        }))
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (attendanceData.length === 0) {
      showErrorAlert("Lỗi", "Vui lòng chọn ít nhất một nhân viên");
      return;
    }

    // Validate all work days are greater than 0
    const invalidData = attendanceData.filter(
      (item) => !item.actualWorkDays || item.actualWorkDays <= 0
    );
    if (invalidData.length > 0) {
      showErrorAlert(
        "Lỗi",
        "Vui lòng nhập số ngày công hợp lệ (> 0) cho tất cả nhân viên"
      );
      return;
    }

    setLoading(true);
    showLoading("Đang tạo ngày công hàng loạt...");

    try {
      await createBatchMonthlyAttendances({
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        attendances: attendanceData,
      });
      closeLoading();

      // Đóng modal trước khi hiển thị alert
      onClose();

      // Hiển thị alert sau khi modal đã đóng
      setTimeout(() => {
        showSuccessAlert(
          "Thành công",
          `Đã tạo ngày công cho ${attendanceData.length} nhân viên`,
          {
            timer: 2000, // Tự đóng sau 2 giây
            timerProgressBar: true,
          }
        );
      }, 500);
    } catch (error) {
      closeLoading();
      console.error("Error creating batch attendances:", error);
      showErrorAlert(
        "Lỗi",
        error.response?.data?.message || "Không thể tạo ngày công hàng loạt"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return users;

    const searchLower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.department?.name?.toLowerCase().includes(searchLower)
    );
  };

  const filteredUsers = getFilteredUsers();

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - 5 + i
  );

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Thêm ngày công hàng loạt
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Tháng
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Năm</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-gray-600">
                - Đã chọn {selectedUsers.length} nhân viên
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
            {/* Left: User Selection */}
            <div className="flex flex-col overflow-hidden border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Chọn nhân viên ({filteredUsers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedUsers.length === filteredUsers.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mb-3" />
                    <p>Không có nhân viên nào chưa nhập ngày công</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUsers.some(
                        (u) => u.id === user.id
                      );
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                              {user.department && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {user.department.name} -{" "}
                                  {user.position?.positionName || "N/A"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Work Days Input */}
            <div className="flex flex-col overflow-hidden border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Nhập số ngày công ({selectedUsers.length} nhân viên)
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mb-3" />
                    <p>Chưa chọn nhân viên nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUsers.map((user) => {
                      const workDays =
                        attendanceData.find((a) => a.userId === user.id)
                          ?.actualWorkDays ?? "";
                      return (
                        <div
                          key={user.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {user.fullName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max="31"
                                  value={workDays}
                                  onChange={(e) =>
                                    handleWorkDaysChange(
                                      user.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1.5 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  placeholder="0"
                                />
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                ngày
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Xóa"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tạo mới ({selectedUsers.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceBatchModal;
