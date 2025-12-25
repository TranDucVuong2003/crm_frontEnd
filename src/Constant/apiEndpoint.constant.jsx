console.log("Environment BASE_URL:", import.meta.env.VITE_BASE_URL);
const API_ENDPOINT = {
  BASE_URL: import.meta.env.VITE_BASE_URL,

  // Auth endpoints
  AUTH: {
    LOGIN: "/api/Auth/login",
    REFRESH_TOKEN: "/api/Auth/refresh-token",
    LOGOUT: "/api/Auth/logout",
    GET_ALL_SESSIONS_ADMIN: "/api/Auth/admin/all-sessions",
    REVOKE_SESSION_ADMIN: (id) => `/api/Auth/admin/revoke-session/${id}`,
    VERIFY_ACTIVATION_TOKEN: (token) =>
      `/api/Auth/verify-activation-token?token=${token}`,
    CHANGE_PASSWORD_FIRST_TIME: "/api/Auth/change-password-first-time",
    REQUEST_CHANGE_PASSWORD_OTP: "/api/Auth/request-change-password-otp",
    VERIFY_OTP_AND_CHANGE_PASSWORD: "/api/Auth/verify-otp-and-change-password",
  },

  // Menu endpoints
  MENU: {
    GET_SIDEBAR: "/api/Menu/sidebar",
  },

  // Addons endpoints
  ADDONS: {
    GET_ALL: "/api/Addons",
    CREATE: "/api/Addons",
    GET_ACTIVE: "/api/Addons/active",
    GET_BY_TYPE: (type) => `/api/Addons/by-type/${type}`,
    GET_BY_ID: (id) => `/api/Addons/${id}`,
    UPDATE: (id) => `/api/Addons/${id}`,
    DELETE: (id) => `/api/Addons/${id}`,
  },

  // Customers endpoints
  CUSTOMERS: {
    GET_ALL: "/api/Customers",
    CREATE: "/api/Customers",
    GET_ACTIVE: "/api/Customers/active",
    GET_BY_ID: (id) => `/api/Customers/${id}`,
    UPDATE: (id) => `/api/Customers/${id}`,
    PATCH: (id) => `/api/Customers/${id}`,
    DELETE: (id) => `/api/Customers/${id}`,
    TOGGLE_STATUS: (id) => `/api/Customers/${id}/toggle-status`,
    GET_BY_TYPE: (customerType) => `/api/Customers/by-type/${customerType}`,
    GET_TYPE_STATISTICS: "/api/Customers/type-statistics",
    GET_INDIVIDUALS: "/api/Customers/individuals",
    GET_COMPANIES: "/api/Customers/companies",
  },

  // Companies endpoints
  COMPANIES: {
    GET_ALL: "/api/Companies",
    CREATE: "/api/Companies",
    GET_BY_ID: (id) => `/api/Companies/${id}`,
    UPDATE: (id) => `/api/Companies/${id}`,
    DELETE: (id) => `/api/Companies/${id}`,
    BATCH_UPDATE: "/api/Companies/batch-update",
    BATCH_DELETE: "/api/Companies/batch-delete",
  },

  // SaleOrders endpoints
  SALE_ORDERS: {
    GET_ALL: "/api/SaleOrders",
    CREATE: "/api/SaleOrders",
    GET_BY_CUSTOMER: (customerId) =>
      `/api/SaleOrders/by-customer/${customerId}`,
    GET_STATISTICS: "/api/SaleOrders/statistics",
    GET_BY_ID: (id) => `/api/SaleOrders/${id}`,
    UPDATE: (id) => `/api/SaleOrders/${id}`,
    DELETE: (id) => `/api/SaleOrders/${id}`,
    UPDATE_PROBABILITY: (id) => `/api/SaleOrders/${id}/probability`,
    EXPORT_CONTRACT: (id) => `/api/SaleOrders/${id}/export-contract`,
  },

  // Contracts endpoints
  CONTRACTS: {
    GET_ALL: "/api/Contracts",
    CREATE: "/api/Contracts",
    GET_BY_ID: (id) => `/api/Contracts/${id}`,
    UPDATE: (id) => `/api/Contracts/${id}`,
    DELETE: (id) => `/api/Contracts/${id}`,
    GET_BY_CUSTOMER: (customerId) => `/api/Contracts/customer/${customerId}`,
    PREVIEW: (id) => `/api/Contracts/${id}/preview`,
    EXPORT: (id) => `/api/Contracts/${id}/export-contract`,
    REGENERATE: (id) => `/api/Contracts/${id}/regenerate-contract`,
  },

  // Services endpoints
  SERVICES: {
    GET_ALL: "/api/Services",
    CREATE: "/api/Services",
    GET_ACTIVE: "/api/Services/active",
    GET_BY_CATEGORY: (category) => `/api/Services/by-category/${category}`,
    GET_BY_ID: (id) => `/api/Services/${id}`,
    UPDATE: (id) => `/api/Services/${id}`,
    DELETE: (id) => `/api/Services/${id}`,
  },

  // Tickets endpoints
  TICKETS: {
    GET_ALL: "/api/Tickets",
    GET_MY_TICKETS: "/api/Tickets/my-tickets",
    CREATE: "/api/Tickets",
    GET_BY_ID: (id) => `/api/Tickets/${id}`,
    UPDATE: (id) => `/api/Tickets/${id}`,
    DELETE: (id) => `/api/Tickets/${id}`,
    GET_LOGS: (id) => `/api/Tickets/${id}/logs`,
    ASSIGN: (id) => `/api/Tickets/${id}/assign`,
    UPDATE_STATUS: (id) => `/api/Tickets/${id}/status`,
  },

  // TicketCategories endpoints
  TICKET_CATEGORIES: {
    GET_ALL: "/api/TicketCategories",
    CREATE: "/api/TicketCategories",
    GET_BY_ID: (id) => `/api/TicketCategories/${id}`,
    UPDATE: (id) => `/api/TicketCategories/${id}`,
    PATCH: (id) => `/api/TicketCategories/${id}`,
    DELETE: (id) => `/api/TicketCategories/${id}`,
  },

  // TicketLogs endpoints
  TICKET_LOGS: {
    GET_ALL: "/api/TicketLogs",
    CREATE: "/api/TicketLogs",
    GET_BY_ID: (id) => `/api/TicketLogs/${id}`,
    UPDATE: (id) => `/api/TicketLogs/${id}`,
    DELETE: (id) => `/api/TicketLogs/${id}`,
    GET_BY_TICKET: (ticketId) => `/api/TicketLogs?ticketId=${ticketId}`,
    DOWNLOAD_ATTACHMENT: (id) => `/api/TicketLogs/attachments/${id}/download`,
  },

  // Users endpoints
  USERS: {
    GET_ALL: "/api/Users",
    CREATE: "/api/Users",
    GET_BY_ID: (id) => `/api/Users/${id}`,
    GET_BY_DEPARTMENT: (departmentId) =>
      `/api/Users/department/${departmentId}`,
    UPDATE: (id) => `/api/Users/${id}`,
    DELETE: (id) => `/api/Users/${id}`,
  },

  // Tax endpoints
  TAX: {
    GET_ALL: "/api/Tax",
    CREATE: "/api/Tax",
    GET_BY_ID: (id) => `/api/Tax/${id}`,
    UPDATE: (id) => `/api/Tax/${id}`,
    DELETE: (id) => `/api/Tax/${id}`,
  },

  // CategoryServiceAddons endpoints
  CATEGORY_SERVICE_ADDONS: {
    GET_ALL: "/api/CategoryServiceAddons",
    CREATE: "/api/CategoryServiceAddons",
    GET_BY_ID: (id) => `/api/CategoryServiceAddons/${id}`,
    UPDATE: (id) => `/api/CategoryServiceAddons/${id}`,
    DELETE: (id) => `/api/CategoryServiceAddons/${id}`,
    GET_SERVICES: (id) => `/api/CategoryServiceAddons/${id}/services`,
    GET_ADDONS: (id) => `/api/CategoryServiceAddons/${id}/addons`,
  },

  // Quotes endpoints
  QUOTES: {
    GET_ALL: "/api/Quotes",
    CREATE: "/api/Quotes",
    GET_BY_ID: (id) => `/api/Quotes/${id}`,
    UPDATE: (id) => `/api/Quotes/${id}`,
    DELETE: (id) => `/api/Quotes/${id}`,
    GET_BY_CUSTOMER: (customerId) => `/api/Quotes/by-customer/${customerId}`,
    PREVIEW: (id) => `/api/Quotes/${id}/preview`,
    EXPORT_PDF: (id) => `/api/Quotes/${id}/export-pdf`,
  },

  // MatchedTransactions endpoints
  MATCHED_TRANSACTIONS: {
    GET_ALL: "/api/MatchedTransactions",
    CREATE: "/api/MatchedTransactions",
    GET_BY_ID: (id) => `/api/MatchedTransactions/${id}`,
    UPDATE: (id) => `/api/MatchedTransactions/${id}`,
    DELETE: (id) => `/api/MatchedTransactions/${id}`,
    GET_BY_CONTRACT: (contractId) =>
      `/api/MatchedTransactions/contract/${contractId}`,
  },

  // Test endpoints
  TEST: {
    SEND_TEST_EMAIL: (ticketId) => `/api/Test/send-test-email/${ticketId}`,
    GET_TICKET_EMAIL_INFO: (ticketId) =>
      `/api/Test/ticket-email-info/${ticketId}`,
    GET_EMAIL_CONFIG_STATUS: "/api/Test/email-config-status",
    DEBUG_USER_CLAIMS: "/api/Test/debug-user-claims",
  },

  // Roles endpoints
  ROLES: {
    GET_ALL: "/api/Roles",
    CREATE: "/api/Roles",
    GET_BY_ID: (id) => `/api/Roles/${id}`,
    UPDATE: (id) => `/api/Roles/${id}`,
    DELETE: (id) => `/api/Roles/${id}`,
  },

  // Positions endpoints
  POSITIONS: {
    GET_ALL: "/api/Positions",
    CREATE: "/api/Positions",
    GET_BY_ID: (id) => `/api/Positions/${id}`,
    UPDATE: (id) => `/api/Positions/${id}`,
    DELETE: (id) => `/api/Positions/${id}`,
    GET_BY_LEVEL: (level) => `/api/Positions/level/${level}`,
  },

  // Departments endpoints
  DEPARTMENTS: {
    GET_ALL: "/api/Departments",
    CREATE: "/api/Departments",
    GET_BY_ID: (id) => `/api/Departments/${id}`,
    UPDATE: (id) => `/api/Departments/${id}`,
    DELETE: (id) => `/api/Departments/${id}`,
    GET_BY_RESION: (resionId) => `/api/Departments/resion/${resionId}`,
  },

  // Tax endpoints
  TAX: {
    GET_ALL: "/api/Tax",
    CREATE: "/api/Tax",
    GET_BY_ID: (id) => `/api/Tax/${id}`,
    UPDATE: (id) => `/api/Tax/${id}`,
    DELETE: (id) => `/api/Tax/${id}`,
  },

  // Resion endpoints
  Resions: {
    GET_ALL: "/api/Resions",
    CREATE: "/api/Resions",
    GET_BY_ID: (id) => `/api/Resions/${id}`,
    UPDATE: (id) => `/api/Resions/${id}`,
    DELETE: (id) => `/api/Resions/${id}`,
  },

  // Leads endpoints
  LEADS: {
    GET_ALL: "/api/Leads",
    CREATE: "/api/Leads",
    UPDATE: (id) => `/api/Leads/${id}`,
    DELETE: (id) => `/api/Leads/${id}`,
    ASSIGN: (id) => `/api/Leads/${id}/assign`,
  },

  // Dashboard endpoints
  DASHBOARD: {
    ADMIN: "/api/Dashboard/admin",
    USER: (userId) => `/api/Dashboard/user/${userId}`,
  },

  // KPI Packages endpoints
  KPI: {
    GET_ALL: "/api/KpiPackages",
    GET_BY_ID: (id) => `/api/KpiPackages/${id}`,
    CREATE: "/api/KpiPackages",
    UPDATE: (id) => `/api/KpiPackages/${id}`,
    DELETE: (id) => `/api/KpiPackages/${id}`,
    ASSIGN: "/api/KpiPackages/assign",
    GET_ASSIGNED_USERS: (id) => `/api/KpiPackages/${id}/assigned-users`,
    CALCULATE_ALL: "/api/KpiPackages/calculate-kpi",
    CALCULATE_USER: (userId) => `/api/KpiPackages/calculate-kpi-user/${userId}`,
  },

  // KPI Targets endpoints
  KPI_TARGETS: {
    GET_ALL: "/api/SaleKpiTargets",
    GET_BY_ID: (id) => `/api/SaleKpiTargets/${id}`,
    GET_BY_USER: (userId) => `/api/SaleKpiTargets/by-user/${userId}`,
    GET_BY_PERIOD: "/api/SaleKpiTargets/by-period",
    GET_BY_USER_PERIOD: "/api/SaleKpiTargets/by-user-period",
    CREATE: "/api/SaleKpiTargets",
    UPDATE: (id) => `/api/SaleKpiTargets/${id}`,
    DELETE: (id) => `/api/SaleKpiTargets/${id}`,
  },

  // Commission Rates endpoints
  COMMISSION_RATES: {
    GET_ALL: "/api/CommissionRates",
    GET_BY_ID: (id) => `/api/CommissionRates/${id}`,
    CREATE: "/api/CommissionRates",
    UPDATE: (id) => `/api/CommissionRates/${id}`,
    DELETE: (id) => `/api/CommissionRates/${id}`,
  },

  // KPI Records endpoints
  KPI_RECORDS: {
    GET_ALL: "/api/SaleKpiRecords",
    GET_BY_ID: (id) => `/api/SaleKpiRecords/${id}`,
    GET_BY_USER: (userId) => `/api/SaleKpiRecords/by-user/${userId}`,
    GET_BY_PERIOD: "/api/SaleKpiRecords/by-period",
    GET_LEADERBOARD: "/api/SaleKpiRecords/leaderboard",
    GET_STATISTICS: "/api/SaleKpiRecords/statistics",
    UPDATE_NOTES: (id) => `/api/SaleKpiRecords/${id}/notes`,
  },

  // Salary endpoints
  SALARIES: {
    GET_ALL: "/api/Salaries",
    CREATE: "/api/Salaries",
    GET_BY_ID: (id) => `/api/Salaries/${id}`,
    UPDATE: (id) => `/api/Salaries/${id}`,
    DELETE: (id) => `/api/Salaries/${id}`,
    GET_MY_SALARY: "/api/Salaries/my-salary",
    APPROVE: (id) => `/api/Salaries/${id}/approve`,
    REJECT: (id) => `/api/Salaries/${id}/reject`,
    MARK_PAID: (id) => `/api/Salaries/${id}/mark-paid`,
    BULK_CREATE: "/api/Salaries/bulk-create",
    BULK_APPROVE: "/api/Salaries/bulk-approve",
    CALCULATE_FROM_KPI: (userId) =>
      `/api/Salaries/calculate-from-kpi/${userId}`,
    AUTO_CALCULATE_ALL: "/api/Salaries/auto-calculate-all",
    GET_STATISTICS: "/api/Salaries/statistics",
    GET_STATISTICS_BY_DEPARTMENT: "/api/Salaries/statistics/by-department",
    EXPORT: "/api/Salaries/export",
  },

  // Insurance endpoints
  INSURANCES: {
    GET_ALL: "/api/Insurances",
    CREATE: "/api/Insurances",
    GET_BY_ID: (id) => `/api/Insurances/${id}`,
    UPDATE: (id) => `/api/Insurances/${id}`,
    DELETE: (id) => `/api/Insurances/${id}`,
  },

  // Insurance Status endpoints
  INSURANCE_STATUS: {
    GET_ALL: "/api/InsuranceStatus",
    GET_BY_ID: (id) => `/api/InsuranceStatus/${id}`,
    UPDATE: (id) => `/api/InsuranceStatus/${id}`,
    TOGGLE: (id) => `/api/InsuranceStatus/${id}/toggle`,
  },

  // Salary Contracts endpoints
  SALARY_CONTRACTS: {
    CREATE: "/api/SalaryContracts",
  },

  // Monthly Attendances endpoints
  MONTHLY_ATTENDANCES: {
    GET_ALL: "/api/MonthlyAttendances",
    CREATE: "/api/MonthlyAttendances",
    CREATE_BATCH: "/api/MonthlyAttendances/batch",
    GET_BY_ID: (id) => `/api/MonthlyAttendances/${id}`,
    UPDATE: (id) => `/api/MonthlyAttendances/${id}`,
    DELETE: (id) => `/api/MonthlyAttendances/${id}`,
    GET_BY_USER: (userId) => `/api/MonthlyAttendances/user/${userId}`,
    GET_BY_USER_MONTH_YEAR: (userId, month, year) =>
      `/api/MonthlyAttendances/user/${userId}/month/${month}/year/${year}`,
    GET_BY_MONTH_YEAR: (month, year) =>
      `/api/MonthlyAttendances/month/${month}/year/${year}`,
  },

  // Salary Components endpoints
  SALARY_COMPONENTS: {
    GET_ALL: "/api/SalaryComponents",
    CREATE: "/api/SalaryComponents",
    GET_BY_ID: (id) => `/api/SalaryComponents/${id}`,
    UPDATE: (id) => `/api/SalaryComponents/${id}`,
    DELETE: (id) => `/api/SalaryComponents/${id}`,
    GET_BY_USER: (userId) => `/api/SalaryComponents/user/${userId}`,
    GET_BY_USER_MONTH_YEAR: (userId, month, year) =>
      `/api/SalaryComponents/user/${userId}/month/${month}/year/${year}`,
    GET_BY_MONTH_YEAR: (month, year) =>
      `/api/SalaryComponents/month/${month}/year/${year}`,
  },

  // Insurance Policy endpoints
  INSURANCE_POLICY: {
    GET_ALL: "/api/InsurancePolicy",
  },

  // Payslips endpoints
  PAYSLIPS: {
    GET_ALL: "/api/Payslips",
    CREATE: "/api/Payslips",
    GET_BY_ID: (id) => `/api/Payslips/${id}`,
    UPDATE: (id) => `/api/Payslips/${id}`,
    DELETE: (id) => `/api/Payslips/${id}`,
    CALCULATE: "/api/Payslips/calculate",
    CALCULATE_BATCH: "/api/Payslips/calculate-batch",
    GET_BY_USER: (userId) => `/api/Payslips/user/${userId}`,
    GET_BY_USER_MONTH_YEAR: (userId, month, year) =>
      `/api/Payslips/user/${userId}/month/${month}/year/${year}`,
    GET_BY_MONTH_YEAR: (month, year) =>
      `/api/Payslips/month/${month}/year/${year}`,
    GET_BY_STATUS: (status) => `/api/Payslips/status/${status}`,
    MARK_PAID: (id) => `/api/Payslips/${id}/mark-paid`,
  },
};

export default API_ENDPOINT;
