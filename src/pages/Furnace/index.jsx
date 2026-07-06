// src/pages/Furnace/index.jsx
// Trang đăng ký tăng ca — Bộ phận Lò

import React from 'react';
import OvertimePage from '../../components/OvertimePage';
import { furnaceEmployees } from '../../data/furnaceEmployees';

function FurnacePage() {
  return (
    <OvertimePage
      departmentId="furnace"
      departmentName="Lò"
      initialEmployeeList={furnaceEmployees}
    />
  );
}

export default FurnacePage;
