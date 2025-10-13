import axios from 'axios';
import API_ENDPOINT from '../Constant/apiEndpoint.constant';

// Token management utilities (you may need to create these)
const getToken = () => {
  return localStorage.getItem('authToken');
};

const removeToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth');
  // Trigger custom event for logout
  window.dispatchEvent(new CustomEvent('auth-logout'));
};


const setToken = (token) => {
  localStorage.setItem('authToken', token);
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

export const register = (registerData) => {
  return apiClient.post(API_ENDPOINT.AUTH.REGISTER, registerData);
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
// DEALS APIs
// =============================
export const getAllDeals = () => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_ALL);
};

export const createDeal = (dealData) => {
  return apiClient.post(API_ENDPOINT.DEALS.CREATE, dealData);
};

export const getDealsByStage = (stage) => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_BY_STAGE(stage));
};

export const getDealsByCustomer = (customerId) => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_BY_CUSTOMER(customerId));
};

export const getDealsAssignedTo = (userId) => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_ASSIGNED_TO(userId));
};

export const getDealsPipeline = () => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_PIPELINE);
};

export const getDealById = (id) => {
  return apiClient.get(API_ENDPOINT.DEALS.GET_BY_ID(id));
};

export const updateDeal = (id, dealData) => {
  return apiClient.put(API_ENDPOINT.DEALS.UPDATE(id), dealData);
};

export const deleteDeal = (id) => {
  return apiClient.delete(API_ENDPOINT.DEALS.DELETE(id));
};

export const updateDealStage = (id, stageData) => {
  return apiClient.patch(API_ENDPOINT.DEALS.UPDATE_STAGE(id), stageData);
};

export const updateDealProbability = (id, probabilityData) => {
  return apiClient.patch(API_ENDPOINT.DEALS.UPDATE_PROBABILITY(id), probabilityData);
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
