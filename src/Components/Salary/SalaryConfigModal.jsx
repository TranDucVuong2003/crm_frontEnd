import React, { useState, useEffect } from "react";
import { XMarkIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import {
  showLoading,
  closeLoading,
  showSuccessAlert,
  showErrorAlert,
} from "../../utils/sweetAlert";
import {
  createSalary,
  getInsuranceStatusById,
  getInsuranceById,
} from "../../Service/ApiService";

const SalaryConfigModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    basicSalary: 10000000,
    workdays: 22,
    commission: 0,
    bonus: 0,
    totalInsurance: 0,
    tax: 0,
    notes: "",
  });

  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [isAutoCalculate, setIsAutoCalculate] = useState(true);
  const [fixedInsuranceData, setFixedInsuranceData] = useState(null);
  const [isFixedTax, setIsFixedTax] = useState(false);

  // Fetch insurance status and data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInsuranceConfig();
    }
  }, [isOpen]);

  const fetchInsuranceConfig = async () => {
    try {
      // Lấy trạng thái toggle cố định thuế
      const statusResponse = await getInsuranceStatusById(1);
      const isFixed = statusResponse.data.status;
      setIsFixedTax(isFixed);

      // Nếu bật cố định thuế, lấy thông tin bảo hiểm id=2
      if (isFixed) {
        const insuranceResponse = await getInsuranceById(2);
        setFixedInsuranceData(insuranceResponse.data);
      }
    } catch (error) {
      console.error("Error fetching insurance config:", error);
    }
  };

  useEffect(() => {
    if (isAutoCalculate) {
      calculateInsuranceAndTax();
    }
  }, [
    formData.basicSalary,
    formData.commission,
    formData.bonus,
    isAutoCalculate,
    isFixedTax,
    fixedInsuranceData,
  ]);

  useEffect(() => {
    // Tính tổng lương
    const total =
      parseFloat(formData.basicSalary || 0) +
      parseFloat(formData.commission || 0) +
      parseFloat(formData.bonus || 0) -
      parseFloat(formData.totalInsurance || 0) -
      parseFloat(formData.tax || 0);
    setCalculatedTotal(total);
  }, [formData]);

  const calculateInsuranceAndTax = () => {
    const basicSalary = parseFloat(formData.basicSalary || 0);
    const commission = parseFloat(formData.commission || 0);
    const bonus = parseFloat(formData.bonus || 0);

    // Tính bảo hiểm
    let insurance = 0;
    if (isFixedTax && fixedInsuranceData) {
      // Nếu bật cố định thuế, sử dụng giá trị từ insurance id=2
      if (fixedInsuranceData.cost > 0) {
        // Nếu có cost cố định, dùng cost
        insurance = fixedInsuranceData.cost;
      } else {
        // Nếu không, tính theo rate
        insurance = Math.round(basicSalary * (fixedInsuranceData.rate / 100));
      }
    } else {
      // Tính bảo hiểm bình thường (10.5% lương cơ bản)
      insurance = Math.round(basicSalary * 0.105);
    }

    // Tính thuế TNCN
    const grossIncome = basicSalary + commission + bonus;
    const tax = calculatePersonalIncomeTax(grossIncome);

    setFormData((prev) => ({
      ...prev,
      totalInsurance: insurance,
      tax: tax,
    }));
  };

  const calculatePersonalIncomeTax = (grossIncome) => {
    // Giảm trừ gia cảnh: 11,000,000 VND
    const deduction = 11000000;
    const taxableIncome = grossIncome - deduction;

    if (taxableIncome <= 0) return 0;

    let tax = 0;

    if (taxableIncome <= 5000000) {
      tax = taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      tax = 5000000 * 0.05 + (taxableIncome - 5000000) * 0.1;
    } else if (taxableIncome <= 18000000) {
      tax = 5000000 * 0.05 + 5000000 * 0.1 + (taxableIncome - 10000000) * 0.15;
    } else if (taxableIncome <= 32000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        (taxableIncome - 18000000) * 0.2;
    } else if (taxableIncome <= 52000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        (taxableIncome - 32000000) * 0.25;
    } else if (taxableIncome <= 80000000) {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        20000000 * 0.25 +
        (taxableIncome - 52000000) * 0.3;
    } else {
      tax =
        5000000 * 0.05 +
        5000000 * 0.1 +
        8000000 * 0.15 +
        14000000 * 0.2 +
        20000000 * 0.25 +
        28000000 * 0.3 +
        (taxableIncome - 80000000) * 0.35;
    }

    return Math.round(tax);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "notes" ? value : value === "" ? "" : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee) return;

    showLoading("Đang lưu cấu hình lương...");

    try {
      const payload = {
        userId: employee.id,
        basicSalary: parseFloat(formData.basicSalary),
        workdays: parseInt(formData.workdays),
        commission: parseFloat(formData.commission),
        bonus: parseFloat(formData.bonus),
        totalInsurance: parseFloat(formData.totalInsurance),
        tax: parseFloat(formData.tax),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        notes: formData.notes,
      };

      await createSalary(payload);

      closeLoading();
      showSuccessAlert("Đã lưu cấu hình lương thành công!");
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        basicSalary: 10000000,
        workdays: 22,
        commission: 0,
        bonus: 0,
        totalInsurance: 0,
        tax: 0,
        notes: "",
      });
    } catch (error) {
      closeLoading();
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi lưu cấu hình lương!";
      showErrorAlert(errorMessage);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  if (!isOpen || !employee) return null;

  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Cấu hình lương - {employee.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {employee.email} • {employee.position?.positionName || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tháng/Năm */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {[...Array(5)].map((_, i) => {
                  const year = currentDate.getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Toggle tự động tính */}
          <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CalculatorIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Tự động tính bảo hiểm & thuế
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoCalculate}
                onChange={(e) => setIsAutoCalculate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Thông tin lương */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lương cơ bản <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                step="100000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.basicSalary)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số ngày công <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="workdays"
                value={formData.workdays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
                max="31"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoa hồng
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="100000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.commission)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thưởng
              </label>
              <input
                type="number"
                name="bonus"
                value={formData.bonus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="100000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.bonus)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bảo hiểm{" "}
                {isAutoCalculate &&
                  (isFixedTax && fixedInsuranceData
                    ? `(Cố định - ${fixedInsuranceData.nameInsurance}: ${fixedInsuranceData.rate}%)`
                    : "(Tự động - 10.5%)")}
              </label>
              <input
                type="number"
                name="totalInsurance"
                value={formData.totalInsurance}
                onChange={handleInputChange}
                disabled={isAutoCalculate && isFixedTax}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isAutoCalculate && isFixedTax
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                min="0"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.totalInsurance)}
                {isFixedTax && fixedInsuranceData && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (Áp dụng: {fixedInsuranceData.nameInsurance})
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thuế TNCN {isAutoCalculate && "(Tự động)"}
              </label>
              <input
                type="number"
                name="tax"
                value={formData.tax}
                onChange={handleInputChange}
                disabled={isAutoCalculate}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isAutoCalculate ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                min="0"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(formData.tax)}
              </p>
            </div>
          </div>

          {/* Tổng lương */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Tổng lương thực nhận:
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>
                = Lương cơ bản ({formatCurrency(formData.basicSalary)}) + Hoa
                hồng ({formatCurrency(formData.commission)}) + Thưởng (
                {formatCurrency(formData.bonus)})
              </p>
              <p>
                - Bảo hiểm ({formatCurrency(formData.totalInsurance)}) - Thuế (
                {formatCurrency(formData.tax)})
              </p>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập ghi chú (nếu có)..."
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryConfigModal;
