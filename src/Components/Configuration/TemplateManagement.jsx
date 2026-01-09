import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowDownTrayIcon,
  CodeBracketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  getAllDocumentTemplates,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
  setDefaultDocumentTemplate,
  migrateDocumentTemplatesFromFiles,
  getSchemaEntities,
} from "../../Service/ApiService";
import { templateService } from "../../Service/templateService";
import Swal from "sweetalert2";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [schemaPlaceholders, setSchemaPlaceholders] = useState({}); // Schema data from API
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(""); // Selected entity tab
  const [placeholderSearch, setPlaceholderSearch] = useState(""); // Search in placeholders
  const [availableEntities, setAvailableEntities] = useState([]); // Available entities from schema API
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0); // Track cursor position
  const editorRef = useRef(null); // Reference to editor textarea
  const [formData, setFormData] = useState({
    name: "",
    templateType: "contract",
    code: "",
    htmlContent: `
<!-- Đây là template trắng. --> </br>
<!-- Bạn có thể sửa từ template trắng hoặc load template từ kho--> </br>
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`,
    description: "",
    selectedSchemaEntity: "",
    version: 1,
    isActive: true,
    isDefault: false,
  });
  const [viewMode, setViewMode] = useState("html"); // "html" or "preview" for view modal

  // Placeholders definition theo template type
  const placeholdersByType = {
    contract: [
      { label: "Tên khách hàng", value: "{{CustomerName}}" },
      { label: "Địa chỉ khách hàng", value: "{{CustomerAddress}}" },
      { label: "Số điện thoại", value: "{{CustomerPhone}}" },
      { label: "Email khách hàng", value: "{{CustomerEmail}}" },
      { label: "Số hợp đồng", value: "{{ContractNumber}}" },
      { label: "Ngày hợp đồng", value: "{{ContractDate}}" },
      { label: "Tổng giá trị", value: "{{TotalAmount}}" },
      { label: "Tên dịch vụ", value: "{{ServiceName}}" },
      { label: "Ngày bắt đầu", value: "{{StartDate}}" },
      { label: "Ngày kết thúc", value: "{{EndDate}}" },
    ],
    quote: [
      { label: "Tên khách hàng", value: "{{CustomerName}}" },
      { label: "Số báo giá", value: "{{QuoteNumber}}" },
      { label: "Ngày báo giá", value: "{{QuoteDate}}" },
      { label: "Hiệu lực đến", value: "{{ValidUntil}}" },
      { label: "Tổng giá trị", value: "{{TotalAmount}}" },
      { label: "Bảng sản phẩm", value: "{{ItemsTable}}" },
      { label: "Ghi chú", value: "{{Notes}}" },
    ],
    salary_report: [
      { label: "Tháng", value: "{{Month}}" },
      { label: "Năm", value: "{{Year}}" },
      { label: "Tên phòng ban", value: "{{DepartmentName}}" },
      { label: "Bảng nhân viên", value: "{{EmployeesTable}}" },
      { label: "Tổng lương", value: "{{TotalSalary}}" },
      { label: "Ngày tạo", value: "{{CreatedDate}}" },
      { label: "Người tạo", value: "{{CreatedBy}}" },
    ],
    email: [
      { label: "Tên người dùng", value: "{{Username}}" },
      { label: "Email", value: "{{Email}}" },
      { label: "Link đặt lại mật khẩu", value: "{{PasswordResetLink}}" },
      { label: "Mã OTP", value: "{{OTPCode}}" },
      { label: "Nội dung thông báo", value: "{{NotificationMessage}}" },
      { label: "Số tiền thanh toán", value: "{{PaymentAmount}}" },
      { label: "Mã giao dịch", value: "{{TransactionId}}" },
    ],
  };

  const templateTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "contract", label: "Hợp đồng" },
    { value: "quote", label: "Báo giá" },
    { value: "email", label: "Email" },
    { value: "salary_report", label: "Báo cáo lương" },
  ];

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  // Auto-detect placeholders khi HTML thay đổi
  useEffect(() => {
    const detectPlaceholders = async () => {
      if (!formData.htmlContent || formData.htmlContent.length < 10) {
        setDetectedPlaceholders([]);
        return;
      }

      try {
        const placeholders = await templateService.extractPlaceholders(
          formData.htmlContent
        );
        setDetectedPlaceholders(placeholders);
      } catch (error) {
        console.error("Error detecting placeholders:", error);
      }
    };

    const debounce = setTimeout(detectPlaceholders, 800);
    return () => clearTimeout(debounce);
  }, [formData.htmlContent]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getAllDocumentTemplates(filterType || null);
      if (response.data && response.data.data) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách bản mẫu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        templateType: template.templateType,
        code: template.code,
        htmlContent: template.htmlContent,
        description: template.description || "",
        selectedSchemaEntity: "",
        version: template.version || 1,
        isActive: template.isActive,
        isDefault: template.isDefault,
      });
      setAvailableTemplates([]); // Không cần load templates khi edit

      // Load schema and entities for editing template
      await fetchSchemaEntities(template.templateType);
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        templateType: "contract",
        code: "",
        htmlContent: `
<!-- Đây là template trắng. -->
<!-- Bạn có thể sửa từ template trắng hoặc load template từ kho-->

        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`,
        description: "",
        selectedSchemaEntity: "",
        version: 1,
        isActive: true,
        isDefault: false,
      });

      // Load tất cả templates để chọn (không filter)
      try {
        const response = await getAllDocumentTemplates(null);
        if (response.data && response.data.data) {
          setAvailableTemplates(response.data.data);
        } else {
          setAvailableTemplates([]);
        }
      } catch (error) {
        console.error("Error loading available templates:", error);
        setAvailableTemplates([]);
      }

      // Load schema and entities for new template (default: contract)
      await fetchSchemaEntities("contract");
    }
    setViewMode("html");
    setPlaceholderSearch("");
    setIsModalOpen(true);
  };

  const fetchSchemaEntities = async (templateType) => {
    try {
      setLoadingEntities(true);
      const response = await templateService.getAvailablePlaceholders(
        templateType
      );

      console.log("Schema response:", response); // Debug log

      // Response structure: { data: { Contract: [...], Customer: [...] } }
      if (response && typeof response === "object") {
        // Get entities from data object keys
        const entities = Object.keys(response);
        setAvailableEntities(entities);
        // Store the full schema data for later use
        setSchemaPlaceholders(response);

        console.log("Entities found:", entities); // Debug log
      } else {
        setAvailableEntities([]);
        setSchemaPlaceholders({});
      }
    } catch (error) {
      console.error("Error fetching schema entities:", error);
      setAvailableEntities([]);
      setSchemaPlaceholders({});
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách entities",
      });
    } finally {
      setLoadingEntities(false);
    }
  };

  const handleLoadFromTemplate = (templateId) => {
    if (!templateId) return;

    const selectedTemplate = availableTemplates.find(
      (t) => t.id === parseInt(templateId)
    );

    if (selectedTemplate) {
      Swal.fire({
        title: "Tải nội dung từ template?",
        text: `Bạn muốn tải nội dung từ template "${selectedTemplate.name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Tải",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          setFormData({
            ...formData,
            htmlContent: selectedTemplate.htmlContent,
            templateType: selectedTemplate.templateType,
          });

          Swal.fire({
            icon: "success",
            title: "Đã tải!",
            text: `Đã tải nội dung từ template "${selectedTemplate.name}"`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setDetectedPlaceholders([]);
    setAvailableTemplates([]);
    setSchemaPlaceholders({});
    setSelectedEntity("");
    setPlaceholderSearch("");
    setFormData({
      name: "",
      templateType: "contract",
      code: "",
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`,
      description: "",
      version: 1,
      isActive: true,
      isDefault: false,
    });
  };

  const handleViewTemplate = (template) => {
    setViewingTemplate(template);
    setViewMode("preview"); // Default to preview mode for viewing
    setIsViewModalOpen(true);
  };

  // Insert placeholder at cursor position
  const insertPlaceholderAtCursor = (placeholder) => {
    const textarea = document.querySelector("#htmlContentTextarea textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const textBefore = formData.htmlContent.substring(0, start);
      const textAfter = formData.htmlContent.substring(end);
      const newContent = textBefore + placeholder + textAfter;

      setFormData({
        ...formData,
        htmlContent: newContent,
      });

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        if (textarea) {
          const newPosition = start + placeholder.length;
          textarea.setSelectionRange(newPosition, newPosition);
          textarea.focus();
        }
      }, 0);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTemplate(null);
    setViewMode("preview"); // Reset mode
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Vui lòng nhập tên bản mẫu",
      });
      return;
    }

    if (!formData.code.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Vui lòng nhập mã bản mẫu",
      });
      return;
    }

    if (!formData.htmlContent.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: "Vui lòng nhập nội dung HTML",
      });
      return;
    }

    // Validate placeholders với Schema API
    if (detectedPlaceholders.length > 0) {
      try {
        const placeholdersToValidate = detectedPlaceholders.map(
          (p) => `{{${p}}}`
        );
        const validation = await templateService.validatePlaceholderSchema(
          placeholdersToValidate,
          formData.templateType
        );

        if (!validation.isValid && validation.invalidPlaceholders) {
          const result = await Swal.fire({
            icon: "warning",
            title: "Placeholders không hợp lệ",
            html: `
              <p>Phát hiện ${
                validation.invalidPlaceholders.length
              } placeholders không hợp lệ:</p>
              <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                ${validation.invalidPlaceholders
                  .map(
                    (p) =>
                      `<div style="font-family: monospace; color: #dc2626; margin: 4px 0;">⚠️ ${p}</div>`
                  )
                  .join("")}
              </div>
              <p style="margin-top: 10px;">Bạn có muốn tiếp tục lưu?</p>
            `,
            showCancelButton: true,
            confirmButtonText: "Tiếp tục lưu",
            cancelButtonText: "Kiểm tra lại",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
          });

          if (!result.isConfirmed) {
            return; // User chọn "Kiểm tra lại"
          }
        }
      } catch (error) {
        console.error("Error validating placeholders:", error);
        // Không block nếu validation API fail, chỉ log error
      }
    }

    try {
      const payload = {
        name: formData.name.trim(),
        templateType: formData.templateType,
        code: formData.code.trim(),
        htmlContent: formData.htmlContent.trim(),
        description: formData.description.trim() || null,
        version: editingTemplate ? formData.version : 1,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };

      if (editingTemplate) {
        // Add id to payload for update request
        payload.id = editingTemplate.id;
        await updateDocumentTemplate(editingTemplate.id, payload);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật bản mẫu thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createDocumentTemplate(payload);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thêm bản mẫu thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text:
          error.response?.data?.message ||
          "Không thể lưu bản mẫu. Vui lòng thử lại.",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa bản mẫu này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteDocumentTemplate(id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          text: "Xóa bản mẫu thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa bản mẫu",
        });
      }
    }
  };

  const handleSetDefault = async (id, name) => {
    const result = await Swal.fire({
      title: "Đặt làm mặc định",
      text: `Bạn có muốn đặt "${name}" làm template mặc định?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await setDefaultDocumentTemplate(id);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Đã đặt làm template mặc định",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchTemplates();
      } catch (error) {
        console.error("Error setting default template:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text:
            error.response?.data?.message || "Không thể đặt template mặc định",
        });
      }
    }
  };

  const handleMigrateFromFiles = async () => {
    const result = await Swal.fire({
      title: "Migrate Templates",
      text: "Bạn có chắc chắn muốn migrate tất cả templates từ files vào database?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Migrate",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await migrateDocumentTemplatesFromFiles();
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text:
            response.data?.message || "Đã migrate tất cả templates thành công",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchTemplates();
      } catch (error) {
        console.error("Error migrating templates:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Không thể migrate templates",
        });
      }
    }
  };

  const getTemplateTypeLabel = (type) => {
    const found = templateTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý Bản mẫu
          </h2>
          <div className="flex gap-3">
            {/* <button
              onClick={handleMigrateFromFiles}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Migrate templates từ files vào database"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Migrate
            </button> */}
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Thêm bản mẫu mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {templateTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên / Mã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm || filterType
                    ? "Không tìm thấy bản mẫu nào"
                    : "Chưa có bản mẫu nào"}
                </td>
              </tr>
            ) : (
              filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {template.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500">{template.code}</div>
                    {template.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {template.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getTemplateTypeLabel(template.templateType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    v{template.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "px-2 py-1 text-xs rounded-full " +
                          (template.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800")
                        }
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                      {template.isDefault && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Default
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewTemplate(template)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="Xem"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() =>
                          handleSetDefault(template.id, template.name)
                        }
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        title="Đặt làm mặc định"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(template)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="fixed inset-0 bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[80vw] max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingTemplate ? "Chỉnh sửa bản mẫu" : "Thêm bản mẫu mới"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

              {/* Modal Body - 2 columns layout */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 overflow-hidden"
              >
                {/* Left Column - Form Fields */}
                <div className="w-96 border-r border-gray-200 overflow-y-auto p-6 space-y-4">
                  {/* Load from Template - Only show when creating new */}
                  {!editingTemplate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tải từ template có sẵn
                      </label>
                      <select
                        onChange={(e) => {
                          console.log("Selected template ID:", e.target.value);
                          handleLoadFromTemplate(e.target.value);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {availableTemplates.length === 0
                            ? "Đang tải..."
                            : `Chọn template (${availableTemplates.length} có sẵn)`}
                        </option>
                        {availableTemplates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} - [{template.code}]
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Chọn để tự động điền HTML, loại và placeholders
                      </p>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên bản mẫu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Contract Template"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã định danh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: CONTRACT_DEFAULT"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại bản mẫu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.templateType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData({
                          ...formData,
                          templateType: newType,
                          selectedSchemaEntity: "",
                        });
                        // Reload schema and entities when template type changes
                        if (newType && newType !== formData.templateType) {
                          fetchSchemaEntities(newType);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="" disabled>
                        Chọn loại bản mẫu...
                      </option>
                      <option value="contract">Hợp đồng</option>
                      <option value="quote">Báo giá</option>
                      <option value="email">Email</option>
                      <option value="salary_report">Báo cáo lương</option>
                      <option value="invoice">Hóa đơn</option>
                      <option value="salary_notification">
                        Thông báo lương
                      </option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Schema sẽ tự động cập nhật khi đổi loại
                    </p>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isDefault: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Mặc định
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Nhập mô tả cho bản mẫu..."
                    />
                  </div>

                  {/* Schema-based Placeholders Browser */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                      <label className="text-sm font-medium text-gray-700">
                        📋 Chèn biến động (Schema)
                      </label>
                    </div>

                    {loadingSchema ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Đang tải schema...
                      </div>
                    ) : Object.keys(schemaPlaceholders).length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không có placeholders cho loại template này
                      </div>
                    ) : (
                      <>
                        {/* Entity Tabs */}
                        <div className="flex overflow-x-auto border-b border-gray-200">
                          {Object.keys(schemaPlaceholders).map((entity) => (
                            <button
                              key={entity}
                              type="button"
                              onClick={() => setSelectedEntity(entity)}
                              className={
                                "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors " +
                                (selectedEntity === entity
                                  ? "border-blue-600 text-blue-600 bg-blue-50"
                                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                              }
                            >
                              {entity}
                              <span className="ml-1 text-gray-400">
                                ({schemaPlaceholders[entity].length})
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Search */}
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="🔍 Tìm kiếm..."
                            value={placeholderSearch}
                            onChange={(e) =>
                              setPlaceholderSearch(e.target.value)
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Placeholder List */}
                        <div className="max-h-64 overflow-y-auto">
                          {selectedEntity &&
                            schemaPlaceholders[selectedEntity] &&
                            schemaPlaceholders[selectedEntity]
                              .filter(
                                (field) =>
                                  !placeholderSearch ||
                                  field.name
                                    .toLowerCase()
                                    .includes(
                                      placeholderSearch.toLowerCase()
                                    ) ||
                                  field.placeholder
                                    .toLowerCase()
                                    .includes(placeholderSearch.toLowerCase())
                              )
                              .map((field) => (
                                <button
                                  key={field.name}
                                  type="button"
                                  onClick={() => {
                                    insertPlaceholderAtCursor(
                                      field.placeholder
                                    );
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 transition-colors group"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono text-xs text-blue-600 group-hover:text-blue-700 truncate">
                                        {field.placeholder}
                                      </div>
                                      {field.description && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {field.description}
                                        </div>
                                      )}
                                      {field.example && (
                                        <div className="text-xs text-gray-400 mt-0.5 italic">
                                          VD: {field.example}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span
                                        className={
                                          "px-1.5 py-0.5 text-xs rounded whitespace-nowrap " +
                                          (field.type === "string"
                                            ? "bg-green-100 text-green-700"
                                            : field.type === "number"
                                            ? "bg-blue-100 text-blue-700"
                                            : field.type === "date"
                                            ? "bg-purple-100 text-purple-700"
                                            : field.type === "boolean"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700")
                                        }
                                      >
                                        {field.type}
                                      </span>
                                      {field.isRequired && (
                                        <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700 whitespace-nowrap">
                                          required
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Legacy Dropdown - Fallback */}
                  {Object.keys(schemaPlaceholders).length === 0 &&
                    !loadingSchema && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chèn biến động (Legacy)
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              insertPlaceholderAtCursor(e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn placeholder...</option>
                          {placeholdersByType[formData.templateType]?.map(
                            (placeholder) => (
                              <option
                                key={placeholder.value}
                                value={placeholder.value}
                              >
                                {placeholder.label} - {placeholder.value}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                  {/* Auto-Detected Placeholders */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      Đã phát hiện ({detectedPlaceholders.length})
                    </h4>
                    {detectedPlaceholders.length === 0 ? (
                      <p className="text-xs text-gray-600">
                        Chưa có placeholder nào. Sử dụng syntax{" "}
                        <code className="bg-white px-1 py-0.5 rounded text-green-700">
                          {`{{Entity.Property}}`} hoặc {`{{Property}}`}
                        </code>
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {detectedPlaceholders.map((p, index) => {
                          // Check if placeholder is valid in schema
                          const fullPlaceholder = `{{${p}}}`;
                          let isValid = false;
                          let fieldInfo = null;

                          // Search in schema
                          for (const [entity, fields] of Object.entries(
                            schemaPlaceholders
                          )) {
                            const found = fields.find(
                              (f) => f.placeholder === fullPlaceholder
                            );
                            if (found) {
                              isValid = true;
                              fieldInfo = found;
                              break;
                            }
                          }

                          return (
                            <div
                              key={index}
                              className={
                                "text-xs font-mono bg-white px-2 py-1 rounded flex items-center justify-between " +
                                (isValid ? "text-green-700" : "text-orange-600")
                              }
                            >
                              <span>
                                {isValid ? "✓" : "⚠"} {fullPlaceholder}
                              </span>
                              {fieldInfo && (
                                <span
                                  className={
                                    "px-1.5 py-0.5 text-xs rounded ml-2 " +
                                    (fieldInfo.type === "string"
                                      ? "bg-green-100 text-green-700"
                                      : fieldInfo.type === "number"
                                      ? "bg-blue-100 text-blue-700"
                                      : fieldInfo.type === "date"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700")
                                  }
                                >
                                  {fieldInfo.type}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - HTML Editor & Preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700">
                      Nội dung HTML <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("html")}
                        className={
                          "px-3 py-1 text-xs rounded flex items-center gap-1 " +
                          (viewMode === "html"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                        }
                      >
                        <CodeBracketIcon className="h-4 w-4" />
                        HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={
                          "px-3 py-1 text-xs rounded flex items-center gap-1 " +
                          (viewMode === "preview"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                        }
                      >
                        <EyeIcon className="h-4 w-4" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Editor Content */}
                  <div className="flex-1 overflow-auto p-6">
                    {viewMode === "html" ? (
                      <div
                        id="htmlContentTextarea"
                        className="w-full h-full border border-gray-300 rounded-lg overflow-auto"
                        style={{ minHeight: "600px" }}
                      >
                        <Editor
                          value={formData.htmlContent}
                          onValueChange={(code) =>
                            setFormData({
                              ...formData,
                              htmlContent: code,
                            })
                          }
                          highlight={(code) =>
                            highlight(code, languages.markup, "markup")
                          }
                          padding={16}
                          style={{
                            fontFamily: '"Fira Code", "Courier New", monospace',
                            fontSize: 14,
                            minHeight: "600px",
                            backgroundColor: "#1e1e1e",
                            color: "#d4d4d4",
                          }}
                          textareaClassName="focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={formData.htmlContent}
                          className="w-full h-full border-0"
                          style={{ minHeight: "600px" }}
                          title="Template Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingTemplate ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="fixed inset-0 bg-opacity-50 transition-opacity"
            onClick={handleCloseViewModal}
          ></div>

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[80vw] max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white z-10">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết bản mẫu
                  </h3>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

              {/* Modal Body - 2 columns layout */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Column - Info */}
                <div className="w-80 border-r border-gray-200 overflow-y-auto p-6 space-y-6">
                  {/* Info Grid */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingTemplate.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Tên
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingTemplate.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Mã
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {viewingTemplate.code}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Loại
                      </label>
                      <p className="mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getTemplateTypeLabel(viewingTemplate.templateType)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Version
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        v{viewingTemplate.version}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </label>
                      <div className="mt-1 flex gap-2">
                        <span
                          className={
                            "px-2 py-1 text-xs rounded-full " +
                            (viewingTemplate.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800")
                          }
                        >
                          {viewingTemplate.isActive ? "Active" : "Inactive"}
                        </span>
                        {viewingTemplate.isDefault && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {viewingTemplate.description && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-500">
                        Mô tả
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingTemplate.description}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Tạo bởi:</span>{" "}
                        {viewingTemplate.createdByUser?.username ||
                          "User #" + viewingTemplate.createdByUserId}
                      </div>
                      <div>
                        <span className="font-medium">Ngày tạo:</span>{" "}
                        {new Date(viewingTemplate.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </div>
                      {viewingTemplate.updatedAt && (
                        <div>
                          <span className="font-medium">
                            Cập nhật lần cuối:
                          </span>{" "}
                          {new Date(viewingTemplate.updatedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700">
                      Nội dung HTML
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("html")}
                        className={
                          "px-3 py-1 text-xs rounded flex items-center gap-1 " +
                          (viewMode === "html"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                        }
                      >
                        <CodeBracketIcon className="h-4 w-4" />
                        HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={
                          "px-3 py-1 text-xs rounded flex items-center gap-1 " +
                          (viewMode === "preview"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                        }
                      >
                        <EyeIcon className="h-4 w-4" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 overflow-auto p-6">
                    {viewMode === "html" ? (
                      <div className="w-full h-full border border-gray-300 rounded-lg overflow-auto">
                        <Editor
                          value={viewingTemplate.htmlContent}
                          onValueChange={() => {}}
                          highlight={(code) =>
                            highlight(code, languages.markup, "markup")
                          }
                          padding={16}
                          style={{
                            fontFamily: '"Fira Code", "Courier New", monospace',
                            fontSize: 14,
                            minHeight: "800px",
                            backgroundColor: "#1e1e1e",
                            color: "#d4d4d4",
                          }}
                          textareaClassName="focus:outline-none"
                          disabled={true}
                        />
                      </div>
                    ) : (
                      <div className="h-full">
                        <iframe
                          srcDoc={viewingTemplate.htmlContent}
                          className="w-full h-full border-0 rounded-lg shadow-inner"
                          style={{ minHeight: "800px" }}
                          title="Template Preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-white">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleOpenModal(viewingTemplate);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
