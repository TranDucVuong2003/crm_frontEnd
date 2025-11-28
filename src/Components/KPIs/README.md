# Module Quản lý KPI - CRM System

Module quản lý KPI đầy đủ với tích hợp backend API.

## 📋 Tính năng đã triển khai

### 1. **Quản lý KPI (KPIs.jsx)**

- ✅ Xem danh sách KPI (Card view & Table view)
- ✅ Tạo KPI mới với đầy đủ thông tin
- ✅ Chỉnh sửa KPI
- ✅ Xóa KPI
- ✅ Lọc theo phòng ban, loại KPI, kỳ
- ✅ Tìm kiếm KPI
- ✅ Hiển thị tổng quan thống kê
- ✅ Hiển thị summary theo kỳ

### 2. **Báo cáo KPI (KPIRecords.jsx)**

- ✅ Xem danh sách báo cáo KPI
- ✅ Phê duyệt từng báo cáo
- ✅ Từ chối báo cáo (với lý do)
- ✅ Phê duyệt hàng loạt
- ✅ Lọc theo trạng thái, phòng ban, kỳ
- ✅ Thống kê tổng hoa hồng
- ✅ Checkbox chọn nhiều records

## 🔗 API đã tích hợp

### KPI APIs

```javascript
-getAllKPIs(params) - // Lấy danh sách KPI
  createKPI(kpiData) - // Tạo KPI mới
  updateKPI(id, kpiData) - // Cập nhật KPI
  deleteKPI(id) - // Xóa KPI
  getKPIById(id); // Lấy chi tiết KPI
```

### KPI Records APIs

```javascript
-getAllKPIRecords(params) - // Lấy danh sách records
  getKPIRecordsSummary(params) - // Lấy tổng quan
  approveKPIRecord(id) - // Phê duyệt
  rejectKPIRecord(id, reason) - // Từ chối
  batchApproveKPIRecords(ids); // Phê duyệt hàng loạt
```

### Các API khác

```javascript
-getAllDepartments() - // Lấy danh sách phòng ban
  getUserKPISummary(userId) - // Xem KPI của user
  calculateKPIRecords(period); // Tính KPI (Admin)
```

## 📁 Cấu trúc thư mục

```
src/
├── Components/
│   ├── KPIs.jsx                    # Module quản lý KPI chính
│   └── KPIs/
│       └── KPIRecords.jsx          # Module báo cáo & phê duyệt
├── Service/
│   └── ApiService.jsx              # Đã thêm các API functions
├── Constant/
│   └── apiEndpoint.constant.jsx   # Đã thêm KPI endpoints
└── utils/
    └── sweetAlert.js               # Alert utilities
```

## 🚀 Cách sử dụng

### 1. Import component vào Router

```jsx
// AppRouter.jsx
import KPIs from "../Components/KPIs";
import KPIRecords from "../Components/KPIs/KPIRecords";

// Thêm vào routes
<Route path="/kpis" element={<KPIs />} />
<Route path="/kpi-records" element={<KPIRecords />} />
```

### 2. Thêm menu vào Sidebar

```jsx
// Thêm vào sidebar menu
{
  name: "Quản lý KPI",
  icon: ChartBarIcon,
  path: "/kpis",
  children: [
    { name: "KPI", path: "/kpis" },
    { name: "Báo cáo KPI", path: "/kpi-records" }
  ]
}
```

## 📊 Các loại KPI hỗ trợ

### 1. Revenue (Doanh thu)

- Đơn vị: VND
- Phòng ban: Sales
- Hoa hồng: Theo bậc (Tiered)

### 2. Leads (Khách hàng tiềm năng)

- Đơn vị: Khách hàng
- Phòng ban: Marketing
- Hoa hồng: Có thể có

### 3. Tickets (Hỗ trợ)

- Đơn vị: Ticket
- Phòng ban: IT Support
- Hoa hồng: Không có

## 🎨 Giao diện

### KPIs Module

- **Summary Cards**: 5 cards thống kê tổng quan
- **Monthly Summary**: Banner hiển thị tổng quan theo kỳ
- **Filters**: Tìm kiếm, lọc phòng ban, loại KPI, kỳ
- **View Modes**: Card view và Table view
- **Modal**: Form tạo/sửa KPI đầy đủ

### KPI Records Module

- **Summary Cards**: 5 cards thống kê (tổng, pending, approved, rejected, hoa hồng)
- **Filters**: Tìm kiếm, lọc kỳ, trạng thái, phòng ban
- **Batch Actions**: Chọn nhiều và phê duyệt hàng loạt
- **Table**: Hiển thị đầy đủ thông tin records
- **Actions**: Phê duyệt, từ chối inline

## 🔐 Phân quyền

### Admin

- Tạo/Sửa/Xóa KPI
- Phê duyệt/Từ chối báo cáo
- Xem tất cả KPI và records
- Tính KPI thủ công

### User

- Xem KPI được gán
- Xem báo cáo KPI của mình
- Không thể tạo/sửa/xóa KPI

## 📝 Luồng hoạt động

### Admin setup KPI mới

1. Tạo KPI → Điền thông tin đầy đủ
2. Tạo bậc hoa hồng (nếu là Tiered)
3. Gán KPI cho users
4. Duyệt Marketing Budget (nếu có)

### Nhân viên làm việc

**Sales:**

- Tạo contracts → Chuyển status = "Paid"
- Hệ thống tự động tính doanh thu

**Marketing:**

- Tạo leads
- Báo cáo chi phí
- Chuyển đổi lead → customer

**IT:**

- Xử lý tickets
- Hệ thống tự động tính số lượng

### Admin phê duyệt (cuối tháng)

1. Tính KPI (tự động hoặc thủ công)
2. Xem tổng quan trong KPI Records
3. Lọc records "Chờ duyệt"
4. Phê duyệt từng cái hoặc hàng loạt
5. Xuất báo cáo

## 🧪 Test scenarios

### Test KPI Management

```javascript
1. Tạo KPI mới
   - Input: Name, Department, Type, Target, Period
   - Expected: Xuất hiện trong danh sách

2. Sửa KPI
   - Input: Thay đổi Target value
   - Expected: Cập nhật thành công

3. Xóa KPI
   - Expected: Confirm dialog → Xóa khỏi danh sách

4. Filter KPI
   - Input: Chọn Department = "Sales"
   - Expected: Chỉ hiển thị KPI của Sales
```

### Test KPI Records

```javascript
1. Phê duyệt record
   - Action: Click approve button
   - Expected: Status → "Approved"

2. Từ chối record
   - Action: Click reject → Nhập lý do
   - Expected: Status → "Rejected"

3. Batch approve
   - Action: Chọn nhiều records → Click "Duyệt hàng loạt"
   - Expected: Tất cả status → "Approved"

4. Filter by period
   - Input: Chọn tháng trước
   - Expected: Load records của tháng đó
```

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'name' of undefined"

**Nguyên nhân**: Backend không trả về department/user info  
**Giải pháp**: Thêm optional chaining `?.` hoặc kiểm tra backend include relations

### Lỗi: "Network Error"

**Nguyên nhân**: CORS hoặc backend không chạy  
**Giải pháp**:

- Kiểm tra BASE_URL trong .env
- Kiểm tra backend đang chạy
- Kiểm tra CORS policy

### Records không hiển thị

**Nguyên nhân**: Chưa có data cho kỳ hiện tại  
**Giải pháp**:

- Tạo KPI trước
- Gán cho users
- Trigger calculate KPI
- Hoặc test với data mock

## 🔄 API Response Format

### KPI Object

```json
{
  "id": 1,
  "name": "Doanh số bán hàng",
  "description": "KPI đo lường doanh số",
  "departmentId": 1,
  "department": { "id": 1, "name": "Sales" },
  "kpiType": "Revenue",
  "measurementUnit": "VND",
  "targetValue": 15000000,
  "commissionType": "Tiered",
  "period": "Monthly",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "weight": 100,
  "isActive": true
}
```

### KPI Record Object

```json
{
  "id": 1,
  "kpiId": 1,
  "kpi": { "id": 1, "name": "..." },
  "userId": 5,
  "user": { "id": 5, "name": "Nguyễn Văn A" },
  "period": "2025-01",
  "actualValue": 25000000,
  "targetValue": 15000000,
  "achievementPercentage": 166.67,
  "commissionAmount": 1250000,
  "commissionPercentage": 5,
  "status": "Pending",
  "notes": "",
  "approvedBy": null,
  "approvedAt": null
}
```

## 📞 Support

Nếu gặp vấn đề, vui lòng liên hệ:

- Email: dev@company.com
- Slack: #crm-support

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 27/11/2025  
**Người phát triển**: GitHub Copilot
