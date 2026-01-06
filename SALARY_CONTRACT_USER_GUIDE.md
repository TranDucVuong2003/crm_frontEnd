# Hướng Dẫn Sử Dụng Module Quản Lý Cấu Hình Lương

## 📋 Tổng Quan

Module **Cấu hình lương nhân viên** cho phép quản lý thông tin lương và hợp đồng của từng nhân viên trong hệ thống ERP.

## 🚀 Cách Sử Dụng

### 1. Truy Cập Module

Điều hướng đến: **Kế toán** → **Lương** → **Cấu hình lương**

Hoặc import vào Router:

```jsx
import SalaryContractManagement from "./Components/Salary/SalaryContractManagement";

// Trong Router
<Route
  path="/accounting/salary/configuration"
  element={<SalaryContractManagement />}
/>;
```

### 2. Xem Danh Sách Cấu Hình

**Giao diện hiển thị:**

- Thống kê tổng quan (Tổng số, Chính thức, Freelance, Cam kết 08)
- Bảng danh sách với các cột:
  - ID
  - Thông tin nhân viên (Tên, Email, User ID)
  - Lương cơ bản
  - Lương BHXH
  - Loại hợp đồng
  - Số người phụ thuộc (NPT)
  - Cam kết 08
  - Ngày tạo
  - Thao tác

**Tìm kiếm & Lọc:**

- 🔍 Tìm kiếm: Theo tên, email, ID nhân viên
- 🔽 Lọc: Theo loại hợp đồng (Tất cả / Chính thức / Freelance)

### 3. Thêm Cấu Hình Mới

**Bước 1:** Click nút **"Thêm mới"** (màu xanh)

**Bước 2:** Điền thông tin trong form:

#### Thông tin bắt buộc (\*)

- **Nhân viên**: Chọn từ dropdown
- **Lương cơ bản**: Nhập số tiền (VNĐ)
- **Loại hợp đồng**: Chọn Chính thức hoặc Freelance

#### Thông tin tùy chọn

- **Lương đóng bảo hiểm**: Nhập 0 để tự động tính (5,682,000 VNĐ)
- **Số người phụ thuộc**: Số từ 0-20
- **Cam kết 08**: Tick nếu có (miễn thuế TNCN dưới 11tr/tháng)
- **File đính kèm**: PDF, DOC, DOCX, JPG, PNG (Max 5MB)

**Bước 3:** Click **"Tạo mới"**

#### Lưu ý:

- ⚠️ Mỗi nhân viên chỉ có thể có 1 cấu hình lương
- 📎 File đính kèm không bắt buộc
- 💰 Lương BHXH = 0 → Tự động tính = 5,682,000 VNĐ

### 4. Chỉnh Sửa Cấu Hình

**Bước 1:** Click icon **Bút chì** (màu vàng) ở cột Thao tác

**Bước 2:** Chỉnh sửa các trường cần thiết

- 🔒 Không thể đổi nhân viên (field bị disable)
- ✅ Các field khác có thể chỉnh sửa
- 📎 Upload file mới → File cũ tự động bị xóa

**Bước 3:** Click **"Cập nhật"**

#### Logic Update:

- **Partial Update**: Chỉ field có thay đổi mới được cập nhật
- **File Replacement**: File mới thay thế file cũ
- **UpdatedAt**: Tự động cập nhật timestamp

### 5. Xem Chi Tiết

**Bước 1:** Click icon **Mắt** (màu xanh) ở cột Thao tác

**Nội dung hiển thị:**

- ℹ️ Thông tin nhân viên đầy đủ
- 💵 Thông tin lương (Cơ bản + BHXH)
- 📝 Chi tiết hợp đồng (Loại HĐ, NPT, Cam kết 08)
- 📊 Tổng quan tính lương:
  ```
  Lương cơ bản: 20,000,000 đ
  Lương BHXH: 5,682,000 đ
  Giảm trừ bản thân: 11,000,000 đ
  Giảm trừ NPT (2 người): 8,800,000 đ
  Tổng giảm trừ: 19,800,000 đ
  ```
- 📅 Lịch sử (Ngày tạo, Ngày cập nhật)
- 📎 File đính kèm (nếu có)

### 6. Tải File Đính Kèm

**Cách 1:** Từ danh sách

- Click icon **Tải xuống** (màu xanh lá) ở cột Thao tác

**Cách 2:** Từ modal chi tiết

- Mở modal chi tiết → Click nút file đính kèm

→ File sẽ mở trong tab mới hoặc tự động download

### 7. Xóa Cấu Hình

**Bước 1:** Click icon **Thùng rác** (màu đỏ) ở cột Thao tác

**Bước 2:** Xác nhận xóa trong SweetAlert popup

**⚠️ Cảnh báo:**

- Đây là **Hard Delete** - Không thể khôi phục
- File đính kèm cũng bị xóa vĩnh viễn
- Cân nhắc kỹ trước khi xóa

### 8. Phân Trang

**Điều khiển phân trang:**

- Chọn số bản ghi/trang: 5, 10, 20, 50
- Nút **Trước** / **Sau**
- Click số trang để nhảy trực tiếp

## 🎨 Các Tính Năng Nổi Bật

### 1. File Upload với Validation

```javascript
✅ Allowed: .pdf, .doc, .docx, .jpg, .jpeg, .png
✅ Max Size: 5MB
❌ Reject: .exe, .zip, .rar, files > 5MB
```

### 2. Tự Động Tính Toán

- **Lương BHXH = 0** → Tự động tính = 5,682,000 VNĐ
- **Giảm trừ NPT** = Số người × 4,400,000 đ
- **Tổng giảm trừ** = 11,000,000 + (NPT × 4,400,000)

### 3. Search & Filter Real-time

- Tìm kiếm ngay khi gõ (no delay)
- Filter theo dropdown
- Auto reset về trang 1 khi search/filter

### 4. Format Hiển Thị

- 💰 Currency: 20,000,000 đ
- 📅 Date: 05/01/2026 09:15
- 🏷️ Badge: Màu sắc theo loại HĐ

## 🔒 Bảo Mật & Quyền Truy Cập

### Authentication Required

- ✅ JWT Token trong Cookie/LocalStorage
- ✅ Auto refresh khi token hết hạn
- ✅ Redirect về /login khi unauthorized

### Authorization

- Chỉ Admin/HR có quyền truy cập
- Employee thường không thấy module này

## 📊 Công Thức Tính Toán

### 1. Lương BHXH Tự Động

```javascript
MIN_WAGE_REGION_1_2026 = 5,310,000 đ
TRAINED_WORKER_RATE = 1.07
Insurance Salary = 5,310,000 × 1.07 = 5,682,000 đ
```

### 2. Giảm Trừ Thuế TNCN

```javascript
Giảm trừ bản thân = 11,000,000 đ
Giảm trừ NPT = 4,400,000 đ/người
Tổng giảm trừ = 11,000,000 + (DependentsCount × 4,400,000)
```

### 3. Cam Kết 08

- Áp dụng cho nhân viên có thu nhập < 11,000,000 đ/tháng
- Miễn thuế TNCN hoàn toàn

## 🐛 Xử Lý Lỗi

### Lỗi Thường Gặp

**1. "Nhân viên đã được cấu hình lương"**

```
Nguyên nhân: User đã có salary contract
Giải pháp: Sử dụng chức năng Chỉnh sửa thay vì Thêm mới
```

**2. "File không hợp lệ"**

```
Nguyên nhân: File không đúng định dạng
Giải pháp: Chỉ upload .pdf, .doc, .docx, .jpg, .jpeg, .png
```

**3. "File quá lớn"**

```
Nguyên nhân: File > 5MB
Giải pháp: Nén file hoặc chọn file khác
```

**4. "Không thể tải danh sách nhân viên"**

```
Nguyên nhân: Lỗi API hoặc network
Giải pháp: Refresh trang hoặc kiểm tra kết nối
```

## 🔄 API Endpoints Sử Dụng

```javascript
GET / api / SalaryContracts; // Lấy tất cả
POST / api / SalaryContracts; // Tạo mới
GET / api / SalaryContracts / { id }; // Lấy theo ID
GET / api / SalaryContracts / user / { id }; // Lấy theo User ID
PUT / api / SalaryContracts / { id }; // Cập nhật (partial)
DELETE / api / SalaryContracts / { id }; // Xóa
GET / api / Users; // Lấy danh sách users
```

## 📱 Responsive Design

Module hỗ trợ đầy đủ các kích thước màn hình:

- 🖥️ Desktop: Full features
- 💻 Laptop: Optimized layout
- 📱 Tablet: Responsive grid
- 📱 Mobile: Stack layout, scrollable table

## 🎯 Tips & Best Practices

### Cho Admin/HR:

1. **Tạo cấu hình ngay khi onboard nhân viên mới**

   - Đảm bảo có đủ thông tin để tính lương

2. **Cập nhật thường xuyên khi có thay đổi**

   - Tăng lương, thay đổi hợp đồng
   - Thêm/bớt người phụ thuộc

3. **Lưu file hợp đồng đầy đủ**

   - Upload bản scan hợp đồng đã ký
   - Dễ dàng tra cứu sau này

4. **Kiểm tra lại số liệu trước khi lưu**

   - Lương cơ bản đúng
   - Số người phụ thuộc chính xác

5. **Backup định kỳ**
   - Export danh sách ra Excel
   - Download tất cả file đính kèm

### Cho Developer:

1. **Validation ở cả client và server**

   - Client: UX tốt hơn
   - Server: Bảo mật chắc chắn

2. **Handle file upload errors gracefully**

   - Check size và extension trước khi upload
   - Show progress bar nếu file lớn

3. **Optimize API calls**

   - Cache danh sách users
   - Debounce search input

4. **Monitor file storage**
   - Clean up orphaned files
   - Implement retention policy

## 📝 Checklist Trước Khi Production

- [ ] Test tất cả CRUD operations
- [ ] Test file upload với các định dạng khác nhau
- [ ] Test với file > 5MB (phải reject)
- [ ] Test với nhân viên đã có contract
- [ ] Test search & filter
- [ ] Test pagination với nhiều records
- [ ] Test responsive trên mobile
- [ ] Kiểm tra quyền truy cập (Auth/Authz)
- [ ] Setup backup tự động cho files
- [ ] Setup monitoring & logging
- [ ] Document API cho team khác

## 🆘 Hỗ Trợ

**Gặp vấn đề?**

- 📧 Email: support@company.com
- 💬 Chat: Internal Slack channel
- 📚 Wiki: [Internal Documentation]
- 🐛 Bug Report: [Issue Tracker]

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-05  
**Author**: Development Team
