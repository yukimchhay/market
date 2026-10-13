import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PostItem from "./pages/PostItem";
import ListingDetail from "./pages/ListingDetail";
import SellerProfile from "./pages/SellerProfile";
import Messages from "./pages/Messages";
import ConversationThread from "./pages/ConversationThread";
import Favorites from "./pages/Favorites";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminListings from "./pages/admin/AdminListings";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-item"
          element={
            <ProtectedRoute>
              <PostItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <ProtectedRoute>
              <ConversationThread />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="listings" element={<AdminListings />} />
        </Route>
      </Routes>
    </div>
  );
}
