import Swal from 'sweetalert2';

// ========== Success Alert ==========
export const showSuccess = (title, text, options = {}) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#10B981',
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true,
    ...options
  });
};

// ========== Error Alert ==========
export const showError = (title, text, options = {}) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Đóng',
    ...options
  });
};

// ========== Warning Alert ==========
export const showWarning = (title, text, options = {}) => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    confirmButtonColor: '#F59E0B',
    confirmButtonText: 'OK',
    ...options
  });
};

// ========== Info Alert ==========
export const showInfo = (title, text, options = {}) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonColor: '#3B82F6',
    confirmButtonText: 'OK',
    ...options
  });
};

// ========== Confirmation Dialog ==========
export const showConfirm = (title, text, options = {}) => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
    ...options
  });
};

// ========== Delete Confirmation ==========
export const showDeleteConfirm = (itemName = 'mục này', options = {}) => {
  return Swal.fire({
    icon: 'warning',
    title: 'Xác nhận xóa',
    html: `Bạn có chắc chắn muốn xóa <strong>${itemName}</strong>?<br><small style="color: #6B7280;">Hành động này không thể hoàn tác!</small>`,
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    reverseButtons: true,
    customClass: {
      popup: 'swal2-delete'
    },
    ...options
  });
};

// ========== Loading Alert ==========
export const showLoading = (title = 'Đang xử lý...', text = 'Vui lòng đợi') => {
  return Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// ========== Close Loading ==========
export const closeLoading = () => {
  Swal.close();
};

// ========== Toast Notification ==========
export const showToast = (type, message, options = {}) => {
  return Swal.fire({
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    toast: true,
    customClass: {
      popup: type === 'success' ? 'swal2-success-toast' :
             type === 'error' ? 'swal2-error-toast' :
             type === 'warning' ? 'swal2-warning-toast' :
             type === 'info' ? 'swal2-info-toast' : ''
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    ...options
  });
};

// ========== Quick Success Toast ==========
export const successToast = (message, options = {}) => {
  return showToast('success', message, options);
};

// ========== Quick Error Toast ==========
export const errorToast = (message, options = {}) => {
  return showToast('error', message, options);
};

// ========== Quick Info Toast ==========
export const infoToast = (message, options = {}) => {
  return showToast('info', message, options);
};

// ========== Quick Warning Toast ==========
export const warningToast = (message, options = {}) => {
  return showToast('warning', message, options);
};

// ========== Aliases for consistency ==========
export const showSuccessAlert = showSuccess;
export const showErrorAlert = showError;
export const showWarningAlert = showWarning;
export const showInfoAlert = showInfo;
export const showConfirmDialog = showConfirm;

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showDeleteConfirm,
  showLoading,
  closeLoading,
  showToast,
  successToast,
  errorToast,
  infoToast,
  warningToast,
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmDialog
};

