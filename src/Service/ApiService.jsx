import axios from "axios";
import API_ENDPOINT from "../Constant/apiEndpoint.constant";
import { AuthCookies } from "../utils/cookieUtils";

// Token management utilities using cookies
const getToken = () => {
  return AuthCookies.getToken();
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
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
    console.log("API Response:", response);
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
        window.location.href = "/login";
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
        window.location.href = "/login";
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

export const getSessions = () => {
  return apiClient.get(API_ENDPOINT.AUTH.GET_SESSIONS);
};

export const revokeSession = (id) => {
  return apiClient.post(API_ENDPOINT.AUTH.REVOKE_SESSION(id));
};

export const revokeAllSessions = () => {
  return apiClient.post(API_ENDPOINT.AUTH.REVOKE_ALL_SESSIONS);
};

// =============================
// CUSTOMERS APIs
// =============================
export const getAllCustomers = () => {
  return apiClient.get(API_ENDPOINT.CUSTOMERS.GET_ALL);
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
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_ALL);
};

export const createContract = (contractData) => {
  return apiClient.post(API_ENDPOINT.CONTRACTS.CREATE, contractData);
};

export const getContractById = (id) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_BY_ID(id));
};

export const updateContract = (id, contractData) => {
  return apiClient.put(API_ENDPOINT.CONTRACTS.UPDATE(id), contractData);
};

export const deleteContract = (id) => {
  return apiClient.delete(API_ENDPOINT.CONTRACTS.DELETE(id));
};

export const getContractsByCustomer = (customerId) => {
  return apiClient.get(API_ENDPOINT.CONTRACTS.GET_BY_CUSTOMER(customerId));
};

// =============================
// TICKETS APIs
// =============================
export const getAllTickets = () => {
  return apiClient.get(API_ENDPOINT.TICKETS.GET_ALL);
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
  return apiClient.post(API_ENDPOINT.TICKET_LOGS.CREATE, logData);
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
