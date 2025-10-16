import axios from 'axios';
import API_ENDPOINT from '../Constant/apiEndpoint.constant';
import { AuthCookies } from '../utils/cookieUtils';

// Token management utilities using cookies
const getToken = () => {
  return AuthCookies.getToken();
};

const removeToken = () => {
  AuthCookies.clearAuth();
  // Trigger custom event for logout
  window.dispatchEvent(new CustomEvent('auth-logout'));
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
    'Content-Type': 'application/json',
  },
});

// Add token to request headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Only remove token if this is not a login request
      if (!error.config?.url?.includes('/login')) {
        removeToken();
        window.location.reload();
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
  return apiClient.patch(API_ENDPOINT.SALE_ORDERS.UPDATE_PROBABILITY(id), probabilityData);
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
