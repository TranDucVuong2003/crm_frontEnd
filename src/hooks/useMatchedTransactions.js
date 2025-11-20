import { useState, useEffect, useCallback } from "react";
import {
  getMatchedTransactions,
  getTransactionsByContract,
  isTransactionMatched,
  markTransactionAsMatched,
  unmatchTransaction,
} from "../utils/matchedTransactionUtils";

/**
 * Custom hook để quản lý matched transactions
 * Tự động refresh khi có thay đổi
 */
export const useMatchedTransactions = (contractId = null) => {
  const [matchedTransactions, setMatchedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load matched transactions
  const loadTransactions = useCallback(() => {
    setLoading(true);
    try {
      const data = contractId
        ? getTransactionsByContract(contractId)
        : getMatchedTransactions();

      // Sort by matchedAt desc
      data.sort(
        (a, b) =>
          new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
      );

      setMatchedTransactions(data);
    } catch (error) {
      console.error("Error loading matched transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Load on mount and when contractId changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Check if transaction is matched
  const checkIsMatched = useCallback((transactionId) => {
    return isTransactionMatched(transactionId);
  }, []);

  // Mark transaction as matched
  const markAsMatched = useCallback(
    (transactionId, contractId, details) => {
      markTransactionAsMatched(transactionId, contractId, details);
      loadTransactions(); // Refresh
    },
    [loadTransactions]
  );

  // Unmatch transaction
  const unmatch = useCallback(
    (transactionId) => {
      unmatchTransaction(transactionId);
      loadTransactions(); // Refresh
    },
    [loadTransactions]
  );

  // Get total amount matched
  const totalAmount = matchedTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount || 0),
    0
  );

  // Get count
  const count = matchedTransactions.length;

  // Get unique contract IDs
  const uniqueContracts = new Set(matchedTransactions.map((t) => t.contractId))
    .size;

  return {
    // Data
    matchedTransactions,
    loading,
    count,
    totalAmount,
    uniqueContracts,

    // Methods
    loadTransactions,
    checkIsMatched,
    markAsMatched,
    unmatch,
  };
};

/**
 * Hook để filter ra unmapped transactions từ danh sách
 * Dùng trong MapPaymentModal để chỉ hiển thị giao dịch chưa match
 */
export const useUnmappedTransactions = (allTransactions = []) => {
  const [unmappedTransactions, setUnmappedTransactions] = useState([]);

  useEffect(() => {
    if (allTransactions.length === 0) {
      setUnmappedTransactions([]);
      return;
    }

    const filtered = allTransactions.filter(
      (transaction) => !isTransactionMatched(transaction.id)
    );

    setUnmappedTransactions(filtered);
  }, [allTransactions]);

  return unmappedTransactions;
};

/**
 * Hook để format currency và date
 */
export const useTransactionFormatters = () => {
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatShortDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  return {
    formatCurrency,
    formatDate,
    formatShortDate,
  };
};

/**
 * EXAMPLE USAGE:
 */

/*

// 1. Trong MatchedTransactionsManager.jsx
const MatchedTransactionsManager = () => {
  const {
    matchedTransactions,
    loading,
    count,
    totalAmount,
    unmatch
  } = useMatchedTransactions();

  const { formatCurrency, formatDate } = useTransactionFormatters();

  return (
    <div>
      <h1>Total: {count} transactions</h1>
      <h2>Amount: {formatCurrency(totalAmount)}</h2>
      
      {matchedTransactions.map(t => (
        <div key={t.transactionId}>
          <span>{formatDate(t.matchedAt)}</span>
          <button onClick={() => unmatch(t.transactionId)}>Unmatch</button>
        </div>
      ))}
    </div>
  );
};


// 2. Trong ContractMatchedTransactions.jsx
const ContractMatchedTransactions = ({ contractId }) => {
  const { 
    matchedTransactions, 
    loading, 
    totalAmount 
  } = useMatchedTransactions(contractId);

  const { formatCurrency } = useTransactionFormatters();

  if (loading) return <div>Loading...</div>;
  if (matchedTransactions.length === 0) return null;

  return (
    <div>
      <h3>Payment History</h3>
      {matchedTransactions.map(t => (
        <div key={t.transactionId}>
          {formatCurrency(t.amount)}
        </div>
      ))}
      <div>Total: {formatCurrency(totalAmount)}</div>
    </div>
  );
};


// 3. Trong MapPaymentModal.jsx
const MapPaymentModal = ({ contractId, ... }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  
  // Hook tự động filter ra unmapped transactions
  const unmappedTransactions = useUnmappedTransactions(allTransactions);

  const { markAsMatched } = useMatchedTransactions();

  const handleMapPayment = async () => {
    // ... match payment logic ...
    
    // Mark as matched
    markAsMatched(selectedTransaction.id, contractId, {
      referenceNumber: selectedTransaction.reference_number,
      amount: transactionAmount,
      status: newStatus
    });
  };

  return (
    <div>
      {unmappedTransactions.map(t => (
        <div key={t.id}>{t.amount_in}</div>
      ))}
    </div>
  );
};

*/
