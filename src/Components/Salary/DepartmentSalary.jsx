import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { getUsersByDepartment } from "../../Service/ApiService";
import {
  showErrorAlert,
  showSuccessAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import SalaryConfigModal from "./SalaryConfigModal";

const DepartmentSalary = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [salaryInput, setSalaryInput] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [departmentId]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getUsersByDepartment(departmentId);
      const employeesData = response.data;

      setEmployees(employeesData);

      // Lấy tên phòng ban từ employee đầu tiên (nếu có)
      if (employeesData.length > 0 && employeesData[0].department) {
        setDepartmentName(employeesData[0].department.name);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showErrorAlert(
        "Lỗi",
        "Không thể tải danh sách nhân viên. Vui lòng thử lại"
      );
      setLoading(false);
    }
  };

  const handleEditSalary = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setSalaryInput({});
  };

  const handleModalSuccess = () => {
    fetchEmployees(); // Refresh danh sách sau khi lưu thành công
  };

  const handleSaveSalary = async (employeeId) => {
    try {
      showLoading("Đang cập nhật lương...");

      // TODO: Gọi API cập nhật lương
      // await updateEmployeeSalary(employeeId, salaryInput[employeeId]);

      // Cập nhật local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? { ...emp, salary: salaryInput[employeeId] }
            : emp
        )
      );

      closeLoading();
      showSuccessAlert("Thành công", "Cập nhật lương thành công!");
      setEditingEmployeeId(null);
    } catch (error) {
      console.error("Error updating salary:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể cập nhật lương. Vui lòng thử lại");
    }
  };

  const handleSalaryInputChange = (employeeId, value) => {
    // Chỉ cho phép nhập số
    const numericValue = value.replace(/[^0-9]/g, "");
    setSalaryInput({
      ...salaryInput,
      [employeeId]: numericValue,
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateTotalSalary = () => {
    return employees.reduce((total, emp) => total + (emp.salary || 0), 0);
  };

  const calculateAverageSalary = () => {
    if (employees.length === 0) return 0;
    return calculateTotalSalary() / employees.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/accounting/salary")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {departmentName || `Phòng ban #${departmentId}`}
              </h1>
              <p className="text-gray-600 mt-1">Quản lý lương nhân viên</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {employees.length} người
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Tổng quỹ lương</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculateTotalSalary())}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Lương trung bình
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(calculateAverageSalary())}
          </p>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách nhân viên
          </h2>
        </div>

        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có nhân viên
            </h3>
            <p className="text-gray-600">Phòng ban này chưa có nhân viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ và tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chức vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp bậc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lương
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {employee.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.phoneNumber || "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                      title={employee.address}
                    >
                      {employee.address || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.position?.positionName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.position?.level === 1
                            ? "bg-purple-100 text-purple-700"
                            : employee.position?.level === 2
                            ? "bg-blue-100 text-blue-700"
                            : employee.position?.level === 3
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Cấp {employee.position?.level || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {employee.role?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.status === "active"
                            ? "bg-green-100 text-green-700"
                            : employee.status === "inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {employee.status === "active"
                          ? "Hoạt động"
                          : employee.status === "inactive"
                          ? "Không hoạt động"
                          : employee.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployeeId === employee.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={salaryInput[employee.id] || ""}
                            onChange={(e) =>
                              handleSalaryInputChange(
                                employee.id,
                                e.target.value
                              )
                            }
                            className="w-40 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Nhập lương"
                            autoFocus
                          />
                          <span className="text-sm text-gray-600">₫</span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(employee.salary || 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEditSalary(employee)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cấu hình lương"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Config Modal */}
      <SalaryConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default DepartmentSalary;
