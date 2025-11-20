/**
 * Utility functions for managing matched transactions
 * Sử dụng localStorage để lưu trữ tạm thời cho đến khi backend implement API
 */

const MATCHED_TRANSACTIONS_KEY = "matchedTransactions";

/**
 * Lấy tất cả matched transactions từ localStorage
 * @returns {Array} Danh sách matched transactions
 */
export const getMatchedTransactions = () => {
  try {
    const stored = localStorage.getItem(MATCHED_TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading matched transactions:", error);
    return [];
  }
};

/**
 * Lấy danh sách IDs của transactions đã match
 * @returns {Array<string>} Danh sách transaction IDs
 */
export const getMatchedTransactionIds = () => {
  const matched = getMatchedTransactions();
  return matched.map((m) => m.transactionId);
};

/**
 * Kiểm tra một transaction đã được match chưa
 * @param {string} transactionId - ID của transaction
 * @returns {boolean}
 */
export const isTransactionMatched = (transactionId) => {
  const matchedIds = getMatchedTransactionIds();
  return matchedIds.includes(transactionId);
};

/**
 * Đánh dấu một transaction đã được match
 * @param {string} transactionId - ID của transaction
 * @param {number} contractId - ID của contract đã match
 * @param {Object} details - Thông tin chi tiết (referenceNumber, amount, status, etc.)
 */
export const markTransactionAsMatched = (
  transactionId,
  contractId,
  details = {}
) => {
  try {
    const matched = getMatchedTransactions();

    // Kiểm tra xem transaction đã được match chưa
    const existingIndex = matched.findIndex(
      (m) => m.transactionId === transactionId
    );

    if (existingIndex === -1) {
      // Thêm mới
      matched.push({
        transactionId,
        contractId,
        matchedAt: new Date().toISOString(),
        ...details,
      });

      localStorage.setItem(MATCHED_TRANSACTIONS_KEY, JSON.stringify(matched));
      console.log(`✅ Marked transaction ${transactionId} as matched`);
    } else {
      console.log(`ℹ️ Transaction ${transactionId} already marked as matched`);
    }
  } catch (error) {
    console.error("Error saving matched transaction:", error);
  }
};

/**
 * Lấy thông tin chi tiết của một matched transaction
 * @param {string} transactionId - ID của transaction
 * @returns {Object|null} Thông tin matched transaction hoặc null
 */
export const getMatchedTransactionDetails = (transactionId) => {
  const matched = getMatchedTransactions();
  return matched.find((m) => m.transactionId === transactionId) || null;
};

/**
 * Lấy tất cả transactions đã match với một contract
 * @param {number} contractId - ID của contract
 * @returns {Array} Danh sách matched transactions
 */
export const getTransactionsByContract = (contractId) => {
  const matched = getMatchedTransactions();
  return matched.filter((m) => m.contractId === contractId);
};

/**
 * Xóa một matched transaction (Admin only - use with caution)
 * @param {string} transactionId - ID của transaction cần xóa
 */
export const unmatchTransaction = (transactionId) => {
  try {
    const matched = getMatchedTransactions();
    const filtered = matched.filter((m) => m.transactionId !== transactionId);
    localStorage.setItem(MATCHED_TRANSACTIONS_KEY, JSON.stringify(filtered));
    console.log(`🗑️ Unmatched transaction ${transactionId}`);
  } catch (error) {
    console.error("Error unmatching transaction:", error);
  }
};

/**
 * Clear tất cả matched transactions (Admin only - use with caution)
 */
export const clearAllMatchedTransactions = () => {
  try {
    localStorage.removeItem(MATCHED_TRANSACTIONS_KEY);
    console.log("🗑️ Cleared all matched transactions");
  } catch (error) {
    console.error("Error clearing matched transactions:", error);
  }
};

/**
 * Export dữ liệu matched transactions (để backup hoặc migrate lên server)
 * @returns {string} JSON string của matched transactions
 */
export const exportMatchedTransactions = () => {
  const matched = getMatchedTransactions();
  return JSON.stringify(matched, null, 2);
};

/**
 * Import dữ liệu matched transactions (để restore từ backup)
 * @param {string} jsonData - JSON string của matched transactions
 */
export const importMatchedTransactions = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    localStorage.setItem(MATCHED_TRANSACTIONS_KEY, JSON.stringify(data));
    console.log(`✅ Imported ${data.length} matched transactions`);
  } catch (error) {
    console.error("Error importing matched transactions:", error);
  }
};

// ============ BACKEND API INTEGRATION (For future implementation) ============

/**
 * TODO: Backend API endpoints cần implement:
 *
 * 1. POST /api/Contracts/{contractId}/map-payment
 *    Body: { transactionId, referenceNumber, amount, transactionDate, transactionContent, bankBrandName }
 *    Response: { success: true, matchedTransaction: {...} }
 *
 * 2. GET /api/MatchedTransactions/by-contract/{contractId}
 *    Response: { data: [...matchedTransactions] }
 *
 * 3. GET /api/MatchedTransactions/check/{transactionId}
 *    Response: { isMatched: true, contractId: 123, matchedAt: "..." }
 *
 * 4. DELETE /api/MatchedTransactions/{id}
 *    Response: { success: true }
 *
 * 5. GET /api/Transactions/unmapped
 *    Response: { data: [...unmappedTransactions] }
 *    (Backend filter ra transactions chưa match)
 */

/**
 * Khi backend ready, thay thế localStorage bằng API calls:
 */

/*
// Example: Check if transaction is matched via API
export const isTransactionMatchedAPI = async (transactionId) => {
  try {
    const response = await axios.get(`/api/MatchedTransactions/check/${transactionId}`);
    return response.data.isMatched;
  } catch (error) {
    console.error("Error checking transaction:", error);
    return false;
  }
};

// Example: Mark transaction as matched via API
export const markTransactionAsMatchedAPI = async (transactionId, contractId, details) => {
  try {
    const response = await axios.post(`/api/Contracts/${contractId}/map-payment`, {
      transactionId,
      ...details
    });
    return response.data;
  } catch (error) {
    console.error("Error marking transaction:", error);
    throw error;
  }
};
*/
