import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  getSalaryContractByUser,
  uploadCommitment08,
  downloadCommitment08Template,
} from "../../Service/ApiService";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoading,
  closeLoading,
} from "../../utils/sweetAlert";
import Swal from "sweetalert2";
import API_ENDPOINT from "../../Constant/apiEndpoint.constant";

const Circular08Upload = () => {
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchContract();
    }
  }, [user]);

  const fetchContract = async () => {
    setLoading(true);
    try {
      const response = await getSalaryContractByUser(user.id);
      console.log("Contract Response:", response); // Debug log

      // API returns: { data: { data: {...contract} } }
      if (response && response.data && response.data.data) {
        setContract(response.data.data);
      } else if (response && response.data) {
        // Fallback if structure is different
        setContract(response.data);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      showErrorAlert("Lỗi", "Không thể tải thông tin hợp đồng lương");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      showLoading("Đang tải file mẫu...");
      const response = await downloadCommitment08Template();

      // Response structure: {data: blob}
      const blob = response.data;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Mau_Cam_Ket_Thong_Tu_08.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.close();
      showSuccessAlert("Thành công", "Đã tải file mẫu thành công");
    } catch (error) {
      console.error("Error downloading template:", error);
      Swal.close();
      showErrorAlert(
        "Lỗi",
        "Không thể tải file mẫu. Vui lòng liên hệ IT support."
      );
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - Accept multiple formats as per API doc
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
    ];
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.type);

    if (!isValidExtension && !isValidMimeType) {
      showErrorAlert(
        "❌ File không hợp lệ",
        "Chỉ chấp nhận: .pdf, .doc, .docx, .jpg, .jpeg, .png"
      );
      event.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      showErrorAlert(
        "❌ File quá lớn",
        `File của bạn: ${fileSizeMB}MB. Kích thước tối đa: 5MB`
      );
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setFilePreview({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorAlert("⚠️ Lỗi", "Vui lòng chọn file để upload");
      return;
    }

    setUploading(true);

    try {
      showLoading("Đang upload file...");
      console.log(
        "Uploading file:",
        selectedFile.name,
        "for contract:",
        contract.id
      );

      const response = await uploadCommitment08(contract.id, selectedFile);

      console.log("Upload response:", response);
      Swal.close();

      // Show success message from API
      const message =
        response.data?.message || "✅ Upload cam kết Thông tư 08 thành công!";
      const hint =
        response.data?.hint ||
        "Bạn có thể cập nhật file mới bất cứ lúc nào nếu cần";

      showSuccessAlert("Thành công", `${message}\n\n${hint}`);

      // Reload contract data
      await fetchContract();
      setSelectedFile(null);
      setFilePreview(null);

      // Reset file input
      const fileInput = document.getElementById("fileUpload");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      Swal.close();

      // Handle specific error responses from API
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message || "❌ Có lỗi xảy ra khi upload file";
      const errorDetail =
        errorData?.detail || "Vui lòng thử lại hoặc liên hệ IT support";

      // Handle 403 Forbidden (unauthorized access)
      if (error.response?.status === 403) {
        showErrorAlert("Không có quyền", errorMessage);
      } else {
        showErrorAlert("Lỗi", `${errorMessage}\n\n${errorDetail}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDeadlineDate = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 7);
    return formatDate(date);
  };

  const isDeadlinePassed = (createdAt) => {
    if (!createdAt) return false;
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + 7);
    return new Date() > deadline;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Thông báo
              </h3>
              <p className="text-blue-700">
                Bạn chưa có hợp đồng lương trong hệ thống. Vui lòng liên hệ
                phòng Nhân sự để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract.hasCommitment08) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Không cần cam kết
              </h3>
              <p className="text-green-700">
                Bạn không cần điền và upload Cam kết Thông tư 08. Hồ sơ lương
                của bạn đã hoàn tất.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (contract.attachmentPath) {
    const fileUrl = `${API_ENDPOINT.BASE_URL}${contract.attachmentPath}`;

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-center">
              Upload Thành Công!
            </h1>
            <p className="text-center mt-2 text-green-50">
              Bạn đã hoàn thành việc upload cam kết Thông tư 08
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-800 mb-3 text-lg">
                📎 File đã upload
              </h3>
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-300">
                <div className="flex items-center">
                  <PaperClipIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {contract.attachmentFileName || "Cam_Ket_TT08.pdf"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đã upload: {formatDate(contract.updatedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Xem file
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  // Main upload interface
  const deadlinePassed = isDeadlinePassed(contract.createdAt);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <DocumentArrowUpIcon className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            Upload Cam Kết Thông Tư 08
          </h1>
          <p className="text-center mt-2 text-blue-100">
            Hoàn tất hồ sơ lương của bạn
          </p>
        </div>

        {/* Warning if deadline passed */}
        {deadlinePassed && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">
                  ⚠️ Đã quá hạn upload
                </h4>
                <p className="text-red-700 text-sm mt-1">
                  Hạn cuối là {getDeadlineDate(contract.createdAt)}. Vui lòng
                  upload ngay để hoàn tất thủ tục.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Yêu cầu quan trọng
                </h4>
                <p className="text-yellow-700">
                  Vì lương của bạn là{" "}
                  <strong className="text-yellow-900">
                    {contract.baseSalary?.toLocaleString("vi-VN")} VNĐ/tháng
                  </strong>
                  , bạn cần điền và upload Cam kết Thông tư 08.
                </p>
                <div className="flex items-center mt-2 text-yellow-700">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>
                    Hạn cuối:{" "}
                    <strong className={deadlinePassed ? "text-red-600" : ""}>
                      {getDeadlineDate(contract.createdAt)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📝 Các bước thực hiện
          </h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Tải file mẫu
                </h4>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-md"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  📥 Tải mẫu Cam kết 08 (.docx)
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  Điền thông tin
                </h4>
                <p className="text-gray-600 text-sm">
                  Mở file bằng Microsoft Word và điền đầy đủ thông tin theo
                  hướng dẫn
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">
                  Ký tên và lưu file
                </h4>
                <p className="text-gray-600 text-sm">
                  Ký tên và đóng dấu (nếu có), sau đó lưu file dưới dạng{" "}
                  <strong className="text-red-600">
                    PDF, Word hoặc ảnh JPG/PNG
                  </strong>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Upload file cam kết
                </h4>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                  {!filePreview ? (
                    <div>
                      <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <label
                        htmlFor="fileUpload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Click để chọn file
                      </label>
                      <input
                        id="fileUpload"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Chấp nhận: PDF, Word, JPG, PNG - Tối đa 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PaperClipIcon className="h-6 w-6 text-blue-600 mr-3" />
                          <div className="text-left">
                            <p className="font-medium text-gray-800">
                              {filePreview.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {filePreview.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="p-6 bg-gray-50">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center ${
              !selectedFile || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ⏳ Đang upload...
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className="h-6 w-6 mr-2" />
                📤 Upload file cam kết
              </>
            )}
          </button>
        </div>

        {/* Notes */}
        <div className="p-6 border-t border-gray-200 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-3">
            💡 Lưu ý quan trọng:
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Loại file chấp nhận:</strong> .pdf, .doc, .docx, .jpg,
                .jpeg, .png
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Kích thước tối đa:</strong> 5MB
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Đảm bảo file <strong>rõ ràng, có chữ ký hợp lệ</strong>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Bạn có thể cập nhật file mới</strong> bất cứ lúc nào nếu
                cần
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Nếu gặp vấn đề, liên hệ: <strong>hr@erpsystem.com</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Circular08Upload;
