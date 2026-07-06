// src/router/AppRouter.jsx
// Định nghĩa toàn bộ routes của ứng dụng.
// Để thêm bộ phận mới: chỉ cần thêm <Route> ở đây và card ở Landing page.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '../pages/Landing';
import PreProcessingPage from '../pages/PreProcessing';
import FurnacePage from '../pages/Furnace';
import PostProcessingPage from '../pages/PostProcessing';

/**
 * AppRouter – Bộ định tuyến trung tâm của ứng dụng.
 * Routes:
 *   /                  → LandingPage (chọn bộ phận)
 *   /pre-processing    → Trước Xử Lý
 *   /furnace           → Lò
 *   /post-processing   → Sau Xử Lý
 *   *                  → Redirect về /
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pre-processing" element={<PreProcessingPage />} />
        <Route path="/furnace" element={<FurnacePage />} />
        <Route path="/post-processing" element={<PostProcessingPage />} />
        {/* Mọi route không tồn tại đều redirect về trang chọn bộ phận */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
