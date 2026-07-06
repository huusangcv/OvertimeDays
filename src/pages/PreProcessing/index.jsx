// src/pages/PreProcessing/index.jsx
// Trang đăng ký tăng ca — Bộ phận Trước Xử Lý

import React from 'react';
import OvertimePage from '../../components/OvertimePage';
import { preProcessingEmployees } from '../../data/preProcessingEmployees';

function PreProcessingPage() {
  return (
    <OvertimePage
      departmentId="pre-processing"
      departmentName="Trước Xử Lý"
      initialEmployeeList={preProcessingEmployees}
    />
  );
}

export default PreProcessingPage;
