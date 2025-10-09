import axios from 'axios';
import API_ENDPOINT from '../Constant/apiEndpoint.constant';

// Token management utilities (you may need to create these)
const getToken = () => {
  return localStorage.getItem('authToken');
};

const removeToken = () => {
  localStorage.removeItem('authToken');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // NOTE: Không thể dùng useNavigate ở đây (ngoài React context)
      // Nên chỉ removeToken, việc redirect nên xử lý ở component khi gặp lỗi 401
    }
    return Promise.reject(error);
  }
);

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
