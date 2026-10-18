// src/hooks/useRecordVisit.js
// Hook tự động ghi nhận lượt truy cập khi vào trang bộ phận
// Ngăn chặn ghi trùng do React Strict Mode hoặc re-render nội bộ

import { useEffect, useRef } from 'react';
import { recordDepartmentVisit } from '../services/visitTrackingService';
import { useAuth } from '../context/AuthContext';

export function useRecordVisit(departmentId, departmentName = '') {
  const hasRecordedRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    // Chỉ ghi nhận một lần duy nhất cho mỗi lần mount trang bộ phận này
    if (!departmentId || hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    recordDepartmentVisit(departmentId, departmentName, user);
  }, [departmentId, departmentName, user]);
}
