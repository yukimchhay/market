import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-24 text-center text-jade-600">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
