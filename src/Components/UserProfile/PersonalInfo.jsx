import React, { useState, useEffect } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../Context/AuthContext";
import { getUserById, updateUser } from "../../Service/ApiService";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";

const PersonalInfo = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await getUserById(user.id);
      setUserInfo(response.data);
      setFormData({
        fullName: response.data.fullName || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || "",
        address: response.data.address || "",
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      showErrorAlert("Lỗi", "Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      showLoading("Đang cập nhật...");
      await updateUser(user.id, formData);
      await fetchUserInfo();
      setIsEditing(false);
      closeLoading();
      showSuccessAlert("Thành công", "Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating user info:", error);
      closeLoading();
      showErrorAlert("Lỗi", "Không thể cập nhật thông tin");
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: userInfo?.fullName || "",
      email: userInfo?.email || "",
      phoneNumber: userInfo?.phoneNumber || "",
      address: userInfo?.address || "",
    });
    setIsEditing(false);
  };

  if (loading && !userInfo) {
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
            Thông tin cá nhân
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                Lưu
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Hủy
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ và tên */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4" />
              Họ và tên
            </label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                {userInfo?.fullName || "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="h-4 w-4" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                {userInfo?.email || "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="h-4 w-4" />
              Số điện thoại
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                {userInfo?.phoneNumber || "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Phòng ban */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <BuildingOfficeIcon className="h-4 w-4" />
              Phòng ban
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
              {userInfo?.department?.name || "Chưa phân bổ"}
            </p>
          </div>

          {/* Chức vụ */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <BriefcaseIcon className="h-4 w-4" />
              Chức vụ
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
              {userInfo?.position?.name || "Chưa có chức vụ"}
            </p>
          </div>

          {/* Vai trò */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="h-4 w-4" />
              Vai trò
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
              {userInfo?.role?.name || "User"}
            </p>
          </div>

          {/* Địa chỉ */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4" />
              Địa chỉ
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                {userInfo?.address || "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Ngày tham gia */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4" />
              Ngày tham gia
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
              {userInfo?.createdAt
                ? new Date(userInfo.createdAt).toLocaleDateString("vi-VN")
                : "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
