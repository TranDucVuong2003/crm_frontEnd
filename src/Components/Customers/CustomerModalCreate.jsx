import React from "react";
import { useState, useEffect } from "react";
import { createCustomer } from "../../Service/ApiService";
import { successToast, showError } from "../../utils/sweetAlert";

const CustomerModal = ({ isOpen, onClose, customer = null, onSave }) => {
  const [customerType, setCustomerType] = useState("individual"); // individual or company
  
  const initialFormData = {
    // Common fields
    customerType: "individual",
    status: "",
    notes: "",
    isActive: true,

    // Individual fields
    name: "",
    address: "",
    birthDate: "",
    idNumber: "",
    phoneNumber: "",
    email: "",
    domain: "",

    // Company fields
    companyName: "",
    companyAddress: "",
    establishedDate: "",
    taxCode: "",
    companyDomain: "",

    // Representative info
    representativeName: "",
    representativePosition: "",
    representativeIdNumber: "",
    representativePhone: "",
    representativeEmail: "",

    // Technical contact
    techContactName: "",
    techContactPhone: "",
    techContactEmail: "",
  };

  const [formData, setFormData] = useState(customer || initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update customerType in formData when customerType changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, customerType }));
  }, [customerType]);

  // Handle form population when modal opens
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        // Editing existing customer - populate form with customer data
        const editFormData = {
          ...initialFormData,
          ...customer,
          // Convert dates to proper format for inputs
          birthDate: customer.birthDate ? new Date(customer.birthDate).toISOString().split('T')[0] : '',
          establishedDate: customer.establishedDate ? new Date(customer.establishedDate).toISOString().split('T')[0] : ''
        };
        setFormData(editFormData);
        setCustomerType(customer.customerType || "individual");
        setError("");
      } else {
        // Creating new customer - reset form
        setFormData(initialFormData);
        setCustomerType("individual");
        setError("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare data for API - format dates and set customerType
      const apiData = {
        customerType: customerType,
        isActive: true,
        // Common fields
        status: formData.status || null,
        notes: formData.notes || null,
        // Individual fields
        name: formData.name || null,
        address: formData.address || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate + 'T00:00:00Z').toISOString() : null,
        idNumber: formData.idNumber || null,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        domain: formData.domain || null,
        // Company fields
        companyName: formData.companyName || null,
        companyAddress: formData.companyAddress || null,
        establishedDate: formData.establishedDate ? new Date(formData.establishedDate + 'T00:00:00Z').toISOString() : null,
        taxCode: formData.taxCode || null,
        companyDomain: formData.companyDomain || null,
        // Representative info
        representativeName: formData.representativeName || null,
        representativePosition: formData.representativePosition || null,
        representativeIdNumber: formData.representativeIdNumber || null,
        representativePhone: formData.representativePhone || null,
        representativeEmail: formData.representativeEmail || null,
        // Technical contact
        techContactName: formData.techContactName || null,
        techContactPhone: formData.techContactPhone || null,
        techContactEmail: formData.techContactEmail || null,
      };

      // Call parent's save handler which will handle API calls
      onSave(apiData);
      
      // Reset form after successful creation (only for new customers)
      if (!customer) {
        setFormData(initialFormData);
        setCustomerType("individual");
      }
      
      onClose();
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu thông tin khách hàng");
      showError("Lỗi!", "Có lỗi xảy ra khi lưu thông tin khách hàng");
      console.error("Error saving customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 relative">
          <h2 className="text-lg font-medium text-gray-900">
            {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Customer Type Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4 justify-around">
            <button
              type="button"
              onClick={() => setCustomerType("individual")}
              disabled={!!customer}
              className={`px-4 py-2 rounded-lg font-medium ${
                customerType === "individual"
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                  : "bg-gray-100 text-gray-700 border-2 border-gray-300"
              } ${!!customer ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Cá nhân
            </button>
            <button
              type="button"
              onClick={() => setCustomerType("company")}
              disabled={!!customer}
              className={`px-4 py-2 rounded-lg font-medium ${
                customerType === "company"
                  ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                  : "bg-gray-100 text-gray-700 border-2 border-gray-300"
              } ${!!customer ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Công ty
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {customerType === "individual" ? (
            // Individual Customer Form
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Thông tin đăng ký web cho cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số CMND/Số hộ chiếu
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.idNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, idNumber: e.target.value })
                    }
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                    />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    maxLength={150}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên miền
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            // Company Customer Form
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Thông tin đăng ký web cho công ty
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên công ty
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày thành lập
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.establishedDate}
                      onChange={(e) =>
                        setFormData({ ...formData, establishedDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.taxCode}
                      onChange={(e) =>
                        setFormData({ ...formData, taxCode: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên miền công ty
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.companyDomain}
                      onChange={(e) =>
                        setFormData({ ...formData, companyDomain: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="pending">Đang chờ</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ công ty
                  </label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.companyAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, companyAddress: e.target.value })
                    }
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Thông tin người đại diện công ty
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ tên người đại diện
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.representativeName}
                        onChange={(e) =>
                          setFormData({ ...formData, representativeName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chức vụ người đại diện
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.representativePosition}
                        onChange={(e) =>
                          setFormData({ ...formData, representativePosition: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số CMND/hộ chiếu người đại diện
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.representativeIdNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, representativeIdNumber: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại người đại diện
                      </label>
                      <input
                        type="tel"
                        maxLength={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.representativePhone}
                        onChange={(e) =>
                          setFormData({ ...formData, representativePhone: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email người đại diện
                      </label>
                      <input
                        type="email"
                        maxLength={150}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={formData.representativeEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, representativeEmail: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Thông tin người sẽ làm việc, trao đổi với bộ phận kỹ thuật
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên người liên hệ kỹ thuật
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.techContactName}
                      onChange={(e) =>
                        setFormData({ ...formData, techContactName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại liên hệ kỹ thuật
                    </label>
                    <input
                      type="tel"
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.techContactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, techContactPhone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email liên hệ kỹ thuật
                    </label>
                    <input
                      type="email"
                      maxLength={150}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.techContactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, techContactEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : customer ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
