import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Guards routes from unauthenticated access.
 * If the user is not authenticated according to AuthContext,
 * they are redirected to the admin login page.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
