import axios from "axios";
import API_ENDPOINT from "../Constant/apiEndpoint.constant";
import { AuthCookies } from "../utils/cookieUtils";

// Get token from cookies (same as ApiService.jsx)
const getToken = () => {
  // Try to get token from cookies first (for authenticated users)
  let token = AuthCookies.getToken();

  // If not in cookies, check localStorage (for first-time login users)
  if (!token) {
    token = localStorage.getItem("accessToken");
  }

  return token;
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

/**
 * Template Service - Quản lý Document Templates với Template Editor
 * Hỗ trợ: auto-detect placeholders, validate, render templates
 */

class TemplateService {
  /**
   * Tự động phát hiện placeholders từ HTML content
   * @param {string} htmlContent - HTML content chứa placeholders {{VariableName}}
   * @returns {Promise<string[]>} - Mảng các placeholder names
   */
  async extractPlaceholders(htmlContent) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.EXTRACT_PLACEHOLDERS}`,
        { htmlContent },
        { headers: getAuthHeaders() }
      );
      return response.data.placeholders || [];
    } catch (error) {
      console.error("Error extracting placeholders:", error);
      throw error;
    }
  }

  /**
   * Lấy template kèm theo danh sách placeholders đã được tự động phát hiện
   * @param {number} id - Template ID
   * @returns {Promise<{template, detectedPlaceholders, placeholderCount}>}
   */
  async getTemplateWithPlaceholders(id) {
    try {
      const response = await axios.get(
        `${
          API_ENDPOINT.BASE_URL
        }${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_WITH_PLACEHOLDERS(id)}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting template with placeholders:", error);
      throw error;
    }
  }

  /**
   * Validate dữ liệu trước khi render template
   * @param {number} id - Template ID
   * @param {Object} data - Dữ liệu để validate
   * @returns {Promise<{isValid: boolean, missingPlaceholders?: string[]}>}
   */
  async validateTemplateData(id, data) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.VALIDATE(
          id
        )}`,
        data,
        { headers: getAuthHeaders() }
      );
      return { isValid: true };
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          isValid: false,
          missingPlaceholders: error.response.data.missingPlaceholders || [],
        };
      }
      console.error("Error validating template data:", error);
      throw error;
    }
  }

  /**
   * Render template theo ID với dữ liệu động
   * @param {number} id - Template ID
   * @param {Object} data - Dữ liệu để render (key-value pairs)
   * @returns {Promise<string>} - HTML đã render
   */
  async renderTemplate(id, data) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER(id)}`,
        data,
        {
          headers: getAuthHeaders(),
          responseType: "text",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rendering template:", error);
      throw error;
    }
  }

  /**
   * Render template theo code thay vì ID
   * @param {string} code - Template code (VD: SALARY_NOTIFY_V2)
   * @param {Object} data - Dữ liệu để render
   * @returns {Promise<string>} - HTML đã render
   */
  async renderTemplateByCode(code, data) {
    try {
      const response = await axios.post(
        `${
          API_ENDPOINT.BASE_URL
        }${API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER_BY_CODE(code)}`,
        data,
        {
          headers: getAuthHeaders(),
          responseType: "text",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rendering template by code:", error);
      throw error;
    }
  }

  /**
   * Tạo template mới
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} - Template đã tạo
   */
  async createTemplate(templateData) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.CREATE}`,
        templateData,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }

  /**
   * Lấy tất cả templates
   * @param {string} type - Filter theo template type (optional)
   * @returns {Promise<Array>} - Danh sách templates
   */
  async getTemplates(type = null) {
    try {
      let url = `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_ALL}`;
      if (type) {
        url += `?type=${type}`;
      }
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting templates:", error);
      throw error;
    }
  }

  /**
   * Lấy template theo ID
   * @param {number} id - Template ID
   * @returns {Promise<Object>} - Template data
   */
  async getTemplate(id) {
    try {
      const response = await axios.get(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_BY_ID(
          id
        )}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting template:", error);
      throw error;
    }
  }

  /**
   * Lấy template theo code
   * @param {string} code - Template code
   * @returns {Promise<Object>} - Template data
   */
  async getTemplateByCode(code) {
    try {
      const response = await axios.get(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_BY_CODE(
          code
        )}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting template by code:", error);
      throw error;
    }
  }

  /**
   * Update template
   * @param {number} id - Template ID
   * @param {Object} templateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} - Template đã cập nhật
   */
  async updateTemplate(id, templateData) {
    try {
      const response = await axios.put(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.UPDATE(id)}`,
        templateData,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }

  /**
   * Xóa template
   * @param {number} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    try {
      await axios.delete(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.DELETE(id)}`,
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách template types
   * @returns {Promise<Array>} - Danh sách types
   */
  async getTemplateTypes() {
    try {
      const response = await axios.get(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_TYPES}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error getting template types:", error);
      throw error;
    }
  }

  /**
   * Set template làm default
   * @param {number} id - Template ID
   * @returns {Promise<Object>}
   */
  async setDefaultTemplate(id) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.SET_DEFAULT(
          id
        )}`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error setting default template:", error);
      throw error;
    }
  }

  // ============================================================
  // 🆕 NEW: SCHEMA APIs
  // ============================================================

  /**
   * Lấy available placeholders theo template type
   * @param {string} templateType - 'contract', 'quote', 'invoice', etc.
   * @returns {Promise<Object>} - EntityPlaceholders object
   */
  async getAvailablePlaceholders(templateType) {
    try {
      const response = await axios.get(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_SCHEMA_PLACEHOLDERS}`,
        {
          params: { templateType },
          headers: getAuthHeaders(),
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching placeholders:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải danh sách placeholders"
      );
    }
  }

  /**
   * Lấy placeholders của một entity cụ thể
   * @param {string} entityName - 'Contract', 'Customer', 'SaleOrder', etc.
   * @returns {Promise<Array>} - Mảng PlaceholderField objects
   */
  async getPlaceholdersForEntity(entityName) {
    try {
      const response = await axios.get(
        `${
          API_ENDPOINT.BASE_URL
        }${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_ENTITY_PLACEHOLDERS(
          entityName
        )}`,
        { headers: getAuthHeaders() }
      );
      return response.data.placeholders;
    } catch (error) {
      console.error(`Error fetching placeholders for ${entityName}:`, error);
      throw new Error(
        error.response?.data?.message ||
          `Không thể tải placeholders của ${entityName}`
      );
    }
  }

  /**
   * Lấy danh sách tất cả entities
   * @returns {Promise<Array>} - Mảng entity names
   */
  async getAvailableEntities() {
    try {
      const response = await axios.get(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.GET_SCHEMA_ENTITIES}`,
        { headers: getAuthHeaders() }
      );
      return response.data.entities;
    } catch (error) {
      console.error("Error fetching entities:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải danh sách entities"
      );
    }
  }

  /**
   * Validate placeholders có hợp lệ với template type không
   * @param {Array<string>} placeholders - Mảng placeholder strings
   * @param {string} templateType - Template type
   * @returns {Promise<Object>} - ValidationResult object
   */
  async validatePlaceholderSchema(placeholders, templateType) {
    try {
      const response = await axios.post(
        `${API_ENDPOINT.BASE_URL}${API_ENDPOINT.DOCUMENT_TEMPLATES.VALIDATE_PLACEHOLDER_SCHEMA}`,
        { placeholders, templateType },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
      console.error("Error validating placeholders:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi validate placeholders"
      );
    }
  }

  // ============================================================
  // 🆕 NEW: RENDER với Object Data
  // ============================================================

  /**
   * Render template với structured object data
   * @param {number} templateId - Template ID
   * @param {Object} data - Structured data (nested objects)
   * @returns {Promise<string>} - HTML đã render
   */
  async renderTemplateWithObject(templateId, data) {
    try {
      const response = await axios.post(
        `${
          API_ENDPOINT.BASE_URL
        }${API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER_WITH_OBJECT(templateId)}`,
        data,
        {
          headers: getAuthHeaders(),
          responseType: "text",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rendering template:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi render template"
      );
    }
  }

  /**
   * Render template by code với object data
   * @param {string} templateCode - Template code
   * @param {Object} data - Structured data
   * @returns {Promise<string>} - HTML đã render
   */
  async renderTemplateWithObjectByCode(templateCode, data) {
    try {
      const response = await axios.post(
        `${
          API_ENDPOINT.BASE_URL
        }${API_ENDPOINT.DOCUMENT_TEMPLATES.RENDER_WITH_OBJECT_BY_CODE(
          templateCode
        )}`,
        data,
        {
          headers: getAuthHeaders(),
          responseType: "text",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error rendering template:", error);
      throw new Error(
        error.response?.data?.message || "Lỗi khi render template"
      );
    }
  }
}

// Export singleton instance
export const templateService = new TemplateService();
export default templateService;
