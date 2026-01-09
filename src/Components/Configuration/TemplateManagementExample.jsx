import React, { useState, useEffect } from "react";
import TemplateEditor from "./TemplateEditor";
import templateService from "../../Service/templateService";
import Swal from "sweetalert2";

/**
 * TemplateManagementExample Component
 * Ví dụ minh họa cách sử dụng TemplateEditor để tạo/edit templates
 */
const TemplateManagementExample = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templateType, setTemplateType] = useState("contract");
  const [templateName, setTemplateName] = useState("");
  const [templateCode, setTemplateCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [templateType]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates(templateType);
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách templates",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateCode("");
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setTemplateName(template.name);
    setTemplateCode(template.code);
  };

  const handleSave = async (htmlContent) => {
    // Validate inputs
    if (!templateName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập tên template",
      });
      return;
    }

    if (!templateCode.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập mã template",
      });
      return;
    }

    try {
      if (selectedTemplate) {
        // Update existing template
        await templateService.updateTemplate(selectedTemplate.id, {
          name: templateName,
          code: templateCode,
          templateType: templateType,
          htmlContent: htmlContent,
        });

        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Template đã được cập nhật",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Create new template
        await templateService.createTemplate({
          name: templateName,
          code: templateCode,
          templateType: templateType,
          htmlContent: htmlContent,
          isActive: true,
          isDefault: false,
        });

        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Template đã được tạo",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // Refresh list
      await fetchTemplates();
      setIsCreating(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể lưu template",
      });
    }
  };

  const handleDelete = async (template) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc chắn muốn xóa template "${template.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await templateService.deleteTemplate(template.id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Template đã được xóa",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa template",
        });
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateCode("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-6 bg-white border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 m-0 mb-2">
            📄 Quản lý Templates
          </h1>
          <p className="text-gray-600 text-sm m-0">
            Tạo và quản lý document templates với Placeholder Schema System
          </p>
        </div>
        <button
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg"
          onClick={handleCreateNew}
        >
          ➕ Tạo Template Mới
        </button>
      </div>

      {/* Template Type Selector */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
        <label className="font-medium text-gray-800">Loại Template:</label>
        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          disabled={isCreating || selectedTemplate !== null}
          className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer outline-none min-w-[250px] focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="contract">Contract - Hợp đồng</option>
          <option value="quote">Quote - Báo giá</option>
          <option value="invoice">Invoice - Hóa đơn</option>
          <option value="salary">Salary - Lương</option>
        </select>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Template List */}
        {!isCreating && !selectedTemplate && (
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <h2 className="text-xl text-gray-800 m-0 mb-5">
              Danh sách Templates
            </h2>
            {loading ? (
              <div className="text-center py-10 text-indigo-600 text-lg">
                ⏳ Đang tải...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 px-5 text-gray-500">
                <p className="mb-5 text-base">Chưa có template nào</p>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2.5 bg-indigo-600 text-white border-none rounded-md cursor-pointer text-sm hover:bg-indigo-700"
                >
                  Tạo template đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="px-4 py-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                      <h3 className="text-base font-semibold m-0">
                        {template.name}
                      </h3>
                      {template.isDefault && (
                        <span className="bg-white/30 px-2 py-1 rounded text-[11px] font-semibold">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs m-0 mb-2 font-mono text-gray-800 font-medium">
                        Code: {template.code}
                      </p>
                      <p className="text-xs text-gray-600 m-0 mb-2">
                        Type: {template.templateType}
                      </p>
                      <p className="text-xs text-gray-600 m-0 mb-2">
                        Version: {template.version}
                      </p>
                    </div>
                    <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
                      <button
                        className="flex-1 px-4 py-2 bg-green-600 text-white border-none rounded text-xs cursor-pointer transition-all hover:bg-green-700"
                        onClick={() => handleEdit(template)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-red-600 text-white border-none rounded text-xs cursor-pointer transition-all hover:bg-red-700"
                        onClick={() => handleDelete(template)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Panel - Template Editor */}
        {(isCreating || selectedTemplate) && (
          <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl text-gray-800 m-0">
                {selectedTemplate
                  ? "✏️ Chỉnh sửa Template"
                  : "➕ Tạo Template Mới"}
              </h2>
              <button
                className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-sm transition-colors hover:bg-red-700"
                onClick={handleCancel}
              >
                ✕ Hủy
              </button>
            </div>

            {/* Template Info Form */}
            <div className="px-6 py-5 border-b border-gray-200 bg-white">
              <div className="mb-4">
                <label className="block mb-1.5 font-medium text-gray-800 text-sm">
                  Tên Template *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ví dụ: Contract Template - Công ty"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 font-medium text-gray-800 text-sm">
                  Mã Template *
                </label>
                <input
                  type="text"
                  value={templateCode}
                  onChange={(e) => setTemplateCode(e.target.value)}
                  placeholder="Ví dụ: CONTRACT_COMPANY_V1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="mb-0">
                <label className="block mb-1.5 font-medium text-gray-800 text-sm">
                  Loại Template
                </label>
                <input
                  type="text"
                  value={templateType}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Template Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <TemplateEditor
                templateType={templateType}
                initialContent={selectedTemplate?.htmlContent || ""}
                onSave={handleSave}
                showToolbar={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManagementExample;
