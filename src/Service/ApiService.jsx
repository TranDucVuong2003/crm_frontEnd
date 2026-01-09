import axios from "axios";
import API_ENDPOINT from "../Constant/apiEndpoint.constant";

import { AuthCookies } from "../utils/cookieUtils";

// Token management utilities using cookies
const getToken = () => {
  // Try to get token from cookies first (for authenticated users)
  let token = AuthCookies.getToken();

  // If not in cookies, check localStorage (for first-time login users)
  if (!token) {
    token = localStorage.getItem("accessToken");
  }

  return token;
};

const removeToken = () => {
  AuthCookies.clearAuth();
  // Trigger custom event for logout
  window.dispatchEvent(new CustomEvent("auth-logout"));
};

const setToken = (token) => {
  AuthCookies.setToken(token);
};

// =============================
// AXIOS INSTANCE & INTERCEPTORS
// =============================
const apiClient = axios.create({
  baseURL: API_ENDPOINT.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests (for refresh token in HttpOnly cookie)
});

// Add token to request headers
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // THÊM ĐOẠN NÀY:
    if (config.data instanceof FormData) {
      // Xóa Content-Type để browser tự động set multipart/form-data kèm boundary
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Handle 401 Unauthorized with token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("API Error:", error);

    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // Don't retry for login, logout, or refresh-token endpoints
      const excludedUrls = ["/login", "/logout", "/refresh-token"];
      const isExcluded = excludedUrls.some((url) =>
        originalRequest?.url?.includes(url)
      );

      if (isExcluded) {
        return Promise.reject(error);
      }

      // If already retried, logout
      if (originalRequest._retry) {
        console.log("Token refresh failed, logging out...");
        removeToken();

        // Force reload to trigger ProtectedRoute check
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);

        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Attempting to refresh token...");
        const response = await apiClient.post(API_ENDPOINT.AUTH.REFRESH_TOKEN);

        if (response.data && response.data.accessToken) {
          const newToken = response.data.accessToken;
          setToken(newToken);
          console.log("Token refreshed successfully");

          // Update authorization header
          apiClient.defaults.headers.common["Authorization"] =
            "Bearer " + newToken;
          originalRequest.headers["Authorization"] = "Bearer " + newToken;

          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error("Invalid refresh token response");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        removeToken();

        // Force reload to trigger ProtectedRoute check
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =============================
// AUTH APIs
// =============================
export const login = (loginData) => {
  return apiClient.post(API_ENDPOINT.AUTH.LOGIN, loginData);
};

export const refreshToken = () => {
  return apiClient.post(API_ENDPOINT.AUTH.REFRESH_TOKEN);
};

export const logout = () => {
  return apiClient.post(API_ENDPOINT.AUTH.LOGOUT);
};

export const getAllSessionsAdmin = () => {
  return apiClient.get(API_ENDPOINT.AUTH.GET_ALL_SESSIONS_ADMIN);
};

export const revokeSessionAdmin = (id, resion = null) => {
  return apiClient.post(API_ENDPOINT.AUTH.REVOKE_SESSION_ADMIN(id), { resion });
};

export const verifyActivationToken = (token) => {
  return apiClient.get(API_ENDPOINT.AUTH.VERIFY_ACTIVATION_TOKEN(token));
};

export const changePasswordFirstTime = (passwordData) => {
  return apiClient.post(
    API_ENDPOINT.AUTH.CHANGE_PASSWORD_FIRST_TIME,
    passwordData
  );
};

export const requestChangePasswordOTP = (email) => {
  return apiClient.post(API_ENDPOINT.AUTH.REQUEST_CHANGE_PASSWORD_OTP, {
    email,
  });
};

export const verifyOTPAndChangePassword = (data) => {
  return apiClient.post(API_ENDPOINT.AUTH.VERIFY_OTP_AND_CHANGE_PASSWORD, data);
};

// =============================
// MENU APIs
// =============================
export const getSidebarMenu = () => {
  return apiClient.get(API_ENDPOINT.MENU.GET_SIDEBAR);
};

// =============================
// CUSTOMERS APIs
// =============================
export const getAllCustomers = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_ALL);
};

export const getCustomersWithPaidContracts = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_WITH_PAID_CONTRACTS);
};

export const createCustomer = (customerData) => {
  return apiClient.post(API_ENDPOINT.CUSTOMERS.CREATE, customerData);
};

export const getActiveCustomers = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_ACTIVE);
};

export const getCustomerById = (id) => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_BY_ID(id));
};

export const updateCustomer = (id, customerData) => {
  return apiClient.put(API_ENDPOINT.CUSTOMERS.UPDATE(id), customerData);
};

export const patchCustomer = (id, customerData) => {
  return apiClient.patch(API_ENDPOINT.CUSTOMERS.PATCH(id), customerData);
};

export const deleteCustomer = (id) => {
  return apiClient.delete(API_ENDPOINT.CUSTOMERS.DELETE(id));
};

export const toggleCustomerStatus = (id) => {
  return apiClient.patch(API_ENDPOINT.CUSTOMERS.TOGGLE_STATUS(id));
};

export const getCustomersByType = (customerType) => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_BY_TYPE(customerType));
};

export const getCustomerTypeStatistics = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_TYPE_STATISTICS);
};

export const getIndividualCustomers = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_INDIVIDUALS);
};

export const getCompanyCustomers = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_COMPANIES);
};

// =============================
// COMPANIES APIs
// =============================
export const getAllCompanies = () => {
  return apiClient.get(API_ENDPOINT.COMPANIES.GET_ALL);
};

export const createCompany = (companyData) => {
  return apiClient.post(API_ENDPOINT.COMPANIES.CREATE, companyData);
};

export const getCompanyById = (id) => {
  return apiClient.get(API_ENDPOINT.COMPANIES.GET_BY_ID(id));
};

export const updateCompany = (id, companyData) => {
  return apiClient.put(API_ENDPOINT.COMPANIES.UPDATE(id), companyData);
};

export const deleteCompany = (id) => {
  return apiClient.delete(API_ENDPOINT.COMPANIES.DELETE(id));
};

export const batchUpdateCompanies = (companyIds, userId) => {
  return apiClient.put(API_ENDPOINT.COMPANIES.BATCH_UPDATE, {
    companyIds,
    userId,
  });
};

export const batchDeleteCompanies = (companyIds) => {
  return apiClient.delete(API_ENDPOINT.COMPANIES.BATCH_DELETE, {
    data: { companyIds },
  });
};

// =============================
// ADDONS APIs
// =============================
export const getAllAddons = () => {
  return apiClient.get(API_ENDPOINT.ADDONS.GET_ALL);
};

export const createAddon = (addonData) => {
  return apiClient.post(API_ENDPOINT.ADDONS.CREATE, addonData);
};

export const getActiveAddons = () => {
  return apiClient.get(API_ENDPOINT.ADDONS.GET_ACTIVE);
};

export const getAddonsByType = (type) => {
  return apiClient.get(API_ENDPOINT.ADDONS.GET_BY_TYPE(type));
};

export const getAddonById = (id) => {
  return apiClient.get(API_ENDPOINT.ADDONS.GET_BY_ID(id));
};

export const updateAddon = (id, addonData) => {
  return apiClient.put(API_ENDPOINT.ADDONS.UPDATE(id), addonData);
};

export const deleteAddon = (id) => {
  return apiClient.delete(API_ENDPOINT.ADDONS.DELETE(id));
};

// =============================
// SERVICES APIs
// =============================
export const getAllServices = () => {
  return apiClient.get(API_ENDPOINT.SERVICES.GET_ALL);
};

export const createService = (serviceData) => {
  return apiClient.post(API_ENDPOINT.SERVICES.CREATE, serviceData);
};

export const getActiveServices = () => {
  return apiClient.get(API_ENDPOINT.SERVICES.GET_ACTIVE);
};

export const getServicesByCategory = (category) => {
  return apiClient.get(API_ENDPOINT.SERVICES.GET_BY_CATEGORY(category));
};

export const getServiceById = (id) => {
  return apiClient.get(API_ENDPOINT.SERVICES.GET_BY_ID(id));
};

export const updateService = (id, serviceData) => {
  return apiClient.put(API_ENDPOINT.SERVICES.UPDATE(id), serviceData);
};

export const deleteService = (id) => {
  return apiClient.delete(API_ENDPOINT.SERVICES.DELETE(id));
};

// =============================
// SALE ORDERS APIs
// =============================
export const getAllSaleOrders = () => {
  return apiClient.get(API_ENDPOINT.SALE_ORDERS.GET_ALL);
};

export const createSaleOrder = (saleOrderData) => {
  return apiClient.post(API_ENDPOINT.SALE_ORDERS.CREATE, saleOrderData);
};

export const getSaleOrdersByCustomer = (customerId) => {
  return apiClient.get(API_ENDPOINT.SALE_ORDERS.GET_BY_CUSTOMER(customerId));
};

export const getSaleOrdersStatistics = () => {
  return apiClient.get(API_ENDPOINT.SALE_ORDERS.GET_STATISTICS);
};

export const getSaleOrderById = (id) => {
  return apiClient.get(API_ENDPOINT.SALE_ORDERS.GET_BY_ID(id));
};

export const updateSaleOrder = (id, saleOrderData) => {
  return apiClient.put(API_ENDPOINT.SALE_ORDERS.UPDATE(id), saleOrderData);
};

export const deleteSaleOrder = (id) => {
  return apiClient.delete(API_ENDPOINT.SALE_ORDERS.DELETE(id));
};

export const updateSaleOrderProbability = (id, probabilityData) => {
  return apiClient.patch(
    API_ENDPOINT.SALE_ORDERS.UPDATE_PROBABILITY(id),
    probabilityData
  );
};

export const exportSaleOrderContract = (id) => {
  return apiClient.get(API_ENDPOINT.SALE_ORDERS.EXPORT_CONTRACT(id));
};

// =============================
// CONTRACTS APIs
// =============================
export const getAllContracts = () => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_ALL, {
    params: { _t: Date.now() },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

export const createContract = (contractData) => {
  return apiClient.post(API_ENDPOINT.CONTRACTS.CREATE, contractData);
};

export const getContractById = (id) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_BY_ID(id), {
    params: { _t: Date.now() },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

export const updateContract = (id, contractData) => {
  return apiClient.put(API_ENDPOINT.CONTRACTS.UPDATE(id), contractData);
};

export const deleteContract = (id) => {
  return apiClient.delete(API_ENDPOINT.CONTRACTS.DELETE(id));
};

export const getContractsByCustomer = (customerId) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_BY_CUSTOMER(customerId), {
    params: { _t: Date.now() },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

export const previewContract = (id) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.PREVIEW(id), {
    headers: {
      Accept: "text/html",
    },
  });
};

export const exportContract = (id) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.EXPORT(id), {
    responseType: "blob",
  });
};

export const regenerateContract = (id) => {
  return apiClient.post(API_ENDPOINT.CONTRACTS.REGENERATE(id), null, {
    responseType: "blob",
  });
};

export const getContractQRCode = (id, paymentType) => {
  return apiClient.get(`${API_ENDPOINT.CONTRACTS.GET_BY_ID(id)}/qr-code`, {
    params: { paymentType },
  });
};

// =============================
// TICKETS APIs
// =============================
export const getAllTickets = () => {
  return apiClient.get(API_ENDPOINT.TICKETS.GET_ALL);
};

export const getMyTickets = () => {
  return apiClient.get(API_ENDPOINT.TICKETS.GET_MY_TICKETS);
};

export const createTicket = (ticketData) => {
  return apiClient.post(API_ENDPOINT.TICKETS.CREATE, ticketData);
};

export const getTicketById = (id) => {
  return apiClient.get(API_ENDPOINT.TICKETS.GET_BY_ID(id));
};

export const updateTicket = (id, ticketData) => {
  return apiClient.put(API_ENDPOINT.TICKETS.UPDATE(id), ticketData);
};

export const deleteTicket = (id) => {
  return apiClient.delete(API_ENDPOINT.TICKETS.DELETE(id));
};

export const getTicketLogs = (id) => {
  return apiClient.get(API_ENDPOINT.TICKETS.GET_LOGS(id));
};

export const assignTicket = (id, assignData) => {
  return apiClient.put(API_ENDPOINT.TICKETS.ASSIGN(id), assignData);
};

export const updateTicketStatus = (id, statusData) => {
  return apiClient.put(API_ENDPOINT.TICKETS.UPDATE_STATUS(id), statusData);
};

// =============================
// TICKET CATEGORIES APIs
// =============================
export const getAllTicketCategories = () => {
  return apiClient.get(API_ENDPOINT.TICKET_CATEGORIES.GET_ALL);
};

export const createTicketCategory = (categoryData) => {
  return apiClient.post(API_ENDPOINT.TICKET_CATEGORIES.CREATE, categoryData);
};

export const getTicketCategoryById = (id) => {
  return apiClient.get(API_ENDPOINT.TICKET_CATEGORIES.GET_BY_ID(id));
};

export const updateTicketCategory = (id, categoryData) => {
  return apiClient.put(API_ENDPOINT.TICKET_CATEGORIES.UPDATE(id), categoryData);
};

export const patchTicketCategory = (id, categoryData) => {
  return apiClient.patch(
    API_ENDPOINT.TICKET_CATEGORIES.PATCH(id),
    categoryData
  );
};

export const deleteTicketCategory = (id) => {
  return apiClient.delete(API_ENDPOINT.TICKET_CATEGORIES.DELETE(id));
};

// =============================
// TICKET LOGS APIs
// =============================
export const getAllTicketLogs = () => {
  return apiClient.get(API_ENDPOINT.TICKET_LOGS.GET_ALL);
};

export const createTicketLog = (logData) => {
  // Check if logData is FormData (has files)
  const isFormData = logData instanceof FormData;

  return apiClient.post(API_ENDPOINT.TICKET_LOGS.CREATE, logData, {
    headers: isFormData
      ? {
          "Content-Type": "multipart/form-data",
        }
      : undefined,
  });
};

export const getTicketLogById = (id) => {
  return apiClient.get(API_ENDPOINT.TICKET_LOGS.GET_BY_ID(id));
};

export const updateTicketLog = (id, logData) => {
  return apiClient.put(API_ENDPOINT.TICKET_LOGS.UPDATE(id), logData);
};

export const deleteTicketLog = (id) => {
  return apiClient.delete(API_ENDPOINT.TICKET_LOGS.DELETE(id));
};

export const getTicketLogsByTicket = (ticketId) => {
  return apiClient.get(API_ENDPOINT.TICKET_LOGS.GET_BY_TICKET(ticketId));
};

export const downloadTicketLogAttachment = (attachmentId) => {
  return apiClient.get(
    API_ENDPOINT.TICKET_LOGS.DOWNLOAD_ATTACHMENT(attachmentId),
    {
      responseType: "blob",
    }
  );
};

// =============================
// USERS APIs
// =============================
export const getAllUsers = () => {
  return apiClient.get(API_ENDPOINT.USERS.GET_ALL);
};

export const createUser = (userData) => {
  return apiClient.post(API_ENDPOINT.USERS.CREATE, userData);
};

export const getUserById = (id) => {
  return apiClient.get(API_ENDPOINT.USERS.GET_BY_ID(id));
};

export const getUsersByDepartment = (departmentId) => {
  return apiClient.get(API_ENDPOINT.USERS.GET_BY_DEPARTMENT(departmentId));
};

export const updateUser = (id, userData) => {
  return apiClient.put(API_ENDPOINT.USERS.UPDATE(id), userData);
};

export const deleteUser = (id) => {
  return apiClient.delete(API_ENDPOINT.USERS.DELETE(id));
};

// =============================
// TAX APIs
// =============================
export const getAllTax = () => {
  return apiClient.get(API_ENDPOINT.TAX.GET_ALL);
};

export const createTax = (taxData) => {
  return apiClient.post(API_ENDPOINT.TAX.CREATE, taxData);
};

export const getTaxById = (id) => {
  return apiClient.get(API_ENDPOINT.TAX.GET_BY_ID(id));
};

export const updateTax = (id, taxData) => {
  return apiClient.put(API_ENDPOINT.TAX.UPDATE(id), taxData);
};

export const deleteTax = (id) => {
  return apiClient.delete(API_ENDPOINT.TAX.DELETE(id));
};

// =============================
// CATEGORY SERVICE ADDONS APIs
// =============================
export const getAllCategoryServiceAddons = () => {
  return apiClient.get(API_ENDPOINT.CATEGORY_SERVICE_ADDONS.GET_ALL);
};

export const createCategoryServiceAddon = (categoryData) => {
  return apiClient.post(
    API_ENDPOINT.CATEGORY_SERVICE_ADDONS.CREATE,
    categoryData
  );
};

export const getCategoryServiceAddonById = (id) => {
  return apiClient.get(API_ENDPOINT.CATEGORY_SERVICE_ADDONS.GET_BY_ID(id));
};

export const updateCategoryServiceAddon = (id, categoryData) => {
  return apiClient.put(
    API_ENDPOINT.CATEGORY_SERVICE_ADDONS.UPDATE(id),
    categoryData
  );
};

export const deleteCategoryServiceAddon = (id) => {
  return apiClient.delete(API_ENDPOINT.CATEGORY_SERVICE_ADDONS.DELETE(id));
};

export const getCategoryServices = (id) => {
  return apiClient.get(API_ENDPOINT.CATEGORY_SERVICE_ADDONS.GET_SERVICES(id));
};

export const getCategoryAddons = (id) => {
  return apiClient.get(API_ENDPOINT.CATEGORY_SERVICE_ADDONS.GET_ADDONS(id));
};

// =============================
// QUOTES APIs
// =============================
export const getAllQuotes = () => {
  return apiClient.get(API_ENDPOINT.QUOTES.GET_ALL);
};

export const createQuote = (quoteData) => {
  return apiClient.post(API_ENDPOINT.QUOTES.CREATE, quoteData);
};

export const getQuoteById = (id) => {
  return apiClient.get(API_ENDPOINT.QUOTES.GET_BY_ID(id));
};

export const updateQuote = (id, quoteData) => {
  return apiClient.put(API_ENDPOINT.QUOTES.UPDATE(id), quoteData);
};

export const deleteQuote = (id) => {
  return apiClient.delete(API_ENDPOINT.QUOTES.DELETE(id));
};

export const getQuotesByCustomer = (customerId) => {
  return apiClient.get(API_ENDPOINT.QUOTES.GET_BY_CUSTOMER(customerId));
};

export const previewQuote = (id) => {
  return apiClient.get(API_ENDPOINT.QUOTES.PREVIEW(id), {
    headers: {
      Accept: "text/html",
    },
  });
};

export const exportQuotePdf = (id) => {
  return apiClient.get(API_ENDPOINT.QUOTES.EXPORT_PDF(id), {
    responseType: "blob",
  });
};

// =============================
// MATCHED TRANSACTIONS APIs
// =============================
export const getAllMatchedTransactions = () => {
  return apiClient.get(API_ENDPOINT.MATCHED_TRANSACTIONS.GET_ALL);
};

export const createMatchedTransaction = (matchPaymentData) => {
  return apiClient.post(
    API_ENDPOINT.MATCHED_TRANSACTIONS.CREATE,
    matchPaymentData
  );
};

export const getMatchedTransactionById = (id) => {
  return apiClient.get(API_ENDPOINT.MATCHED_TRANSACTIONS.GET_BY_ID(id));
};

export const updateMatchedTransaction = (id, matchedTransactionData) => {
  return apiClient.put(
    API_ENDPOINT.MATCHED_TRANSACTIONS.UPDATE(id),
    matchedTransactionData
  );
};

export const deleteMatchedTransaction = (id) => {
  return apiClient.delete(API_ENDPOINT.MATCHED_TRANSACTIONS.DELETE(id));
};

export const getMatchedTransactionsByContract = (contractId) => {
  return apiClient.get(
    API_ENDPOINT.MATCHED_TRANSACTIONS.GET_BY_CONTRACT(contractId)
  );
};

// =============================
// TEST APIs
// =============================
export const sendTestEmail = (ticketId) => {
  return apiClient.post(API_ENDPOINT.TEST.SEND_TEST_EMAIL(ticketId));
};

export const getTicketEmailInfo = (ticketId) => {
  return apiClient.get(API_ENDPOINT.TEST.GET_TICKET_EMAIL_INFO(ticketId));
};

export const getEmailConfigStatus = () => {
  return apiClient.get(API_ENDPOINT.TEST.GET_EMAIL_CONFIG_STATUS);
};

export const debugUserClaims = () => {
  return apiClient.get(API_ENDPOINT.TEST.DEBUG_USER_CLAIMS);
};

// =============================
// ROLES APIs
// =============================
export const getAllRoles = () => {
  return apiClient.get(API_ENDPOINT.ROLES.GET_ALL);
};

export const createRole = (roleData) => {
  return apiClient.post(API_ENDPOINT.ROLES.CREATE, roleData);
};

export const getRoleById = (id) => {
  return apiClient.get(API_ENDPOINT.ROLES.GET_BY_ID(id));
};

export const updateRole = (id, roleData) => {
  return apiClient.put(API_ENDPOINT.ROLES.UPDATE(id), roleData);
};

export const deleteRole = (id) => {
  return apiClient.delete(API_ENDPOINT.ROLES.DELETE(id));
};

// =============================
// POSITIONS APIs
// =============================
export const getAllPositions = () => {
  return apiClient.get(API_ENDPOINT.POSITIONS.GET_ALL);
};

export const createPosition = (positionData) => {
  return apiClient.post(API_ENDPOINT.POSITIONS.CREATE, positionData);
};

export const getPositionById = (id) => {
  return apiClient.get(API_ENDPOINT.POSITIONS.GET_BY_ID(id));
};

export const updatePosition = (id, positionData) => {
  return apiClient.put(API_ENDPOINT.POSITIONS.UPDATE(id), positionData);
};

export const deletePosition = (id) => {
  return apiClient.delete(API_ENDPOINT.POSITIONS.DELETE(id));
};

export const getPositionsByLevel = (level) => {
  return apiClient.get(API_ENDPOINT.POSITIONS.GET_BY_LEVEL(level));
};

// =============================
// DEPARTMENTS APIs
// =============================
export const getAllDepartments = () => {
  return apiClient.get(API_ENDPOINT.DEPARTMENTS.GET_ALL);
};

export const createDepartment = (departmentData) => {
  return apiClient.post(API_ENDPOINT.DEPARTMENTS.CREATE, departmentData);
};

export const getDepartmentById = (id) => {
  return apiClient.get(API_ENDPOINT.DEPARTMENTS.GET_BY_ID(id));
};

export const updateDepartment = (id, departmentData) => {
  return apiClient.put(API_ENDPOINT.DEPARTMENTS.UPDATE(id), departmentData);
};

export const deleteDepartment = (id) => {
  return apiClient.delete(API_ENDPOINT.DEPARTMENTS.DELETE(id));
};

export const getDepartmentsByReasion = (reasionId) => {
  return apiClient.get(API_ENDPOINT.DEPARTMENTS.GET_BY_REASION(reasionId));
};

// =============================
// Resion APIs
// =============================
export const getAllResions = () => {
  return apiClient.get(API_ENDPOINT.Resions.GET_ALL);
};

export const createResion = (resionData) => {
  return apiClient.post(API_ENDPOINT.Resions.CREATE, resionData);
};

export const getResionById = (id) => {
  return apiClient.get(API_ENDPOINT.Resions.GET_BY_ID(id));
};

export const updateResion = (id, resionData) => {
  return apiClient.put(API_ENDPOINT.Resions.UPDATE(id), resionData);
};

export const deleteResion = (id) => {
  return apiClient.delete(API_ENDPOINT.Resions.DELETE(id));
};

// =============================
// Marketing Budget APIs
// =============================
export const getAllMarketingBudgets = (params) => {
  return apiClient.get(API_ENDPOINT.MARKETING_BUDGET.GET_ALL, { params });
};

export const createMarketingBudget = (budgetData) => {
  return apiClient.post(API_ENDPOINT.MARKETING_BUDGET.CREATE, budgetData);
};

export const updateMarketingBudget = (id, budgetData) => {
  return apiClient.put(API_ENDPOINT.MARKETING_BUDGET.UPDATE(id), budgetData);
};

export const deleteMarketingBudget = (id) => {
  return apiClient.delete(API_ENDPOINT.MARKETING_BUDGET.DELETE(id));
};

export const approveMarketingBudget = (id) => {
  return apiClient.post(API_ENDPOINT.MARKETING_BUDGET.APPROVE(id));
};

// =============================
// Marketing Expense APIs
// =============================
export const getAllMarketingExpenses = (params) => {
  return apiClient.get(API_ENDPOINT.MARKETING_EXPENSE.GET_ALL, { params });
};

export const createMarketingExpense = (expenseData) => {
  return apiClient.post(API_ENDPOINT.MARKETING_EXPENSE.CREATE, expenseData);
};

export const updateMarketingExpense = (id, expenseData) => {
  return apiClient.put(API_ENDPOINT.MARKETING_EXPENSE.UPDATE(id), expenseData);
};

export const deleteMarketingExpense = (id) => {
  return apiClient.delete(API_ENDPOINT.MARKETING_EXPENSE.DELETE(id));
};

export const approveMarketingExpense = (id) => {
  return apiClient.post(API_ENDPOINT.MARKETING_EXPENSE.APPROVE(id));
};

// =============================
// Leads APIs
// =============================
export const getAllLeads = (params) => {
  return apiClient.get(API_ENDPOINT.LEADS.GET_ALL, { params });
};

export const createLead = (leadData) => {
  return apiClient.post(API_ENDPOINT.LEADS.CREATE, leadData);
};

export const updateLead = (id, leadData) => {
  return apiClient.put(API_ENDPOINT.LEADS.UPDATE(id), leadData);
};

export const deleteLead = (id) => {
  return apiClient.delete(API_ENDPOINT.LEADS.DELETE(id));
};

export const assignLead = (id, assignData) => {
  return apiClient.put(API_ENDPOINT.LEADS.ASSIGN(id), assignData);
};

// =============================
// Dashboard APIs
// =============================
export const getAdminDashboard = (params) => {
  return apiClient.get(API_ENDPOINT.DASHBOARD.ADMIN, { params });
};

export const getUserDashboard = (userId, params) => {
  return apiClient.get(API_ENDPOINT.DASHBOARD.USER(userId), { params });
};

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

// =============================
// SALARY APIs
// =============================

export const getAllSalaries = (params) => {
  return apiClient.get(API_ENDPOINT.SALARIES.GET_ALL, { params });
};

export const createSalary = (data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.CREATE, data);
};

export const getSalaryById = (id) => {
  return apiClient.get(API_ENDPOINT.SALARIES.GET_BY_ID(id));
};

export const updateSalary = (id, data) => {
  return apiClient.put(API_ENDPOINT.SALARIES.UPDATE(id), data);
};

export const deleteSalary = (id) => {
  return apiClient.delete(API_ENDPOINT.SALARIES.DELETE(id));
};

export const getMySalary = (params) => {
  return apiClient.get(API_ENDPOINT.SALARIES.GET_MY_SALARY, { params });
};

export const approveSalary = (id, data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.APPROVE(id), data);
};

export const rejectSalary = (id, data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.REJECT(id), data);
};

export const markSalaryAsPaid = (id) => {
  return apiClient.post(API_ENDPOINT.SALARIES.MARK_PAID(id));
};

export const bulkCreateSalaries = (data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.BULK_CREATE, data);
};

export const bulkApproveSalaries = (data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.BULK_APPROVE, data);
};

export const calculateSalaryFromKpi = (userId, params) => {
  return apiClient.post(
    API_ENDPOINT.SALARIES.CALCULATE_FROM_KPI(userId),
    null,
    { params }
  );
};

export const autoCalculateAllSalaries = (data) => {
  return apiClient.post(API_ENDPOINT.SALARIES.AUTO_CALCULATE_ALL, data);
};

export const getSalaryStatistics = (params) => {
  return apiClient.get(API_ENDPOINT.SALARIES.GET_STATISTICS, { params });
};

export const getSalaryStatisticsByDepartment = (params) => {
  return apiClient.get(API_ENDPOINT.SALARIES.GET_STATISTICS_BY_DEPARTMENT, {
    params,
  });
};

export const exportSalaries = (params) => {
  return apiClient.get(API_ENDPOINT.SALARIES.EXPORT, { params });
};

// =============================
// INSURANCES
// =============================
export const getAllInsurances = () => {
  return apiClient.get(API_ENDPOINT.INSURANCES.GET_ALL);
};

export const getInsuranceById = (id) => {
  return apiClient.get(API_ENDPOINT.INSURANCES.GET_BY_ID(id));
};

export const createInsurance = (data) => {
  return apiClient.post(API_ENDPOINT.INSURANCES.CREATE, data);
};

export const updateInsurance = (id, data) => {
  return apiClient.put(API_ENDPOINT.INSURANCES.UPDATE(id), data);
};

export const deleteInsurance = (id) => {
  return apiClient.delete(API_ENDPOINT.INSURANCES.DELETE(id));
};

// =============================
// INSURANCE STATUS
// =============================
export const getAllInsuranceStatus = () => {
  return apiClient.get(API_ENDPOINT.INSURANCE_STATUS.GET_ALL);
};

export const getInsuranceStatusById = (id) => {
  return apiClient.get(API_ENDPOINT.INSURANCE_STATUS.GET_BY_ID(id));
};

export const updateInsuranceStatus = (id, data) => {
  return apiClient.put(API_ENDPOINT.INSURANCE_STATUS.UPDATE(id), data);
};

export const toggleInsuranceStatus = (id) => {
  return apiClient.patch(API_ENDPOINT.INSURANCE_STATUS.TOGGLE(id));
};

// =============================
// SALARY CONTRACTS
// =============================
export const createSalaryContract = (formData) => {
  return apiClient.post(API_ENDPOINT.SALARY_CONTRACTS.CREATE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllSalaryContracts = () => {
  return apiClient.get(API_ENDPOINT.SALARY_CONTRACTS.GET_ALL);
};

export const getSalaryContractById = (id) => {
  return apiClient.get(API_ENDPOINT.SALARY_CONTRACTS.GET_BY_ID(id));
};

export const getSalaryContractByUser = (userId) => {
  return apiClient.get(API_ENDPOINT.SALARY_CONTRACTS.GET_BY_USER(userId));
};

export const updateSalaryContract = (id, formData) => {
  return apiClient.put(API_ENDPOINT.SALARY_CONTRACTS.UPDATE(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadCommitment08 = (contractId, file) => {
  const formData = new FormData();
  formData.append("File", file);

  // Không cần options headers nữa, Interceptor lo hết rồi
  return apiClient.post(
    API_ENDPOINT.SALARY_CONTRACTS.UPLOAD_COMMITMENT08(contractId),
    formData
  );
};

export const deleteSalaryContract = (id) => {
  return apiClient.delete(API_ENDPOINT.SALARY_CONTRACTS.DELETE(id));
};

export const downloadCommitment08Template = () => {
  return apiClient.get(
    API_ENDPOINT.SALARY_CONTRACTS.DOWNLOAD_COMMITMENT08_TEMPLATE,
    {
      responseType: "blob",
    }
  );
};

// =============================
// MONTHLY ATTENDANCES
// =============================
export const getAllMonthlyAttendances = (params) => {
  return apiClient.get(API_ENDPOINT.MONTHLY_ATTENDANCES.GET_ALL, { params });
};

export const createMonthlyAttendance = (data) => {
  return apiClient.post(API_ENDPOINT.MONTHLY_ATTENDANCES.CREATE, data);
};

export const createBatchMonthlyAttendances = (data) => {
  return apiClient.post(API_ENDPOINT.MONTHLY_ATTENDANCES.CREATE_BATCH, data);
};

export const getMonthlyAttendanceById = (id) => {
  return apiClient.get(API_ENDPOINT.MONTHLY_ATTENDANCES.GET_BY_ID(id));
};

export const updateMonthlyAttendance = (id, data) => {
  return apiClient.put(API_ENDPOINT.MONTHLY_ATTENDANCES.UPDATE(id), data);
};

export const deleteMonthlyAttendance = (id) => {
  return apiClient.delete(API_ENDPOINT.MONTHLY_ATTENDANCES.DELETE(id));
};

export const getMonthlyAttendanceByUser = (userId) => {
  return apiClient.get(API_ENDPOINT.MONTHLY_ATTENDANCES.GET_BY_USER(userId));
};

export const getMonthlyAttendanceByUserMonthYear = (userId, month, year) => {
  return apiClient.get(
    API_ENDPOINT.MONTHLY_ATTENDANCES.GET_BY_USER_MONTH_YEAR(userId, month, year)
  );
};

export const getMonthlyAttendancesByMonthYear = (month, year) => {
  return apiClient.get(
    API_ENDPOINT.MONTHLY_ATTENDANCES.GET_BY_MONTH_YEAR(month, year)
  );
};

// =============================
// SALARY COMPONENTS
// =============================
export const getAllSalaryComponents = (params) => {
  return apiClient.get(API_ENDPOINT.SALARY_COMPONENTS.GET_ALL, { params });
};

export const createSalaryComponent = (data) => {
  return apiClient.post(API_ENDPOINT.SALARY_COMPONENTS.CREATE, data);
};

export const getSalaryComponentById = (id) => {
  return apiClient.get(API_ENDPOINT.SALARY_COMPONENTS.GET_BY_ID(id));
};

export const updateSalaryComponent = (id, data) => {
  return apiClient.put(API_ENDPOINT.SALARY_COMPONENTS.UPDATE(id), data);
};

export const deleteSalaryComponent = (id) => {
  return apiClient.delete(API_ENDPOINT.SALARY_COMPONENTS.DELETE(id));
};

export const getSalaryComponentsByUser = (userId) => {
  return apiClient.get(API_ENDPOINT.SALARY_COMPONENTS.GET_BY_USER(userId));
};

export const getSalaryComponentsByUserMonthYear = (userId, month, year) => {
  return apiClient.get(
    API_ENDPOINT.SALARY_COMPONENTS.GET_BY_USER_MONTH_YEAR(userId, month, year)
  );
};

export const getSalaryComponentsByMonthYear = (month, year) => {
  return apiClient.get(
    API_ENDPOINT.SALARY_COMPONENTS.GET_BY_MONTH_YEAR(month, year)
  );
};

// =============================
// INSURANCE POLICY
// =============================
export const getAllInsurancePolicy = () => {
  return apiClient.get(API_ENDPOINT.INSURANCE_POLICY.GET_ALL);
};

// =============================
// PAYSLIPS
// =============================
export const getAllPayslips = () => {
  return apiClient.get(API_ENDPOINT.PAYSLIPS.GET_ALL);
};

export const getPayslipById = (id) => {
  return apiClient.get(API_ENDPOINT.PAYSLIPS.GET_BY_ID(id));
};

export const createPayslip = (data) => {
  return apiClient.post(API_ENDPOINT.PAYSLIPS.CREATE, data);
};

export const updatePayslip = (id, data) => {
  return apiClient.put(API_ENDPOINT.PAYSLIPS.UPDATE(id), data);
};

export const deletePayslip = (id) => {
  return apiClient.delete(API_ENDPOINT.PAYSLIPS.DELETE(id));
};

export const calculatePayslip = (data) => {
  return apiClient.post(API_ENDPOINT.PAYSLIPS.CALCULATE, data);
};

export const calculateBatchPayslips = (data) => {
  return apiClient.post(API_ENDPOINT.PAYSLIPS.CALCULATE_BATCH, data);
};

export const getPayslipsByUserId = (userId) => {
  return apiClient.get(API_ENDPOINT.PAYSLIPS.GET_BY_USER(userId));
};

export const getPayslipByUserMonthYear = (userId, month, year) => {
  return apiClient.get(
    API_ENDPOINT.PAYSLIPS.GET_BY_USER_MONTH_YEAR(userId, month, year)
  );
};

export const getPayslipsByMonthYear = (month, year) => {
  return apiClient.get(API_ENDPOINT.PAYSLIPS.GET_BY_MONTH_YEAR(month, year));
};

export const getPayslipsByStatus = (status) => {
  return apiClient.get(API_ENDPOINT.PAYSLIPS.GET_BY_STATUS(status));
};

export const markPayslipAsPaid = (id) => {
  return apiClient.put(API_ENDPOINT.PAYSLIPS.MARK_PAID(id));
};

export const previewSalaryReport = (params) => {
  return apiClient.post(API_ENDPOINT.PAYSLIPS.PREVIEW_REPORT, params, {
    headers: {
      Accept: "text/html",
    },
  });
};

export const exportSalaryReport = (params) => {
  return apiClient.post(API_ENDPOINT.PAYSLIPS.EXPORT_REPORT, params, {
    responseType: "blob",
  });
};

// =============================
// NOTIFICATIONS
// =============================
export const getMyNotifications = (params) => {
  return apiClient.get(API_ENDPOINT.NOTIFICATIONS.GET_MY_NOTIFICATIONS, {
    params,
  });
};

export const getUnreadNotificationCount = () => {
  return apiClient.get(API_ENDPOINT.NOTIFICATIONS.GET_UNREAD_COUNT);
};

export const markNotificationAsRead = (notificationId) => {
  return apiClient.post(API_ENDPOINT.NOTIFICATIONS.MARK_AS_READ, {
    notificationId,
  });
};

export const markAllNotificationsAsRead = () => {
  return apiClient.post(API_ENDPOINT.NOTIFICATIONS.MARK_ALL_AS_READ);
};

export const deleteNotification = (id) => {
  return apiClient.delete(API_ENDPOINT.NOTIFICATIONS.DELETE(id));
};

// Admin - Create and send notification
export const createNotification = (data) => {
  return apiClient.post(API_ENDPOINT.NOTIFICATIONS.CREATE, data);
};

// Admin - Get all notifications
export const getAllNotificationsAdmin = (params) => {
  return apiClient.get(API_ENDPOINT.NOTIFICATIONS.GET_ALL_ADMIN, { params });
};

// Admin - Get notification recipients
export const getNotificationRecipients = (notificationId) => {
  return apiClient.get(
    API_ENDPOINT.NOTIFICATIONS.GET_RECIPIENTS(notificationId)
  );
};

// Admin - Get notification read status
export const getNotificationReadStatus = (notificationId) => {
  return apiClient.get(
    API_ENDPOINT.NOTIFICATIONS.GET_READ_STATUS(notificationId)
  );
};

// Admin - Update notification
export const updateNotification = (id, data) => {
  return apiClient.put(API_ENDPOINT.NOTIFICATIONS.UPDATE(id), data);
};

// =============================
// DOCUMENT TEMPLATES APIs
// =============================
export const getAllDocumentTemplates = (type = null) => {
  const url = type
    ? `${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_ALL}?type=${type}`
    : API_ENDPOINT.DOCUMENT_TEMPLATES.GET_ALL;
  return apiClient.get(url);
};

export const getDocumentTemplateById = (id) => {
  return apiClient.get(API_ENDPOINT.DOCUMENT_TEMPLATES.GET_BY_ID(id));
};

export const getDocumentTemplateByCode = (code) => {
  return apiClient.get(API_ENDPOINT.DOCUMENT_TEMPLATES.GET_BY_CODE(code));
};

export const getDefaultDocumentTemplateByType = (templateType) => {
  return apiClient.get(
    API_ENDPOINT.DOCUMENT_TEMPLATES.GET_DEFAULT_BY_TYPE(templateType)
  );
};

export const getDocumentTemplateTypes = () => {
  return apiClient.get(API_ENDPOINT.DOCUMENT_TEMPLATES.GET_TYPES);
};

export const createDocumentTemplate = (data) => {
  return apiClient.post(API_ENDPOINT.DOCUMENT_TEMPLATES.CREATE, data);
};

export const updateDocumentTemplate = (id, data) => {
  return apiClient.put(API_ENDPOINT.DOCUMENT_TEMPLATES.UPDATE(id), data);
};

export const deleteDocumentTemplate = (id) => {
  return apiClient.delete(API_ENDPOINT.DOCUMENT_TEMPLATES.DELETE(id));
};

export const setDefaultDocumentTemplate = (id) => {
  return apiClient.patch(API_ENDPOINT.DOCUMENT_TEMPLATES.SET_DEFAULT(id));
};

export const migrateDocumentTemplatesFromFiles = () => {
  return apiClient.post(API_ENDPOINT.DOCUMENT_TEMPLATES.MIGRATE_FROM_FILES);
};

// Template Editor APIs - New functions for auto-detect, validate, render
export const extractPlaceholdersFromTemplate = (htmlContent) => {
  return apiClient.post(API_ENDPOINT.DOCUMENT_TEMPLATES.EXTRACT_PLACEHOLDERS, {
    htmlContent,
  });
};

export const getDocumentTemplateWithPlaceholders = (id) => {
  return apiClient.get(
    API_ENDPOINT.DOCUMENT_TEMPLATES.GET_WITH_PLACEHOLDERS(id)
  );
};

export const validateTemplateData = (id, data) => {
  return apiClient.post(API_ENDPOINT.DOCUMENT_TEMPLATES.VALIDATE(id), data);
};

export const renderDocumentTemplate = (id, data) => {
  return apiClient.post(API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER(id), data, {
    responseType: "text",
  });
};

export const renderDocumentTemplateByCode = (code, data) => {
  return apiClient.post(
    API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER_BY_CODE(code),
    data,
    {
      responseType: "text",
    }
  );
};

export const getSchemaEntities = () => {
  return apiClient.get(API_ENDPOINT.DOCUMENT_TEMPLATES.GET_SCHEMA_ENTITIES);
};
