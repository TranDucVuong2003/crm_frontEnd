import React, { useState } from "react";

const test_contact = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5056/api/contracts/${orderId}/preview-contract`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMSIsInVuaXF1ZV9uYW1lIjoiVHLhuqduIMSQ4bupYyBWxrDGoW5nIiwiZW1haWwiOiJyb25nY29uODM4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbiIsIm5iZiI6MTc2MTI5MjAyMSwiZXhwIjoxNzYxMjk1NjIxLCJpYXQiOjE3NjEyOTIwMjEsImlzcyI6ImVycF9iYWNrZW5kIiwiYXVkIjoiZXJwX2JhY2tlbmRfdXNlcnMifQ.hkQtuPREa8tL7_2HbtRa2QuZWeM38Q-LWdu0ryRECNs`, // Thêm token nếu cần
          },
        }
      );
      if (!response.ok) throw new Error("Không thể preview hợp đồng");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank"); // Mở PDF trong tab mới
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://localhost:7210/api/contracts/${orderId}/export-contract`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMSIsInVuaXF1ZV9uYW1lIjoiVHLhuqduIMSQ4bupYyBWxrDGoW5nIiwiZW1haWwiOiJyb25nY29uODM4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbiIsIm5iZiI6MTc2MTI5MjAyMSwiZXhwIjoxNzYxMjk1NjIxLCJpYXQiOjE3NjEyOTIwMjEsImlzcyI6ImVycF9iYWNrZW5kIiwiYXVkIjoiZXJwX2JhY2tlbmRfdXNlcnMifQ.hkQtuPREa8tL7_2HbtRa2QuZWeM38Q-LWdu0ryRECNs`, // Thêm token nếu cần
          },
        }
      );
      if (!response.ok) throw new Error("Không thể xuất hợp đồng");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop_dong_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Test Xuất Hợp Đồng
      </h1>

      <div className="mb-4">
        <label
          htmlFor="orderId"
          className="block text-sm font-medium text-gray-700"
        >
          Nhập Order ID:
        </label>
        <input
          type="text"
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
          placeholder="Nhập ID hợp đồng"
        />
      </div>

      <div className="space-x-4">
        <button
          onClick={handlePreview}
          disabled={loading || !orderId}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Đang tải..." : "Preview Hợp Đồng"}
        </button>
        <button
          onClick={handleExport}
          disabled={loading || !orderId}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Đang tải..." : "Xuất Hợp Đồng"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default test_contact;
