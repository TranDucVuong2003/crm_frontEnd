import React from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon as MailIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import { showError } from "../../utils/sweetAlert";

const CustomerRow = ({
  customer,
  onEdit,
  onDelete,
  onView,
  onCreateSaleOrder,
}) => {
  // Validate customer has complete information before creating sale order
  const validateCustomerForSaleOrder = () => {
    if (customer.customerType === "individual") {
      // Required fields for individual
      const missingFields = [];

      if (!customer.name || customer.name.trim() === "")
        missingFields.push("Họ tên");
      if (!customer.address || customer.address.trim() === "")
        missingFields.push("Địa chỉ");
      if (!customer.birthDate || customer.birthDate.trim() === "")
        missingFields.push("Ngày sinh");
      if (!customer.idNumber || customer.idNumber.trim() === "")
        missingFields.push("Số CMND/Hộ chiếu");
      if (!customer.phoneNumber || customer.phoneNumber.trim() === "")
        missingFields.push("Số điện thoại");
      if (!customer.email || customer.email.trim() === "")
        missingFields.push("Email");

      if (missingFields.length > 0) {
        showError(
          "Thông tin khách hàng chưa đầy đủ!",
          `Vui lòng cập nhật các trường sau trước khi tạo Sale Order:\n${missingFields.join(
            ", "
          )}`
        );
        return false;
      }
    } else if (customer.customerType === "company") {
      // Required fields for company
      const missingFields = [];

      if (!customer.companyName || customer.companyName.trim() === "")
        missingFields.push("Tên công ty");
      if (!customer.companyAddress || customer.companyAddress.trim() === "")
        missingFields.push("Địa chỉ công ty");
      if (!customer.establishedDate || customer.establishedDate.trim() === "")
        missingFields.push("Ngày thành lập");
      if (!customer.taxCode || customer.taxCode.trim() === "")
        missingFields.push("Mã số thuế");
      if (
        !customer.representativeName ||
        customer.representativeName.trim() === ""
      )
        missingFields.push("Họ tên người đại diện");
      if (
        !customer.representativePosition ||
        customer.representativePosition.trim() === ""
      )
        missingFields.push("Chức vụ người đại diện");
      if (
        !customer.representativeIdNumber ||
        customer.representativeIdNumber.trim() === ""
      )
        missingFields.push("Số CMND người đại diện");
      if (
        !customer.representativePhone ||
        customer.representativePhone.trim() === ""
      )
        missingFields.push("Số điện thoại người đại diện");
      if (
        !customer.representativeEmail ||
        customer.representativeEmail.trim() === ""
      )
        missingFields.push("Email người đại diện");
      if (!customer.techContactName || customer.techContactName.trim() === "")
        missingFields.push("Họ tên liên hệ kỹ thuật");
      if (!customer.techContactPhone || customer.techContactPhone.trim() === "")
        missingFields.push("Số điện thoại liên hệ kỹ thuật");
      if (!customer.techContactEmail || customer.techContactEmail.trim() === "")
        missingFields.push("Email liên hệ kỹ thuật");

      if (missingFields.length > 0) {
        showError(
          "Thông tin công ty chưa đầy đủ!",
          `Vui lòng cập nhật các trường sau trước khi tạo Sale Order:\n${missingFields.join(
            ", "
          )}`
        );
        return false;
      }
    }

    return true;
  };

  const handleCreateSaleOrder = () => {
    if (validateCustomerForSaleOrder()) {
      onCreateSaleOrder(customer);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "potential":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get the display name based on customer type
  const displayName =
    customer.customerType === "individual"
      ? customer.name?.trim() || "N/A"
      : customer.companyName?.trim() || "N/A";
  const nameInitial =
    displayName !== "N/A" ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {nameInitial}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {displayName}
            </div>
            <div className="text-sm text-gray-500">
              {customer.customerType === "individual"
                ? customer.email || ""
                : customer.representativeName || ""}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          {customer.customerType === "individual"
            ? customer.phoneNumber || "N/A"
            : customer.representativePhone || customer.phoneNumber || "N/A"}
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
          {customer.customerType === "individual"
            ? customer.email || "N/A"
            : customer.representativeEmail || customer.email || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {customer.customerType === "individual"
          ? customer.address || "N/A"
          : customer.companyAddress || customer.address || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex flex-col">
          <span className="font-medium">
            {customer.customerType === "individual" ? "Cá nhân" : "Công ty"}
          </span>
          {customer.customerType === "individual" && customer.referrer && (
            <span className="text-xs text-gray-500 mt-1">
              Giới thiệu: {customer.referrer}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <div className="truncate" title={customer.notes || ""}>
          {customer.notes || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            customer.status
          )}`}
        >
          {customer.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onView(customer)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(customer)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleCreateSaleOrder}
            className="text-green-600 hover:text-green-900"
            title="Tạo Sale Order"
          >
            <DocumentPlusIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="text-red-600 hover:text-red-900"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CustomerRow;
