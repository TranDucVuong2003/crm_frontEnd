console.log("Environment BASE_URL:", import.meta.env.VITE_BASE_URL);

const API_ENDPOINT = {
  BASE_URL: import.meta.env.VITE_BASE_URL,

  // Auth endpoints
  AUTH: {
    LOGIN: "/api/Auth/login",
    REFRESH_TOKEN: "/api/Auth/refresh-token",
    LOGOUT: "/api/Auth/logout",
    GET_SESSIONS: "/api/Auth/sessions",
    REVOKE_SESSION: (id) => `/api/Auth/revoke-session/${id}`,
    REVOKE_ALL_SESSIONS: "/api/Auth/revoke-all-sessions",
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

  // Test endpoints
  TEST: {
    SEND_TEST_EMAIL: (ticketId) => `/api/Test/send-test-email/${ticketId}`,
    GET_TICKET_EMAIL_INFO: (ticketId) =>
      `/api/Test/ticket-email-info/${ticketId}`,
    GET_EMAIL_CONFIG_STATUS: "/api/Test/email-config-status",
    DEBUG_USER_CLAIMS: "/api/Test/debug-user-claims",
  },
};

export default API_ENDPOINT;
