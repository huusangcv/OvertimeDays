// src/router/AppRouter.jsx
// Định nghĩa toàn bộ routes của ứng dụng.
// Để thêm bộ phận mới: admin thêm vào Firestore, trang Landing tự tải động.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import AdminRoute from '../components/admin/AdminRoute';
import AdminLayout from '../pages/Admin/layout/AdminLayout';

import LandingPage from '../pages/Landing';
import PreProcessingPage from '../pages/PreProcessing';
import FurnacePage from '../pages/Furnace';
import PostProcessingPage from '../pages/PostProcessing';
import DynamicDepartmentPage from '../pages/DynamicDepartment';

import AdminLoginPage from '../pages/Admin/Login';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminDepartments from '../pages/Admin/Departments';
import AdminEmployees from '../pages/Admin/Employees';
import AdminCategories from '../pages/Admin/Categories';
import AdminAccounts from '../pages/Admin/Accounts';
import AdminOvertimes from '../pages/Admin/Overtimes';
import AdminSettings from '../pages/Admin/Settings';
import AdminAudit from '../pages/Admin/Audit';

/**
 * AppRouter – Bộ định tuyến trung tâm của ứng dụng.
 * Routes:
 *   /                    → LandingPage (chọn bộ phận)
 *   /furnace             → Lò
 *   /pre-processing      → Trước Xử Lý
 *   /post-processing     → Sau Xử Lý
 *   /dept/:departmentId  → Bộ phận động (tải từ Firestore)
 *   /admin/login         → Admin Login
 *   /admin               → Admin Dashboard (protected)
 *   /admin/departments   → Quản lý bộ phận
 *   /admin/employees     → Quản lý nhân viên
 *   /admin/categories    → Quản lý danh mục
 *   /admin/accounts      → Tài khoản & Phân quyền
 *   /admin/overtimes     → Biểu tăng ca toàn công ty
 *   /admin/settings      → Cài đặt hệ thống
 */
function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ─────────────────────── */}
          <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/furnace" element={<FurnacePage />} />
          <Route path="/pre-processing" element={<PreProcessingPage />} />
          <Route path="/post-processing" element={<PostProcessingPage />} />
          {/* Dynamic department route */}
          <Route path="/dept/:departmentId" element={<DynamicDepartmentPage />} />

          {/* ── Admin Login ─────────────────────── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ── Protected Admin Routes ─────────── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="overtimes" element={<AdminOvertimes />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>

          {/* ── Catch-all → home ────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
