import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CalculatorIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import { calculatePayslip } from "../../Service/ApiService";

const PayslipDetailModal = ({ payslip, onClose, onRefresh }) => {
  const [calculationDetail, setCalculationDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch calculation details when modal opens
    fetchCalculationDetails();
  }, [payslip]);

  const fetchCalculationDetails = async () => {
    try {
      setLoading(true);
      // Re-calculate to get detailed breakdown
      const response = await calculatePayslip({
        userId: payslip.userId,
        month: payslip.month,
        year: payslip.year,
      });
      setCalculationDetail(response.data.calculation);
    } catch (error) {
      console.error("Error fetching calculation details:", error);
      // If calculation fails, we can still show the payslip data
      setCalculationDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Nháp
          </span>
        );
      case "PAID":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Đã thanh toán
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">
                  Phiếu lương tháng {payslip.month}/{payslip.year}
                </h3>
                {getStatusBadge(payslip.status)}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-blue-100">
                  <span className="font-semibold">Nhân viên:</span>{" "}
                  {payslip.userName}
                </p>
                <p className="text-blue-100">
                  <span className="font-semibold">Email:</span>{" "}
                  {payslip.userEmail}
                </p>
                <p className="text-blue-100 text-sm">
                  <span className="font-semibold">ID:</span> #{payslip.id} |
                  User ID: #{payslip.userId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải chi tiết...</span>
            </div>
          ) : calculationDetail ? (
            <div className="space-y-4">
              {/* Step 1: Standard Work Days */}
              <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Bước 1
                      </span>
                      <h4 className="font-semibold text-gray-900">
                        Ngày công chuẩn
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Số ngày công chuẩn trong tháng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {calculationDetail.step1_standardWorkDays}
                    </p>
                    <p className="text-sm text-gray-600">ngày</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Base Salary & Actual Work Days */}
              <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Bước 2
                  </span>
                  <h4 className="font-semibold text-gray-900">
                    Thông tin cơ bản
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Lương cơ bản</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(calculationDetail.step2_baseSalary)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Ngày công thực tế
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {calculationDetail.step2_actualWorkDays} ngày
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Salary by Work Days */}
              <div className="bg-purple-50 rounded-lg p-5 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Bước 3
                  </span>
                  <h4 className="font-semibold text-gray-900">
                    Lương theo ngày công
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    = (Lương cơ bản ÷ Ngày công chuẩn) × Ngày công thực tế
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    = ({formatCurrency(calculationDetail.step2_baseSalary)} ÷{" "}
                    {calculationDetail.step1_standardWorkDays}) ×{" "}
                    {calculationDetail.step2_actualWorkDays}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(calculationDetail.step3_salaryByWorkDays)}
                  </p>
                </div>
              </div>

              {/* Step 4: Gross Income */}
              <div className="bg-orange-50 rounded-lg p-5 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Bước 4
                  </span>
                  <h4 className="font-semibold text-gray-900">Tổng thu nhập</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Thưởng</p>
                    <p className="text-lg font-bold text-green-600">
                      +{formatCurrency(calculationDetail.step4_totalBonus)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Phạt</p>
                    <p className="text-lg font-bold text-red-600">
                      -{formatCurrency(calculationDetail.step4_totalPenalty)}
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Tổng thu nhập</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(calculationDetail.step4_grossIncome)}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    = Lương theo ngày công + Thưởng - Phạt
                  </p>
                  <p className="text-sm text-gray-500">
                    = {formatCurrency(calculationDetail.step3_salaryByWorkDays)}{" "}
                    + {formatCurrency(calculationDetail.step4_totalBonus)} -{" "}
                    {formatCurrency(calculationDetail.step4_totalPenalty)}
                  </p>
                </div>
              </div>

              {/* Step 5: Insurance Deduction */}
              <div className="bg-red-50 rounded-lg p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Bước 5
                      </span>
                      <h4 className="font-semibold text-gray-900">
                        Khấu trừ bảo hiểm
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      BHXH + BHYT + BHTN (theo tỷ lệ nhân viên)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      -
                      {formatCurrency(
                        calculationDetail.step5_insuranceDeduction
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6: Assessable Income */}
              <div className="bg-indigo-50 rounded-lg p-5 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Bước 6
                  </span>
                  <h4 className="font-semibold text-gray-900">
                    Thu nhập tính thuế
                  </h4>
                </div>
                <div className="bg-white rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Giảm trừ gia cảnh
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        -
                        {formatCurrency(
                          calculationDetail.step6_familyDeduction
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Thu nhập tính thuế
                      </p>
                      <p className="text-lg font-bold text-indigo-600">
                        {formatCurrency(
                          calculationDetail.step6_assessableIncome
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 border-t pt-3">
                    = Tổng thu nhập - Bảo hiểm - Giảm trừ gia cảnh
                  </p>
                  <p className="text-sm text-gray-500">
                    = {formatCurrency(calculationDetail.step4_grossIncome)} -{" "}
                    {formatCurrency(calculationDetail.step5_insuranceDeduction)}{" "}
                    - {formatCurrency(calculationDetail.step6_familyDeduction)}
                  </p>
                </div>
              </div>

              {/* Step 7: Tax Amount */}
              <div className="bg-rose-50 rounded-lg p-5 border-l-4 border-rose-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Bước 7
                      </span>
                      <h4 className="font-semibold text-gray-900">Thuế TNCN</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Thuế thu nhập cá nhân (theo biểu lũy tiến)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-rose-600">
                      -{formatCurrency(calculationDetail.step7_taxAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 8: Net Salary - FINAL RESULT */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 border-l-4 border-emerald-700 shadow-lg">
                <div className="flex items-center justify-between text-white">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                        Bước 8
                      </span>
                      <h4 className="font-bold text-xl">LƯƠNG THỰC NHẬN</h4>
                    </div>
                    <p className="text-green-100 text-sm">
                      = Thu nhập tính thuế - Thuế TNCN
                    </p>
                    <p className="text-green-100 text-sm">
                      ={" "}
                      {formatCurrency(calculationDetail.step6_assessableIncome)}{" "}
                      - {formatCurrency(calculationDetail.step7_taxAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">
                      {formatCurrency(calculationDetail.step8_netSalary)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm">Đã xác nhận</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback when calculation details are not available
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Thông tin tóm tắt
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ngày công chuẩn</p>
                    <p className="text-lg font-semibold">
                      {payslip.standardWorkDays} ngày
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lương gộp</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(payslip.grossSalary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khấu trừ bảo hiểm</p>
                    <p className="text-lg font-semibold text-red-600">
                      -{formatCurrency(payslip.insuranceDeduction)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giảm trừ gia cảnh</p>
                    <p className="text-lg font-semibold">
                      -{formatCurrency(payslip.familyDeduction)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thu nhập tính thuế</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(payslip.assessableIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thuế TNCN</p>
                    <p className="text-lg font-semibold text-red-600">
                      -{formatCurrency(payslip.taxAmount)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-300 mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                      Lương thực nhận
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(payslip.netSalary)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Thông tin khác</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Ngày tạo</p>
                <p className="font-medium">{formatDate(payslip.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(payslip.updatedAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngày thanh toán</p>
                <p className="font-medium">{formatDate(payslip.paidAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailModal;
