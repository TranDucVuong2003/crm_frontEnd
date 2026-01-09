import React, { useState, useRef } from "react";
import PlaceholderSelector from "./PlaceholderSelector";
import templateService from "../../Service/templateService";
import Swal from "sweetalert2";

/**
 * TemplateEditor Component
 * Component để edit template với placeholder support
 */
const TemplateEditor = ({
  templateType = "contract",
  initialContent = "",
  onSave,
  showToolbar = true,
}) => {
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [showPlaceholderSelector, setShowPlaceholderSelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const editorRef = useRef(null);

  // Insert placeholder vào vị trí con trỏ
  const handleInsertPlaceholder = (placeholder) => {
    if (editorRef.current) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const before = htmlContent.substring(0, selectionStart);
      const after = htmlContent.substring(selectionEnd);

      const newContent = before + placeholder + after;
      setHtmlContent(newContent);

      // Move cursor after inserted placeholder
      setTimeout(() => {
        if (editorRef.current) {
          const newPosition = selectionStart + placeholder.length;
          editorRef.current.setSelectionRange(newPosition, newPosition);
          editorRef.current.focus();
        }
      }, 0);
    }

    setShowPlaceholderSelector(false);
  };

  // Validate template trước khi lưu
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      // 1. Extract placeholders
      const placeholders = await templateService.extractPlaceholders(
        htmlContent
      );

      if (placeholders.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Không tìm thấy placeholder",
          text: "Template không chứa placeholder nào. Vui lòng thêm placeholders theo cú pháp {{Entity.Property}}",
        });
        setIsValidating(false);
        return false;
      }

      // 2. Validate với schema
      const validation = await templateService.validatePlaceholderSchema(
        placeholders,
        templateType
      );

      if (!validation.isValid && validation.invalidPlaceholders) {
        setValidationErrors(validation.invalidPlaceholders);

        Swal.fire({
          icon: "error",
          title: "Template không hợp lệ",
          html: `
            <div style="text-align: left;">
              <p>Template có <strong>${
                validation.invalidPlaceholders.length
              }</strong> placeholders không hợp lệ:</p>
              <ul style="max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${validation.invalidPlaceholders
                  .map(
                    (err) =>
                      `<li style="font-family: monospace; color: #d32f2f;">${err}</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `,
          confirmButtonText: "OK",
        });

        setIsValidating(false);
        return false;
      }

      setValidationErrors([]);

      Swal.fire({
        icon: "success",
        title: "Template hợp lệ!",
        text: `Tìm thấy ${placeholders.length} placeholders hợp lệ.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setIsValidating(false);
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi khi validate",
        text: error.message || "Không thể validate template",
      });
      setIsValidating(false);
      return false;
    }
  };

  // Save template
  const handleSave = async () => {
    const isValid = await handleValidate();
    if (isValid && onSave) {
      onSave(htmlContent);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard
      .writeText(htmlContent)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Đã sao chép!",
          text: "Nội dung template đã được sao chép vào clipboard",
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error("Error copying:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể sao chép vào clipboard",
        });
      });
  };

  // Clear content
  const handleClear = () => {
    Swal.fire({
      title: "Xóa nội dung?",
      text: "Bạn có chắc chắn muốn xóa toàn bộ nội dung template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setHtmlContent("");
        setValidationErrors([]);
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 m-0">
            📝 Template Editor
          </h2>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              className="px-5 py-2.5 bg-indigo-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => setShowPlaceholderSelector(true)}
              title="Chèn placeholder vào template"
            >
              📋 Chèn Biến Động
            </button>
            <button
              className="px-5 py-2.5 bg-green-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleValidate}
              disabled={isValidating}
              title="Kiểm tra tính hợp lệ của template"
            >
              {isValidating ? "⏳ Đang validate..." : "✓ Validate"}
            </button>
            <button
              className="px-5 py-2.5 bg-orange-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-orange-600"
              onClick={handleCopy}
              title="Sao chép nội dung"
            >
              📋 Sao chép
            </button>
            <button
              className="px-5 py-2.5 bg-red-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-red-700"
              onClick={handleClear}
              title="Xóa toàn bộ nội dung"
            >
              🗑️ Xóa
            </button>
            {onSave && (
              <button
                className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-blue-700"
                onClick={handleSave}
                title="Lưu template"
              >
                💾 Lưu
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 px-6 py-6 flex flex-col gap-4 overflow-hidden">
        <textarea
          ref={editorRef}
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder={`Nhập HTML template của bạn...

Sử dụng placeholders theo cú pháp: {{Entity.Property}}

Ví dụ:
{{Contract.NumberContract}}
{{Customer.Name}}
{{SaleOrder.Title}}

Nhấn nút "📋 Chèn Biến Động" để xem danh sách placeholders có sẵn.`}
          className="flex-1 p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed resize-none outline-none bg-white text-gray-800 shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-500 placeholder:leading-relaxed"
          spellCheck="false"
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-400 rounded-md p-4 max-h-[200px] overflow-y-auto animate-slideDown">
            <h4 className="text-red-800 text-base font-semibold m-0 mb-3">
              ❌ Placeholders không hợp lệ:
            </h4>
            <ul className="m-0 mb-3 pl-5 text-red-900">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="mb-1 font-mono text-xs">
                  {err}
                </li>
              ))}
            </ul>
            <button
              className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer text-xs transition-colors hover:bg-indigo-700"
              onClick={() => setShowPlaceholderSelector(true)}
            >
              📋 Xem placeholders hợp lệ
            </button>
          </div>
        )}
      </div>

      {/* Placeholder Selector Modal */}
      {showPlaceholderSelector && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPlaceholderSelector(false)}
          />
          <div className="relative z-[1001] animate-slideIn">
            <PlaceholderSelector
              templateType={templateType}
              onInsertPlaceholder={handleInsertPlaceholder}
              onClose={() => setShowPlaceholderSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
