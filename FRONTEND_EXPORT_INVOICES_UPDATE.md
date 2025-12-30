# Frontend Update - ExportInvoices Field

## Tóm tắt
Đã thêm checkbox "Xuất hóa đơn" vào giao diện frontend để người dùng có thể đánh dấu việc xuất hóa đơn cho hợp đồng.

## Ngày cập nhật
26/12/2024

---

## Chi tiết thay đổi

### 1. ContractConfirmModal.jsx
**File:** `src/Components/Sale order/ContractConfirmModal.jsx`

#### Thay đổi State
```jsx
const [formData, setFormData] = useState({
  status: "Draft",
  paymentMethod: "Chuyển khoản",
  expiration: "",
  notes: "",
  exportInvoices: false,  // ✅ Trường mới
});
```

#### Thêm UI Checkbox
```jsx
{/* Xuất hóa đơn */}
<div className="md:col-span-2">
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.exportInvoices}
      onChange={(e) =>
        setFormData({ ...formData, exportInvoices: e.target.checked })
      }
      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
    <span className="text-sm font-medium text-gray-700">
      Xuất hóa đơn cho hợp đồng này
    </span>
  </label>
  <p className="mt-1 text-xs text-gray-500 ml-7">
    Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng
  </p>
</div>
```

#### Cập nhật API Call
```jsx
const contractData = {
  saleOrderId: deal.id,
  userId: user.id,
  status: formData.status,
  paymentMethod: formData.paymentMethod,
  expiration: new Date(formData.expiration).toISOString(),
  notes: formData.notes.trim() || "",
  exportInvoices: formData.exportInvoices,  // ✅ Gửi lên backend
};
```

**Vị trí:** Modal này được sử dụng khi tạo hợp đồng từ Sale Order trong Sales Pipeline.

---

### 2. ContractEditModal.jsx
**File:** `src/Components/Contract/ContractEditModal.jsx`

#### Thay đổi State
```jsx
const [formData, setFormData] = useState({
  name: "",
  customerId: "",
  userId: "",
  saleOrderId: "",
  serviceId: "",
  addonsId: "",
  taxId: "",
  status: "Draft",
  paymentMethod: "Chuyển khoản",
  expiration: "",
  notes: "",
  totalAmount: 0,
  exportInvoices: false,  // ✅ Trường mới
});
```

#### Load dữ liệu từ API
```jsx
const formDataToSet = {
  // ... các trường khác
  exportInvoices: contract.exportInvoices || false,  // ✅ Load từ API
};
```

#### Thêm UI Checkbox (Read-only)
```jsx
{/* Xuất hóa đơn */}
<div>
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.exportInvoices}
      disabled
      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-not-allowed"
    />
    <span className="text-sm font-medium text-gray-700">
      Xuất hóa đơn cho hợp đồng này
    </span>
  </label>
  <p className="mt-1 text-xs text-gray-500 ml-7">
    Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng
  </p>
</div>
```

**Lưu ý:** Trong ContractEditModal, tất cả các trường đều là disabled (read-only) để xem thông tin hợp đồng.

---

## Hướng dẫn sử dụng

### 1. Tạo hợp đồng mới từ Sale Order
1. Vào **Sales Pipeline**
2. Chọn một Deal và nhấn **"Tạo hợp đồng"**
3. Trong modal xác nhận tạo hợp đồng:
   - Điền thông tin cần thiết
   - **✅ Tích vào checkbox "Xuất hóa đơn cho hợp đồng này"** nếu cần xuất hóa đơn
   - Nhấn "Tạo hợp đồng"

### 2. Xem thông tin hợp đồng
1. Vào **Contract Management**
2. Chọn một hợp đồng và nhấn **"Chỉnh sửa"**
3. Trong modal chi tiết hợp đồng:
   - Xem trạng thái checkbox "Xuất hóa đơn" (read-only)
   - Checkbox này hiển thị trạng thái đã được lưu từ lúc tạo hợp đồng

---

## Giao diện Demo

### ContractConfirmModal (Tạo hợp đồng)
```
┌─────────────────────────────────────────────────┐
│  Xác nhận tạo hợp đồng                    [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Thông tin Sale Order]                         │
│  [Dịch vụ & Addon]                             │
│                                                 │
│  Trạng thái: [New ▼]                           │
│  Phương thức TT: [Chuyển khoản ▼]             │
│  Ngày hết hạn: [26/12/2026 07:40]             │
│                                                 │
│  ✅ Xuất hóa đơn cho hợp đồng này              │
│  Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng│
│                                                 │
│  Ghi chú:                                      │
│  [_______________________________________]     │
│                                                 │
│              [Hủy]  [Tạo hợp đồng]            │
└─────────────────────────────────────────────────┘
```

### ContractEditModal (Xem hợp đồng)
```
┌─────────────────────────────────────────────────┐
│  Chỉnh sửa hợp đồng                       [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Thông tin hợp đồng - Disabled]               │
│                                                 │
│  ✅ Xuất hóa đơn cho hợp đồng này (disabled)   │
│  Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng│
│                                                 │
│  Ghi chú: (disabled)                           │
│  [_______________________________________]     │
│                                                 │
│  [Xuất HĐ] [Tạo Ticket]    [Hủy] [Action]    │
└─────────────────────────────────────────────────┘
```

---

## Flow hoàn chỉnh

```
1. User tạo Sale Order
         ↓
2. User chọn "Tạo hợp đồng"
         ↓
3. ContractConfirmModal hiển thị
         ↓
4. User tích checkbox "Xuất hóa đơn" (nếu cần)
         ↓
5. API POST /api/Contracts
   Body: { ..., exportInvoices: true }
         ↓
6. Backend lưu trường ExportInvoices
         ↓
7. User xem hợp đồng qua ContractEditModal
         ↓
8. Checkbox "Xuất hóa đơn" hiển thị trạng thái (disabled)
```

---

## Testing Checklist

- ✅ ContractConfirmModal hiển thị checkbox "Xuất hóa đơn"
- ✅ Checkbox có thể tích/bỏ tích
- ✅ Giá trị mặc định là `false` (không tích)
- ✅ Khi submit, `exportInvoices: true/false` được gửi lên API
- ✅ ContractEditModal hiển thị trạng thái checkbox từ database
- ✅ Checkbox trong edit modal là disabled (read-only)
- ✅ Không có lỗi console
- ✅ Build thành công

---

## API Integration

### Request Body khi tạo Contract
```json
POST /api/Contracts
{
  "saleOrderId": 123,
  "userId": 456,
  "status": "New",
  "paymentMethod": "Chuyển khoản",
  "expiration": "2025-12-26T07:40:00.000Z",
  "notes": "Ghi chú",
  "exportInvoices": true  // ✅ Trường mới
}
```

### Response từ Backend
```json
{
  "id": 1,
  "saleOrderId": 123,
  "userId": 456,
  "status": "New",
  "paymentMethod": "Chuyển khoản",
  "expiration": "2025-12-26T07:40:00.000Z",
  "notes": "Ghi chú",
  "exportInvoices": true,  // ✅ Trường mới
  "createdAt": "2024-12-26T07:00:00.000Z",
  "updatedAt": "2024-12-26T07:00:00.000Z"
}
```

---

## Lưu ý quan trọng

### 1. Giá trị mặc định
- Checkbox mặc định là **không tích** (`false`)
- Backend cũng có giá trị mặc định là `false`

### 2. Read-only trong Edit Modal
- ContractEditModal hiển thị checkbox ở chế độ **disabled**
- Điều này đúng với thiết kế hiện tại: tất cả fields trong edit modal đều disabled
- Nếu muốn cho phép chỉnh sửa, cần:
  - Remove `disabled` attribute
  - Thêm handler `onChange`
  - Thêm API call `updateContract` khi submit

### 3. Validation
- Không có validation đặc biệt cho trường checkbox
- Boolean value luôn hợp lệ

### 4. UI/UX
- Label rõ ràng: "Xuất hóa đơn cho hợp đồng này"
- Có helper text giải thích: "Đánh dấu nếu cần xuất hóa đơn VAT cho hợp đồng"
- Checkbox dễ nhận biết và click

---

## Files đã thay đổi

1. ✅ `src/Components/Sale order/ContractConfirmModal.jsx`
2. ✅ `src/Components/Contract/ContractEditModal.jsx`

---

## Các bước tiếp theo (Nếu cần)

### 1. Cho phép chỉnh sửa ExportInvoices
Nếu cần cho phép user chỉnh sửa trường này sau khi tạo hợp đồng:

```jsx
// Trong ContractEditModal.jsx
<input
  type="checkbox"
  checked={formData.exportInvoices}
  onChange={(e) => handleInputChange(e)}  // Remove disabled
  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
/>
```

### 2. Tích hợp với chức năng "Xuất hóa đơn"
Có thể sử dụng trường này để:
- Chỉ cho phép xuất hóa đơn nếu `exportInvoices === true`
- Hiển thị warning nếu chưa tích checkbox
- Tự động tích checkbox khi nhấn nút "Xuất hóa đơn"

### 3. Báo cáo & Thống kê
- Thống kê số hợp đồng cần xuất hóa đơn
- Filter hợp đồng theo trạng thái xuất hóa đơn
- Dashboard hiển thị tỷ lệ hợp đồng có/không xuất hóa đơn

---

## Completion Status
✅ Frontend implementation hoàn thành
✅ Tích hợp với Backend API
✅ Testing cơ bản đã pass
✅ Không có lỗi compile

**Ngày hoàn thành:** 26/12/2024  
**Developer:** AI Assistant  
**Status:** ✅ COMPLETED
