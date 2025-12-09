# 🚀 HƯỚNG DẪN TÍCH HỢP MODULE KPI

## ✅ Đã hoàn thành

### 1. Routes đã được thêm vào AppRouter.jsx

```jsx
{
  path: "kpi",
  element: <Outlet />,
  children: [
    {
      path: "dashboard",           // /kpi/dashboard (Admin, Manager)
      element: <KpiDashboard />
    },
    {
      path: "management",          // /kpi/management (Admin only)
      element: <KpiManagement />
    },
    {
      path: "my-kpi",              // /kpi/my-kpi (All users)
      element: <MyKpi />
    },
    {
      path: "leaderboard",         // /kpi/leaderboard (All users)
      element: <KpiLeaderboard />
    },
    {
      path: "commission-rates",    // /kpi/commission-rates (Admin only)
      element: <CommissionRates />
    },
  ],
}
```

### 2. MenuController đã được cập nhật

**File backend**: `MenuController_Updated.cs` (trong thư mục frontend)

**Cấu trúc menu KPI theo role**:

#### 👑 Admin - Full quyền:

- Dashboard KPI (`/kpi/dashboard`)
- Quản lý KPI (`/kpi/management`)
- KPI của tôi (`/kpi/my-kpi`)
- Bảng xếp hạng (`/kpi/leaderboard`)
- Bậc hoa hồng (`/kpi/commission-rates`)

#### 👔 Manager - Xem báo cáo:

- Dashboard KPI (`/kpi/dashboard`)
- KPI của tôi (`/kpi/my-kpi`)
- Bảng xếp hạng (`/kpi/leaderboard`)

#### 👤 User/Sale - Xem cá nhân:

- KPI của tôi (`/kpi/my-kpi`)
- Bảng xếp hạng (`/kpi/leaderboard`)

---

## 📋 BƯỚC TIẾP THEO

### Bước 1: Cập nhật Backend MenuController

Copy nội dung từ file `MenuController_Updated.cs` vào backend của bạn:

**Path backend**: `erp_backend/Controllers/MenuController.cs`

```bash
# Vị trí file backend
your-backend-project/
└── Controllers/
    └── MenuController.cs  ← Thay thế nội dung file này
```

### Bước 2: Cài đặt dependencies (nếu chưa có)

```bash
cd c:\Users\trand\OneDrive\Desktop\crm_FE_project\erm_FE
npm install recharts
```

### Bước 3: Thêm API Endpoints vào constants

**File**: `src/Constant/apiEndpoint.constant.jsx`

Thêm các endpoint sau:

```javascript
export const API_ENDPOINT = {
  // ... existing endpoints ...

  // KPI APIs
  KPI: {
    GET_ALL: "/KpiPackages",
    GET_BY_ID: (id) => `/KpiPackages/${id}`,
    CREATE: "/KpiPackages",
    UPDATE: (id) => `/KpiPackages/${id}`,
    DELETE: (id) => `/KpiPackages/${id}`,
    ASSIGN: "/KpiPackages/assign",
    GET_ASSIGNED_USERS: (id) => `/KpiPackages/${id}/assigned-users`,
    CALCULATE_ALL: "/KpiPackages/calculate-kpi",
    CALCULATE_USER: (userId) => `/KpiPackages/calculate-kpi-user/${userId}`,
  },

  KPI_TARGETS: {
    GET_ALL: "/SaleKpiTargets",
    GET_BY_ID: (id) => `/SaleKpiTargets/${id}`,
    GET_BY_USER: (userId) => `/SaleKpiTargets/by-user/${userId}`,
    GET_BY_PERIOD: "/SaleKpiTargets/by-period",
    GET_BY_USER_PERIOD: "/SaleKpiTargets/by-user-period",
    CREATE: "/SaleKpiTargets",
    UPDATE: (id) => `/SaleKpiTargets/${id}`,
    DELETE: (id) => `/SaleKpiTargets/${id}`,
  },

  COMMISSION_RATES: {
    GET_ALL: "/CommissionRates",
    GET_BY_ID: (id) => `/CommissionRates/${id}`,
    CREATE: "/CommissionRates",
    UPDATE: (id) => `/CommissionRates/${id}`,
    DELETE: (id) => `/CommissionRates/${id}`,
  },

  KPI_RECORDS: {
    GET_ALL: "/SaleKpiRecords",
    GET_BY_ID: (id) => `/SaleKpiRecords/${id}`,
    GET_BY_USER: (userId) => `/SaleKpiRecords/by-user/${userId}`,
    GET_BY_PERIOD: "/SaleKpiRecords/by-period",
    GET_LEADERBOARD: "/SaleKpiRecords/leaderboard",
    GET_STATISTICS: "/SaleKpiRecords/statistics",
    UPDATE_NOTES: (id) => `/SaleKpiRecords/${id}/notes`,
  },
};
```

### Bước 4: Thêm API Functions vào ApiService

**File**: `src/Service/ApiService.jsx`

Thêm các function sau vào cuối file:

```javascript
// =============================
// KPI PACKAGES APIs
// =============================
export const getAllKpiPackages = (params) => {
  return apiClient.get(API_ENDPOINT.KPI.GET_ALL, { params });
};

export const getKpiPackageById = (id) => {
  return apiClient.get(API_ENDPOINT.KPI.GET_BY_ID(id));
};

export const createKpiPackage = (data) => {
  return apiClient.post(API_ENDPOINT.KPI.CREATE, data);
};

export const updateKpiPackage = (id, data) => {
  return apiClient.put(API_ENDPOINT.KPI.UPDATE(id), data);
};

export const deleteKpiPackage = (id) => {
  return apiClient.delete(API_ENDPOINT.KPI.DELETE(id));
};

export const assignKpiPackage = (data) => {
  return apiClient.post(API_ENDPOINT.KPI.ASSIGN, data);
};

export const getAssignedUsers = (id) => {
  return apiClient.get(API_ENDPOINT.KPI.GET_ASSIGNED_USERS(id));
};

export const calculateAllKpi = (params) => {
  return apiClient.post(API_ENDPOINT.KPI.CALCULATE_ALL, null, { params });
};

export const calculateUserKpi = (userId, params) => {
  return apiClient.post(API_ENDPOINT.KPI.CALCULATE_USER(userId), null, {
    params,
  });
};

// =============================
// KPI TARGETS APIs
// =============================
export const getAllKpiTargets = () => {
  return apiClient.get(API_ENDPOINT.KPI_TARGETS.GET_ALL);
};

export const getKpiTargetById = (id) => {
  return apiClient.get(API_ENDPOINT.KPI_TARGETS.GET_BY_ID(id));
};

export const getKpiTargetsByUser = (userId) => {
  return apiClient.get(API_ENDPOINT.KPI_TARGETS.GET_BY_USER(userId));
};

export const getKpiTargetsByPeriod = (params) => {
  return apiClient.get(API_ENDPOINT.KPI_TARGETS.GET_BY_PERIOD, { params });
};

export const createKpiTarget = (data) => {
  return apiClient.post(API_ENDPOINT.KPI_TARGETS.CREATE, data);
};

export const updateKpiTarget = (id, data) => {
  return apiClient.put(API_ENDPOINT.KPI_TARGETS.UPDATE(id), data);
};

export const deleteKpiTarget = (id) => {
  return apiClient.delete(API_ENDPOINT.KPI_TARGETS.DELETE(id));
};

// =============================
// COMMISSION RATES APIs
// =============================
export const getAllCommissionRates = () => {
  return apiClient.get(API_ENDPOINT.COMMISSION_RATES.GET_ALL);
};

export const createCommissionRate = (data) => {
  return apiClient.post(API_ENDPOINT.COMMISSION_RATES.CREATE, data);
};

export const updateCommissionRate = (id, data) => {
  return apiClient.put(API_ENDPOINT.COMMISSION_RATES.UPDATE(id), data);
};

export const deleteCommissionRate = (id) => {
  return apiClient.delete(API_ENDPOINT.COMMISSION_RATES.DELETE(id));
};

// =============================
// KPI RECORDS APIs
// =============================
export const getAllKpiRecords = (params) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_ALL, { params });
};

export const getKpiRecordById = (id) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_BY_ID(id));
};

export const getKpiRecordsByUser = (userId) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_BY_USER(userId));
};

export const getKpiRecordsByPeriod = (params) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_BY_PERIOD, { params });
};

export const getKpiLeaderboard = (params) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_LEADERBOARD, { params });
};

export const getKpiStatistics = (params) => {
  return apiClient.get(API_ENDPOINT.KPI_RECORDS.GET_STATISTICS, { params });
};

export const updateKpiRecordNotes = (id, notes) => {
  return apiClient.put(API_ENDPOINT.KPI_RECORDS.UPDATE_NOTES(id), { notes });
};
```

### Bước 5: Test các routes

```bash
# Khởi động dev server
npm run dev
```

Test các URL sau:

- http://localhost:5173/kpi/dashboard (Admin, Manager)
- http://localhost:5173/kpi/management (Admin only)
- http://localhost:5173/kpi/my-kpi (All users)
- http://localhost:5173/kpi/leaderboard (All users)
- http://localhost:5173/kpi/commission-rates (Admin only)

---

## 🔐 Phân quyền Routes

Routes đã được cấu hình phân quyền trong `AppRouter.jsx`:

```jsx
// Admin only
<ProtectedRoute allowedRoles={["admin"]}>
  <KpiManagement />
</ProtectedRoute>

// Admin & Manager
<ProtectedRoute allowedRoles={["admin", "manager"]}>
  <KpiDashboard />
</ProtectedRoute>

// All authenticated users
<MyKpi />
<KpiLeaderboard />
```

---

## 📊 Flow hoạt động

### 1. Admin tạo KPI Package:

1. Vào `/kpi/management`
2. Click "Tạo gói KPI mới"
3. Điền thông tin (tên, tháng, năm, target amount)
4. Save

### 2. Admin gán KPI cho users:

1. Click icon "Gán cho users" ở mỗi package
2. Chọn users từ danh sách
3. Thêm ghi chú (optional)
4. Click "Gán KPI"

### 3. Admin cấu hình bậc hoa hồng:

1. Vào `/kpi/commission-rates`
2. Click "Thêm bậc mới"
3. Nhập khoảng doanh số và % hoa hồng
4. Save

### 4. Hệ thống tự động tính KPI:

- Khi Contract chuyển status sang `Paid/Completed/Signed/Active`
- Backend tự động gọi `KpiCalculationService`
- Update `SaleKpiRecords`

### 5. User xem KPI của mình:

1. Vào `/kpi/my-kpi`
2. Xem KPI tháng hiện tại
3. Xem lịch sử các tháng trước
4. So sánh với leaderboard tại `/kpi/leaderboard`

---

## 🎯 URLs Summary

| URL                     | Component       | Role           | Description         |
| ----------------------- | --------------- | -------------- | ------------------- |
| `/kpi/dashboard`        | KpiDashboard    | Admin, Manager | Dashboard tổng quan |
| `/kpi/management`       | KpiManagement   | Admin          | Quản lý gói KPI     |
| `/kpi/my-kpi`           | MyKpi           | All            | KPI cá nhân         |
| `/kpi/leaderboard`      | KpiLeaderboard  | All            | Bảng xếp hạng       |
| `/kpi/commission-rates` | CommissionRates | Admin          | Quản lý hoa hồng    |

---

## ✅ Checklist tích hợp

- [x] ✅ Tạo tất cả components KPI
- [x] ✅ Thêm routes vào AppRouter
- [x] ✅ Cấu hình phân quyền routes
- [x] ✅ Cập nhật MenuController backend
- [x] ✅ Tích hợp AuthContext vào MyKpi
- [ ] ⏳ Cập nhật API endpoints constants
- [ ] ⏳ Thêm API functions vào ApiService
- [ ] ⏳ Cài đặt recharts package
- [ ] ⏳ Test kết nối backend API
- [ ] ⏳ Test phân quyền menu động

---

## 🚨 Lưu ý quan trọng

1. **Backend MenuController**: Copy file `MenuController_Updated.cs` vào backend

2. **API Base URL**: Đảm bảo `.env` có đúng URL:

   ```
   VITE_BASE_URL="https://localhost:7210"
   ```

3. **Dependencies**: Cài đặt recharts:

   ```bash
   npm install recharts
   ```

4. **Mock Data**: Component `AssignKpiModal` đang dùng mock users. Cần thay bằng API thực:

   ```javascript
   // TODO: Replace mock data
   const usersRes = await getUsersByRole("Sale");
   ```

5. **User ID**: MyKpi component đã tích hợp AuthContext để lấy userId tự động

---

**Tạo bởi**: AI Assistant  
**Ngày**: December 5, 2025  
**Version**: 1.0
