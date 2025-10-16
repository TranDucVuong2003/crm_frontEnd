# Cookie-based Authentication Implementation

## Tổng quan

Dự án đã được cập nhật để sử dụng cookies thay vì localStorage để lưu trữ thông tin authentication, giúp tăng cường bảo mật.

## Các file đã thay đổi

### 1. `src/utils/cookieUtils.js` (Mới)
- Utility functions để quản lý cookies
- `AuthCookies` object chứa các methods chuyên dụng cho authentication
- Hỗ trợ các cookie options như `secure`, `sameSite`, `expires`

### 2. `src/utils/authMigration.js` (Mới) 
- Tự động migrate dữ liệu từ localStorage sang cookies
- Cleanup localStorage data sau khi migrate
- Debug utilities

### 3. `src/Context/AuthContext.jsx` (Cập nhật)
- Sử dụng cookies thay vì localStorage
- Tự động migration khi app khởi động
- Improved error handling

### 4. `src/Service/ApiService.jsx` (Cập nhật)
- Token management sử dụng cookies
- Tương thích với cookie-based authentication

### 5. `src/Components/AuthDebugPanel.jsx` (Mới)
- Debug panel để kiểm tra trạng thái authentication
- Chỉ hiển thị trong development mode
- Các tools để test migration và cleanup

## Cấu hình Cookies

### Default Cookie Settings:
```javascript
{
  expires: 7,                    // 7 ngày cho user data
  expires: 1,                    // 1 ngày cho token
  secure: true,                  // Chỉ HTTPS (production)
  sameSite: 'Strict',           // CSRF protection
  path: '/'                     // Available toàn site
}
```

### Cookie Names:
- `auth_token`: JWT token
- `user_data`: Thông tin user (non-sensitive)
- `auth_status`: Authentication status

## Bảo mật được cải thiện

### 1. **XSS Protection**
- Cookies có thể được set `httpOnly` từ server
- Giảm risk của XSS attacks

### 2. **CSRF Protection** 
- `sameSite: 'Strict'` ngăn CSRF attacks
- Secure flag cho HTTPS

### 3. **Auto Expiration**
- Token tự động expire
- Session management tốt hơn

### 4. **Selective Storage**
- Chỉ lưu thông tin không nhạy cảm trong cookies
- Sensitive data không persist

## Migration Process

### Tự động Migration
Khi user truy cập app:
1. Kiểm tra có data trong localStorage không
2. Nếu có và chưa có cookies → migrate
3. Copy data từ localStorage sang cookies
4. Cleanup localStorage
5. App hoạt động bình thường với cookies

### Manual Migration
Sử dụng debug panel hoặc:
```javascript
import { migrateAuthDataToCookies } from './utils/authMigration';
migrateAuthDataToCookies();
```

## Testing & Debug

### Development Mode
- AuthDebugPanel hiển thị ở góc dưới bên phải
- Xem trạng thái localStorage vs cookies
- Test migration và cleanup
- Refresh auth info

### Production Mode  
- AuthDebugPanel tự động ẩn
- Logging giảm thiểu
- Optimized performance

## Server-side Configuration (Khuyến nghị)

Để tăng cường bảo mật, cấu hình server để:

### 1. Set HttpOnly Cookies
```javascript
// Express.js example
app.post('/api/auth/login', (req, res) => {
  // ... authentication logic
  
  res.cookie('auth_token', token, {
    httpOnly: true,        // Không thể access từ JS
    secure: true,          // Chỉ HTTPS
    sameSite: 'strict',    // CSRF protection
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  });
  
  res.json({ user: userData });
});
```

### 2. CORS Configuration
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true  // Allow cookies
}));
```

### 3. API Calls với Credentials
```javascript
// Client-side API calls
fetch('/api/endpoint', {
  credentials: 'include'  // Gửi cookies
});
```

## Rollback Plan

Nếu cần rollback về localStorage:

1. Comment out migration code trong AuthContext
2. Revert AuthContext.jsx và ApiService.jsx
3. Sử dụng backup localStorage implementation

## Best Practices

### 1. **Cookie Size Limits**
- Cookies có limit ~4KB per cookie
- Chỉ lưu essential data
- Sử dụng compression nếu cần

### 2. **Expiration Management**
- Set appropriate expiration times
- Implement refresh token mechanism
- Clear expired cookies

### 3. **Development vs Production**
- Different security settings
- Debug tools chỉ trong development
- Production monitoring

## Troubleshooting

### Common Issues:

1. **Cookies không được set**
   - Check secure flag với HTTP/HTTPS
   - Verify sameSite settings
   - Check domain/path configuration

2. **Migration không hoạt động**
   - Check localStorage data format
   - Verify cookie utilities
   - Use debug panel để kiểm tra

3. **Authentication fails sau khi switch**
   - Clear all storage và login lại
   - Check API configuration
   - Verify cookie reading logic

### Debug Commands:
```javascript
// Check current storage status
import { getAuthStorageSummary } from './utils/authMigration';
console.log(getAuthStorageSummary());

// Force cleanup localStorage
import { forceCleanupLocalStorage } from './utils/authMigration';
forceCleanupLocalStorage();

// Check cookies
import { AuthCookies } from './utils/cookieUtils';
console.log('Token:', AuthCookies.getToken());
console.log('User:', AuthCookies.getUser());
```