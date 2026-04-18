import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./authUtils";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;

