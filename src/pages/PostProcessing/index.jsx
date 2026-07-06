// src/pages/PostProcessing/index.jsx
// Trang đăng ký tăng ca — Bộ phận Sau Xử Lý

import React from 'react';
import OvertimePage from '../../components/OvertimePage';
import { postProcessingEmployees } from '../../data/postProcessingEmployees';

function PostProcessingPage() {
  return (
    <OvertimePage
      departmentId="post-processing"
      departmentName="Sau Xử Lý"
      initialEmployeeList={postProcessingEmployees}
    />
  );
}

export default PostProcessingPage;
