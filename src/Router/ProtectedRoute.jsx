import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { showErrorAlert } from "../utils/sweetAlert";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "loading:",
    loading,
    "user role:",
    user?.role
  );

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with the attempted location
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const hasAccess = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasAccess) {
      console.log(
        "Access denied - User role:",
        userRole,
        "Required roles:",
        allowedRoles
      );
      showErrorAlert(
        "Truy cập bị từ chối",
        "Bạn không có quyền truy cập trang này"
      );
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render the protected component
  return children;
};

export default ProtectedRoute;
