console.log('Environment BASE_URL:', import.meta.env.VITE_BASE_URL);

const API_ENDPOINT = {
    BASE_URL: import.meta.env.VITE_BASE_URL,
    
    // Auth endpoints
    AUTH: {
        LOGIN: '/api/Auth/login',
    },
    
    // Addons endpoints
    ADDONS: {
        GET_ALL: '/api/Addons',
        CREATE: '/api/Addons',
        GET_ACTIVE: '/api/Addons/active',
        GET_BY_TYPE: (type) => `/api/Addons/by-type/${type}`,
        GET_BY_ID: (id) => `/api/Addons/${id}`,
        UPDATE: (id) => `/api/Addons/${id}`,
        DELETE: (id) => `/api/Addons/${id}`,
    },
    
    // Customers endpoints
    CUSTOMERS: {
        GET_ALL: '/api/Customers',
        CREATE: '/api/Customers',
        GET_ACTIVE: '/api/Customers/active',
        GET_BY_ID: (id) => `/api/Customers/${id}`,
        UPDATE: (id) => `/api/Customers/${id}`,
        PATCH: (id) => `/api/Customers/${id}`,
        DELETE: (id) => `/api/Customers/${id}`,
        TOGGLE_STATUS: (id) => `/api/Customers/${id}/toggle-status`,
        GET_BY_TYPE: (customerType) => `/api/Customers/by-type/${customerType}`,
        GET_TYPE_STATISTICS: '/api/Customers/type-statistics',
        GET_INDIVIDUALS: '/api/Customers/individuals',
        GET_COMPANIES: '/api/Customers/companies',
    },
    
    // SaleOrders endpoints
    SALE_ORDERS: {
        GET_ALL: '/api/SaleOrders',
        CREATE: '/api/SaleOrders',
        GET_BY_CUSTOMER: (customerId) => `/api/SaleOrders/by-customer/${customerId}`,
        GET_STATISTICS: '/api/SaleOrders/statistics',
        GET_BY_ID: (id) => `/api/SaleOrders/${id}`,
        UPDATE: (id) => `/api/SaleOrders/${id}`,
        DELETE: (id) => `/api/SaleOrders/${id}`,
        UPDATE_PROBABILITY: (id) => `/api/SaleOrders/${id}/probability`,
    },
    
    // Services endpoints
    SERVICES: {
        GET_ALL: '/api/Services',
        CREATE: '/api/Services',
        GET_ACTIVE: '/api/Services/active',
        GET_BY_CATEGORY: (category) => `/api/Services/by-category/${category}`,
        GET_BY_ID: (id) => `/api/Services/${id}`,
        UPDATE: (id) => `/api/Services/${id}`,
        DELETE: (id) => `/api/Services/${id}`,
    },
    
    // Users endpoints
    USERS: {
        GET_ALL: '/api/Users',
        CREATE: '/api/Users',
        GET_BY_ID: (id) => `/api/Users/${id}`,
        UPDATE: (id) => `/api/Users/${id}`,
        DELETE: (id) => `/api/Users/${id}`,
    },
}

export default API_ENDPOINT;
