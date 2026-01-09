import React, { useState, useEffect } from "react";
import templateService from "../../Service/templateService";

/**
 * PlaceholderSelector Component
 * Hiển thị danh sách placeholders có sẵn theo entity và cho phép insert vào template
 */
const PlaceholderSelector = ({
  templateType,
  onInsertPlaceholder,
  onClose,
}) => {
  const [placeholders, setPlaceholders] = useState({});
  const [selectedEntity, setSelectedEntity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlaceholders();
  }, [templateType]);

  const fetchPlaceholders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await templateService.getAvailablePlaceholders(templateType);
      setPlaceholders(data);

      // Auto-select first entity
      const firstEntity = Object.keys(data)[0];
      if (firstEntity) {
        setSelectedEntity(firstEntity);
      }
    } catch (err) {
      console.error("Error fetching placeholders:", err);
      setError(err.message || "Lỗi khi tải placeholders");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaceholders =
    selectedEntity && placeholders[selectedEntity]
      ? placeholders[selectedEntity].filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.placeholder.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleInsert = (placeholder) => {
    onInsertPlaceholder(placeholder);
  };

  if (loading) {
    return (
      <div className="w-[400px] max-h-[600px] bg-white rounded-lg shadow-xl flex items-center justify-center min-h-[200px] p-5">
        <div className="text-lg text-indigo-600">⏳ Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[400px] max-h-[600px] bg-white rounded-lg shadow-xl flex items-center justify-center min-h-[200px] p-5">
        <div className="text-center text-red-600">
          ❌ {error}
          <button
            onClick={fetchPlaceholders}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] max-h-[600px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <h3 className="text-lg font-semibold m-0">📋 Chèn Biến Động</h3>
        {onClose && (
          <button
            className="bg-transparent border-none text-white text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        )}
      </div>

      {/* Entity Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-100">
        {Object.entries(placeholders).map(([entity, fields]) => (
          <button
            key={entity}
            className={`px-4 py-3 border-none cursor-pointer text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
              selectedEntity === entity
                ? "bg-white text-indigo-600 border-indigo-600"
                : "bg-transparent text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-800"
            }`}
            onClick={() => setSelectedEntity(entity)}
          >
            {entity}{" "}
            <span className="text-xs text-gray-500 ml-1">
              ({fields.length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm placeholder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Placeholder List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredPlaceholders.length === 0 ? (
          <div className="text-center py-10 px-5 text-gray-500">
            {searchTerm
              ? "Không tìm thấy placeholder phù hợp"
              : "Không có placeholder nào"}
          </div>
        ) : (
          filteredPlaceholders.map((field) => (
            <div
              key={field.name}
              className="p-3 mb-2 border border-gray-200 rounded-md cursor-pointer transition-all bg-white hover:border-indigo-600 hover:bg-indigo-50 hover:translate-x-1 hover:shadow-md"
              onClick={() => handleInsert(field.placeholder)}
              title={`Click để chèn: ${field.placeholder}`}
            >
              <div className="flex justify-between items-center mb-2">
                <code className="font-mono text-xs text-indigo-600 bg-gray-100 px-2 py-1 rounded font-semibold">
                  {field.placeholder}
                </code>
                {field.isRequired && (
                  <span className="text-[11px] bg-red-500 text-white px-1.5 py-0.5 rounded font-semibold">
                    Bắt buộc
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {field.description}
              </div>
              <div className="flex gap-3 items-center text-xs text-gray-600">
                <span
                  className={`px-2 py-0.5 rounded font-semibold text-[11px] uppercase ${
                    field.type === "string"
                      ? "bg-blue-100 text-blue-800"
                      : field.type === "number"
                      ? "bg-orange-100 text-orange-800"
                      : field.type === "date"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {field.type}
                </span>
                <span className="flex-1 text-gray-500">
                  VD: <strong className="text-gray-800">{field.example}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
        <small className="text-gray-600">
          💡 Click vào placeholder để chèn vào template
        </small>
      </div>
    </div>
  );
};

export default PlaceholderSelector;
