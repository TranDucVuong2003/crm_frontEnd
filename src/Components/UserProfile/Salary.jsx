import React, { useState, useEffect } from "react";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../Context/AuthContext";
import { showErrorAlert } from "../../utils/sweetAlert";

const Salary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [salaryInfo, setSalaryInfo] = useState(null);

  useEffect(() => {
    fetchSalaryInfo();
  }, []);

  const fetchSalaryInfo = async () => {
    try {
      setLoading(true);
      // Giả sử có API endpoint để lấy thông tin lương
      // const response = await ApiService.get(`/api/Salary/user/${user.id}`);
      // setSalaryInfo(response.data);

      // Tạm thời dùng dữ liệu mẫu
      setSalaryInfo({
        baseSalary: 15000000,
        allowances: 3000000,
        bonus: 2000000,
        totalSalary: 20000000,
        lastPaymentDate: "2024-12-01",
        nextPaymentDate: "2025-01-01",
      });
    } catch (error) {
      console.error("Error fetching salary info:", error);
      showErrorAlert("Lỗi", "Không thể tải thông tin lương");
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

  if (loading && !salaryInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin lương
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lương cơ bản */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Lương cơ bản
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(salaryInfo?.baseSalary || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phụ cấp */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Phụ cấp</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(salaryInfo?.allowances || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thưởng */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">
                    Thưởng tháng này
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(salaryInfo?.bonus || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng lương */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">
                    Tổng lương
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(salaryInfo?.totalSalary || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử thanh toán */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            Lịch thanh toán
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                Lần thanh toán gần nhất
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {salaryInfo?.lastPaymentDate
                  ? new Date(salaryInfo.lastPaymentDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Chưa có thông tin"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                Lần thanh toán tiếp theo
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {salaryInfo?.nextPaymentDate
                  ? new Date(salaryInfo.nextPaymentDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "Chưa có thông tin"}
              </p>
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Thông tin lương được cập nhật hàng tháng.
            Nếu có thắc mắc, vui lòng liên hệ phòng Nhân sự.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Salary;
