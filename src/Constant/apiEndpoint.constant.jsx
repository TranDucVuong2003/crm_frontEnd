console.log('Environment BASE_URL:', import.meta.env.VITE_BASE_URL);

const API_ENDPOINT = {
    BASE_URL: import.meta.env.VITE_BASE_URL,
    AUTH: {
        LOGIN: '/api/Auth/login',
        REGISTER: '/api/Auth/register',
    },
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
    DEALS: {
        GET_ALL: '/api/Deals',
        CREATE: '/api/Deals',
        GET_BY_STAGE: (stage) => `/api/Deals/by-stage/${stage}`,
        GET_BY_CUSTOMER: (customerId) => `/api/Deals/by-customer/${customerId}`,
        GET_ASSIGNED_TO: (userId) => `/api/Deals/assigned-to/${userId}`,
        GET_PIPELINE: '/api/Deals/pipeline',
        GET_BY_ID: (id) => `/api/Deals/${id}`,
        UPDATE: (id) => `/api/Deals/${id}`,
        DELETE: (id) => `/api/Deals/${id}`,
        UPDATE_STAGE: (id) => `/api/Deals/${id}/stage`,
        UPDATE_PROBABILITY: (id) => `/api/Deals/${id}/probability`,
    },
    USERS: {
        GET_ALL: '/api/Users',
        CREATE: '/api/Users',
        GET_BY_ID: (id) => `/api/Users/${id}`,
        UPDATE: (id) => `/api/Users/${id}`,
        DELETE: (id) => `/api/Users/${id}`,
    },
}

export default API_ENDPOINT;
