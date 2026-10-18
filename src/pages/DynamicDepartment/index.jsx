import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OvertimePage from '../../components/OvertimePage';
import { getDepartmentById, getDepartments } from '../../services/departmentService';
import { furnaceEmployees } from '../../data/furnaceEmployees';
import { preProcessingEmployees } from '../../data/preProcessingEmployees';
import { postProcessingEmployees } from '../../data/postProcessingEmployees';

const INITIAL_EMPLOYEES_MAP = {
  'furnace': furnaceEmployees,
  'pre-processing': preProcessingEmployees,
  'post-processing': postProcessingEmployees,
};

export default function DynamicDepartmentPage() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchDept() {
      setLoading(true);
      setError('');
      try {
        let dept = await getDepartmentById(departmentId);
        if (!dept) {
          const all = await getDepartments({ activeOnly: false });
          dept = all.find((d) => d.id === departmentId);
        }

        if (cancelled) return;

        if (dept) {
          setDepartment(dept);
        } else {
          setError(`Không tìm thấy bộ phận "${departmentId}" trong hệ thống.`);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Lỗi khi tải thông tin bộ phận: ' + (err.message || ''));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (departmentId) {
      fetchDept();
    }

    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Đang tải dữ liệu bộ phận...
        </Typography>
      </Box>
    );
  }

  if (error || !department) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, p: 3 }}>
        <Typography variant="h6" color="error">
          {error || 'Bộ phận không tồn tại'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Về trang chủ chọn bộ phận
        </Button>
      </Box>
    );
  }

  const initialList = INITIAL_EMPLOYEES_MAP[department.id] || [];

  return (
    <OvertimePage
      departmentId={department.id}
      departmentName={department.name}
      initialEmployeeList={initialList}
    />
  );
}
