import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to the intended page or dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    console.log("🔍 PublicRoute - User authenticated, redirecting to:", from);
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the public component (login page)
  return children;
};

export default PublicRoute;
